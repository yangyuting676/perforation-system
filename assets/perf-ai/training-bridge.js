// One active CPU fit on the server. Reattach status after a demo remount.
(()=>{
const runs=new Map();
const reply=(f,c,data)=>{if(f?.isConnected&&f.contentWindow)f.contentWindow.postMessage({type:'perf-ai-train-state',case:c,...data},'*');};
async function request(path,method='GET',body){
 const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),15000);
 try{const response=await fetch(path,{method,signal:controller.signal,headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined,cache:'no-store'});const json=await response.json();if(!response.ok)throw Error(json.error||'训练请求失败');return json;}
 catch(error){if(error.name==='AbortError')throw Error('训练服务连接超时，请检查本地启动器');throw error;}
 finally{clearTimeout(timeout);}
}
async function poll(run){
 clearTimeout(run.timer);if(!run.frame?.isConnected||run.polling)return;run.polling=true;
 try{
  const data=await request('/api/train/'+run.id);if(runs.get(run.case)!==run)return;
  reply(run.frame,run.case,data);
  if(data.state==='completed'){const model=await request('/api/train/'+run.id+'/model');if(runs.get(run.case)===run)reply(run.frame,run.case,{id:run.id,model});run.errors=0;return;}
  if(['failed','cancelled'].includes(data.state))return;
  run.errors=0;run.timer=setTimeout(()=>poll(run),400);
 }catch(error){
  run.errors=(run.errors||0)+1;
  if(run.errors<=3){reply(run.frame,run.case,{id:run.id,state:'starting',message:'正在重新连接训练进度，服务端任务可能仍在运行'});run.timer=setTimeout(()=>poll(run),1000);}
  else reply(run.frame,run.case,{id:run.id,error:error.message});
 }finally{run.polling=false;}
}
window.addEventListener('message',async e=>{
 const d=e.data;if(d?.type!=='perf-ai-train')return;
 const f=[...document.querySelectorAll('#case-demo-root iframe')].find(x=>x.contentWindow===e.source),active=new URLSearchParams(location.hash.split('?')[1]||'').get('case');if(!f||d.case!==active)return;
 try{
  if(d.action==='health'){
   try{reply(f,d.case,{health:await request('/api/health')});}catch{reply(f,d.case,{health:{available:false}});}
   const run=runs.get(d.case);if(run){run.frame=f;poll(run);}return;
  }
  if(d.action==='start'){
   const a=await request('/api/train','POST',{key:d.key,settings:d.settings});
   const old=runs.get(d.case);if(old)clearTimeout(old.timer);
   const run={id:a.id,case:d.case,frame:f,errors:0,timer:null,polling:false};runs.set(d.case,run);reply(f,d.case,a);poll(run);
  }
  if(d.action==='cancel'){
   const run=runs.get(d.case);if(run&&d.job===run.id){const data=await request('/api/train/'+run.id+'/cancel','POST',{});clearTimeout(run.timer);reply(f,d.case,{id:run.id,...data});}
  }
 }catch(error){reply(f,d.case,{error:error.message});}
});
})();
