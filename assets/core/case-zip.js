/* ZIP import and compact synchronous catalog storage. Fully offline. */
(function(g){'use strict';
const MAX=6*1024*1024,MAX_FILES=500,table=new Uint32Array(256);
for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=(c&1)?0xedb88320^(c>>>1):c>>>1;table[n]=c>>>0}
function crc(a){let c=0xffffffff;for(let i=0;i<a.length;i++)c=table[(c^a[i])&255]^(c>>>8);return(c^0xffffffff)>>>0}
function inspect(bytes){
 const v=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength),n=bytes.length;if(n<22)throw Error('ZIP 文件不完整');let end=-1;
 for(let p=n-22;p>=Math.max(0,n-65557);p--)if(v.getUint32(p,true)===0x06054b50&&p+22+v.getUint16(p+20,true)===n){end=p;break}
 if(end<0)throw Error('没有找到有效的 ZIP 目录');if(v.getUint16(end+4,true)||v.getUint16(end+6,true))throw Error('不支持分卷 ZIP');
 const count=v.getUint16(end+10,true),size=v.getUint32(end+12,true),offset=v.getUint32(end+16,true);if(count===65535||size===0xffffffff||offset===0xffffffff)throw Error('请使用普通 ZIP，不使用 ZIP64');
 if(!count||count>MAX_FILES||offset+size!==end||v.getUint16(end+8,true)!==count)throw Error('ZIP 目录或文件数量异常');
 let p=offset,total=0;const entries=[],names=new Set();
 for(let i=0;i<count;i++){
  if(p+46>end||v.getUint32(p,true)!==0x02014b50)throw Error('ZIP 文件目录损坏');
  const flag=v.getUint16(p+8,true),method=v.getUint16(p+10,true),checksum=v.getUint32(p+16,true),compressed=v.getUint32(p+20,true),original=v.getUint32(p+24,true),nl=v.getUint16(p+28,true),extra=v.getUint16(p+30,true),comment=v.getUint16(p+32,true),attrs=v.getUint32(p+38,true),local=v.getUint32(p+42,true);
  if(p+46+nl+extra+comment>end)throw Error('ZIP 文件名或目录长度错误');
  const name=new TextDecoder('utf-8',{fatal:true}).decode(bytes.subarray(p+46,p+46+nl));p+=46+nl+extra+comment;
  if(flag&1)throw Error('请先取消 ZIP 密码保护');if(method!==0&&method!==8)throw Error('仅支持 ZIP 的存储或 Deflate 压缩方式');
  if(name.includes('\\')||name.startsWith('/')||/^[a-z]:/i.test(name)||name.split('/').some(x=>x==='..')||/[\x00-\x1f]/.test(name))throw Error('ZIP 中存在不合法的文件路径');
  if((attrs>>>16&0xf000)===0xa000)throw Error('ZIP 中不允许符号链接');if(names.has(name))throw Error('ZIP 中存在重复文件：'+name);names.add(name);
  if(local+30>offset||v.getUint32(local,true)!==0x04034b50)throw Error('ZIP 文件内容索引损坏');
  const ln=v.getUint16(local+26,true),le=v.getUint16(local+28,true);if(local+30+ln+le+compressed>offset||v.getUint16(local+8,true)!==method||v.getUint16(local+6,true)!==flag)throw Error('ZIP 文件头与目录不一致');
  if(new TextDecoder('utf-8',{fatal:true}).decode(bytes.subarray(local+30,local+30+ln))!==name)throw Error('ZIP 文件名不一致');
  total+=original;if(total>MAX)throw Error('ZIP 解压后的文件总量超过 6 MB');entries.push({name,checksum,original});
 }
 if(p!==end)throw Error('ZIP 目录长度不一致');
 const useful=entries.filter(x=>!x.name.endsWith('/')&&!x.name.startsWith('__MACOSX/')&&!x.name.endsWith('/.DS_Store')&&x.name!=='.DS_Store');
 const manifests=useful.filter(x=>/(^|\/)(case|[a-z0-9._-]+\.case)\.json$/i.test(x.name));if(manifests.length!==1)throw Error('每个 ZIP 必须只包含一个案例清单 case.json；请不要合并多个案例');
 return useful;
}
async function unpack(file){
 if(file.size>MAX)throw Error('ZIP 文件超过 6 MB');const bytes=new Uint8Array(await file.arrayBuffer()),entries=inspect(bytes);
 const unpacked=await new Promise((resolve,reject)=>{let stop;const timer=setTimeout(()=>{if(stop)stop();reject(Error('ZIP 解压超时，请检查压缩包'))},10000);stop=g.fflate.unzip(bytes,(err,data)=>{clearTimeout(timer);err?reject(err):resolve(data)})});
 return entries.map(e=>{const a=unpacked[e.name];if(!a||a.length!==e.original||crc(a)!==e.checksum)throw Error('ZIP 文件校验失败：'+e.name);const f=new File([a],e.name.split('/').pop());Object.defineProperty(f,'webkitRelativePath',{value:e.name});return f});
}
function encodeRecords(list){
 const a=g.fflate.gzipSync(new TextEncoder().encode(JSON.stringify(list)),{level:6}),parts=[];
 for(let start=0;start<a.length;start+=16384){const nums=[];for(let i=start;i<Math.min(start+16384,a.length);i+=2)nums.push(a[i]|((a[i+1]||0)<<8));parts.push(String.fromCharCode.apply(null,nums))}
 return 'GZ16:'+a.length+':'+parts.join('');
}
function decodeRecords(value){
 const m=/^GZ16:(\d+):/.exec(value);if(!m)throw Error('案例存档格式错误');const length=+m[1],s=value.slice(m[0].length);if(length>20*1024*1024||s.length!==Math.ceil(length/2))throw Error('案例存档长度错误');
 const a=new Uint8Array(length);for(let i=0;i<s.length;i++){const c=s.charCodeAt(i);a[i*2]=c&255;if(i*2+1<length)a[i*2+1]=c>>>8}
 const view=new DataView(a.buffer);if(a.length<18||view.getUint32(a.length-4,true)>64*1024*1024)throw Error('案例存档展开体积异常');
 return JSON.parse(new TextDecoder().decode(g.fflate.gunzipSync(a)));
}
g.CaseZip={unpack,inspect,crc,encodeRecords,decodeRecords};
})(globalThis);
