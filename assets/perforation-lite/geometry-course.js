/* Six linked lessons for the existing P2 KNN model. All numbers arrive from its adapter. */
(()=>{
 'use strict';
 const CASE='perforation-viz-p2-334-v2',PREFIX='expanded-course-'+CASE;
 const titles=['先看懂研究对象','看清变量怎样影响结果','把KNN计算过程画出来','解释K值如何选择','完整阅读误差','形成一份研究记录'];
 const questions=['给定器材与地层条件，模型究竟预测哪两个几何量？','保持其他条件不变，一次调整会让穿深L和入口孔径D改变多少？','当前预测具体用了哪几条训练记录，它们各贡献了多少？','改变K会怎样影响当前预测，怎样用训练内部的数据选择K？','在60条独立合成测试记录中，误差有多大，哪些工况值得复核？','怎样保存一次可追溯的计算、选K依据与验证结果？'];
 const names=['能量E','岩石强度UCS','围压σ','套管壁厚t'],units=['kJ','MPa','MPa','mm'];
 let root=null,data=null,criterion=0,selectedTest=0,selectedNeighbor=0,output=0,selectionLog=[],queued=false;
 const E=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;};
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const f=(v,n=3)=>Number.isFinite(v)?v.toFixed(n):'—',signed=v=>(v>0?'+':'')+f(v),node=id=>root?.querySelector('#'+id);
 const table=(headers,rows)=>'<div class="geo-table-scroll"><table><thead><tr>'+headers.map(h=>'<th>'+esc(h)+'</th>').join('')+'</tr></thead><tbody>'+rows.map(r=>'<tr>'+r.map(v=>'<td>'+v+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';
 const button=(action,label,extra='')=>'<button type="button" data-geo-action="'+action+'" '+extra+'>'+esc(label)+'</button>';
 const svg=(body,label,w=900,h=340)=>'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+w+' '+h+'" role="img" aria-label="'+esc(label)+'"><title>'+esc(label)+'</title>'+body+'</svg>';
 const text=(x,y,t,size=16,color='#365966',anchor='start')=>'<text x="'+x+'" y="'+y+'" font-size="'+size+'" fill="'+color+'" text-anchor="'+anchor+'">'+esc(t)+'</text>';
 const line=(x1,y1,x2,y2,color='#9eb5bc',dash='')=>'<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="'+color+'" stroke-width="1.5" stroke-dasharray="'+dash+'"/>';
 const box=(x,y,w,h,fill='#edf5f3')=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="6" fill="'+fill+'" stroke="#cbdeda"/>';
 function frame(){return document.querySelector('#case-demo-root iframe');}
 function command(d){frame()?.contentWindow.postMessage({type:'petro-geometry-command',...d},'*');}
 function best(){return data.cv.rows.reduce((a,b)=>b.metrics[criterion].rmse<a.metrics[criterion].rmse?b:a);}

 // Generated materials provide texture only. Geometry and dimensions stay tied to live predictions.
 function materialCutaway(narrow=false){
  const id=narrow?'geo-material-n':'geo-material-w',steel=narrow?135:200,rock=narrow?215:270,cement=narrow?165:227,right=narrow?585:885;
  const y=102,r=data.prediction[1]*2,end=rock+(narrow?.55:.8)*data.prediction[0],atlas='assets/perforation-lite/figures/geometry-materials-v1.png';
  const pattern=(name,panel,w,h,x)=>'<pattern id="'+id+'-'+name+'" patternUnits="userSpaceOnUse" x="'+x+'" width="'+w+'" height="'+h+'" viewBox="'+(panel*443.5)+' 0 443.5 887" preserveAspectRatio="xMidYMid slice"><image href="'+atlas+'" width="1774" height="887"/></pattern>';
  let z='<defs>'+pattern('water',0,steel-15,220,15)+pattern('steel',1,cement-steel,220,steel)+pattern('cement',2,rock-cement,215,cement)+pattern('rock',3,right-rock,215,rock)
   +'<linearGradient id="'+id+'-cavity" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#160f0a"/><stop offset=".45" stop-color="#241c17" stop-opacity=".95"/><stop offset=".8" stop-color="#68492a" stop-opacity=".82"/><stop offset="1" stop-color="#bc9663" stop-opacity=".64"/></linearGradient>'
   +'<linearGradient id="'+id+'-depth" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#03080a"/><stop offset="1" stop-color="#24373b"/></linearGradient><clipPath id="'+id+'-frame"><rect x="15" y="0" width="'+(right-15)+'" height="215" rx="8"/></clipPath></defs>';
  z+='<g clip-path="url(#'+id+'-frame)">';
  [[15,steel,'water'],[steel,cement,'steel'],[cement,rock,'cement'],[rock,right,'rock']].forEach(([a,b,material])=>{z+='<rect x="'+a+'" width="'+(b-a)+'" height="215" fill="url(#'+id+'-'+material+')"/>';});
  // A tapered illustrative cavity; small edge relief does not claim a simulated fracture field.
  const edge=(sign)=>Array.from({length:31},(_,i)=>{const t=i/30,half=r*Math.pow(1-t,.45),rough=Math.sin(i*2.7)*Math.sin(Math.PI*t)*Math.min(r*.12,2.2);return [rock+(end-rock)*t,y+sign*(half+rough)];});
  const upper=edge(-1),lower=edge(1).reverse(),path='M'+steel+','+(y-r)+'L'+upper.map(v=>v.join(',')).join('L')+'L'+lower.map(v=>v.join(',')).join('L')+'L'+steel+','+(y+r)+'Z';
  z+='<path class="geo-live-tunnel" data-length-mm="'+data.prediction[0]+'" data-diameter-mm="'+data.prediction[1]+'" data-rock-start="'+rock+'" data-tip="'+end+'" d="'+path+'" fill="url(#'+id+'-rock)" stroke="#846139" stroke-width="3"/><path d="'+path+'" fill="url(#'+id+'-cavity)"/>';
  z+='<ellipse cx="'+(steel+2)+'" cy="'+y+'" rx="8" ry="'+(r+3)+'" fill="#a6afb0" stroke="#dbe4e6" stroke-width="1.5"/><ellipse cx="'+(steel+3)+'" cy="'+y+'" rx="5.5" ry="'+r+'" fill="url(#'+id+'-depth)"/>';
  z+='</g>';
  const pill=(x,py,w,label,size=14)=>'<rect x="'+x+'" y="'+py+'" width="'+w+'" height="26" rx="4" fill="#fff" fill-opacity=".94" stroke="#d2e1df"/>'+text(x+w/2,py+18,label,size,'#244f5c','middle');
  z+=pill(narrow?30:55,15,65,'井筒')+pill(steel-(narrow?24:38),15,58,'套管')+pill(cement+5,15,70,'水泥环')+pill(narrow?390:700,15,110,'储层岩石');
  z+=line(steel+10,42,steel+10,61,'#fff')+line((cement+rock)/2,42,(cement+rock)/2,61,'#fff');
  const bracket=(x1,y1,x2,y2)=>{let b='';['#fff','#285e63'].forEach((color,i)=>{const width=i?1.8:5.5;const seg=(a,b,c,d)=>'<path d="M'+a+','+b+'L'+c+','+d+'" fill="none" stroke="'+color+'" stroke-width="'+width+'"/>';b+=seg(x1,y1,x2,y2);if(y1===y2)b+=seg(x1,y1-6,x1,y1+6)+seg(x2,y2-6,x2,y2+6);else b+=seg(x1-6,y1,x1+6,y1)+seg(x2-6,y2,x2+6,y2);});return b;};
  z+=bracket(rock,160,end,160)+pill((rock+end)/2-90,177,180,'地层穿深 L '+f(data.prediction[0],1)+' mm',13);
  z+=bracket(steel-14,y-r,steel-14,y+r)+pill(narrow?22:34,149,narrow?142:150,'入口 D '+f(data.prediction[1],2)+' mm',13);
  z+=line(steel-14,y+r+6,steel-14,139,'#fff')+line(steel-14,139,narrow?100:112,149,'#fff');
  return z;
 }

 function engineering(){
  let s='<defs><marker id="geo-direction" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="#688f92"/></marker></defs>';const arrow=(a,b,c,d)=>line(a,b,c,d).replace('/>',' marker-end="url(#geo-direction)"/>');data.x.forEach((v,i)=>{const x=15+i*225;s+=box(x,12,210,55)+text(x+105,34,names[i],16,'#365966','middle')+text(x+105,56,f(v,1)+' '+units[i],18,'#176e65','middle')+line(x+105,68,x+105,81)+line(x+105,81,450,81);});
  s+=arrow(450,81,450,98)+box(300,98,300,62,'#dcefe9')+text(450,122,'归一化距离加权KNN · K='+data.k,18,'#205f59','middle')+text(450,146,'320条既有训练记录',15,'#466b6e','middle');
  s+=arrow(300,130,235,130)+arrow(600,130,665,130)+box(15,103,220,52)+text(125,126,'预测穿深 L',16,'#365966','middle')+text(125,148,f(data.prediction[0])+' mm',20,'#176e65','middle')+box(665,103,220,52)+text(775,126,'简化入口孔径 D',16,'#365966','middle')+text(775,148,f(data.prediction[1])+' mm',20,'#a36530','middle');
  s+='<g transform="translate(0 185)">'+materialCutaway()+'</g>';
  let mobile='';data.x.forEach((v,i)=>{const x=i%2?310:15,y=i<2?12:87;mobile+=box(x,y,275,60)+text(x+137.5,y+23,names[i],17,'#365966','middle')+text(x+137.5,y+48,f(v,1)+' '+units[i],20,'#176e65','middle');});
  mobile+=line(30,153,30,163)+line(30,163,570,163)+line(570,153,570,163)+arrow(300,163,300,180)+box(110,180,380,64,'#dcefe9')+text(300,206,'归一化距离加权KNN · K='+data.k,20,'#205f59','middle')+text(300,231,'320条既有训练记录',16,'#466b6e','middle');
  mobile+=line(300,244,300,261)+line(152,261,448,261)+arrow(152,261,152,277)+arrow(448,261,448,277);
  [0,1].forEach(j=>{const x=j?310:15;mobile+=box(x,278,275,64)+text(x+137.5,302,j?'简化入口孔径 D':'预测穿深 L',17,'#365966','middle')+text(x+137.5,329,f(data.prediction[j])+' mm',22,j?'#a36530':'#176e65','middle');});
  mobile+='<g transform="translate(0 365)">'+materialCutaway(true)+'</g>';
  return '<div class="geo-wide-figure">'+svg(s,'四个输入经过KNN预测L和D；水体、套管、水泥环与岩石的写实材质示意剖面',900,405)+'</div><div class="geo-narrow-figure">'+svg(mobile,'四个输入与写实材质示意剖面（窄屏）',600,585)+'</div><p class="geo-note geo-material-note">L从地层界面起算；D为简化入口孔径，纵向放大。结构不按比例，孔道轮廓为示意，非侵彻数值模拟；结果属于当前合成教学模型。</p>';

 }
 function comparison(){const b=data.baseline||{x:data.x,k:data.k,prediction:data.prediction};let s='';
  [b,data].forEach((v,i)=>{const y=55+i*85,color=i?'#187c71':'#7c8c94',r=v.prediction[1]*2,end=220+v.prediction[0]*.8;s+=text(16,y+5,i?'当前工况':'基准工况',17,color)+line(220,y-29,220,y+29,'#a3b9b6','4 4')+'<path d="M220 '+(y-r)+'Q'+(end-25)+' '+(y-r*.55)+' '+end+' '+y+'Q'+(end-25)+' '+(y+r*.55)+' 220 '+(y+r)+'Z" fill="'+(i?color:'none')+'" stroke="'+color+'" stroke-width="2" stroke-dasharray="'+(i?'':'6 4')+'"/>'+text(880,y+39,'L '+f(v.prediction[0],2)+' / D '+f(v.prediction[1],2)+' mm',15,color,'end');});
  s+=text(220,213,'共用绘图比例；入口孔径纵向放大，长度从同一地层界面起算。',14);return svg(s,'基准与当前孔道几何对照',900,226);
 }
 function plot(rows,{label,xLabel,yLabel,xMin,xMax,yMin,yMax,identity=false,zero=false,series=1,pick='',selected=-1,colors=['#197c72','#a66a35']}={}){
  const xs=rows.map(r=>r.x),ys=rows.flatMap(r=>r.y);if(xMin===undefined)xMin=Math.min(...xs);if(xMax===undefined)xMax=Math.max(...xs);if(yMin===undefined)yMin=Math.min(...ys);if(yMax===undefined)yMax=Math.max(...ys);
  if(identity){xMin=yMin=Math.min(xMin,yMin);xMax=yMax=Math.max(xMax,yMax);const pad=(xMax-xMin||1)*.07;xMin=yMin=xMin-pad;xMax=yMax=xMax+pad;}
  else{const pad=(yMax-yMin||1)*.1;yMin-=pad;yMax+=pad;}
  if(xMin===xMax){xMin-=1;xMax+=1;}if(yMin===yMax){yMin-=1;yMax+=1;}
  const X=v=>70+(v-xMin)/(xMax-xMin)*550,Y=v=>250-(v-yMin)/(yMax-yMin)*205;let s='';
  const precision=range=>Math.max(0,Math.min(5,Math.ceil(-Math.log10(range/4))+1));
  for(let i=0;i<5;i++){const y=yMin+(yMax-yMin)*i/4;s+=line(70,Y(y),620,Y(y),'#e2eaea')+text(61,Y(y)+4,f(y,precision(yMax-yMin)),13,'#5c7880','end');}
  const discrete=pick==='k'||pick==='cv',ticks=discrete?[3,7,11,15,19,21]:Array.from({length:5},(_,i)=>xMin+(xMax-xMin)*i/4);ticks.forEach(x=>{s+=line(X(x),45,X(x),250,'#e2eaea')+text(X(x),273,f(x,discrete?0:precision(xMax-xMin)),13,'#5c7880','middle');});
  if(identity)s+=line(X(xMin),Y(xMin),X(xMax),Y(xMax),'#a66a35','6 4');if(zero&&yMin<=0&&yMax>=0)s+=line(70,Y(0),620,Y(0),'#a66a35','5 3');
  for(let j=0;j<series;j++){
   if(!pick.startsWith('test'))s+='<polyline fill="none" stroke="'+colors[j]+'" stroke-width="2" points="'+rows.map(r=>X(r.x)+','+Y(r.y[j])).join(' ')+'"/>';
   rows.forEach((r,i)=>{const chosen=selected===(r.id??i),attr=pick?' tabindex="0" role="button" data-geo-pick="'+pick+'" data-id="'+(r.id??i)+'" aria-label="'+esc(r.label||('选择K='+r.x))+'"':'';s+='<circle cx="'+X(r.x)+'" cy="'+Y(r.y[j])+'" r="'+(chosen?6:4)+'" fill="'+colors[j]+'" stroke="'+(chosen?'#153e4c':'white')+'" stroke-width="'+(chosen?2:1)+'"'+attr+'><title>'+esc(r.label||('K='+r.x+'；'+f(r.y[j])+' mm'))+'</title></circle>';});
  }
  s+=text(70,25,yLabel,15)+text(345,307,xLabel,15,'#365966','middle');return svg(s,label,660,320);
 }
 function weights(){let s='',max=Math.max(...data.neighbors.map(v=>v.weight));data.neighbors.forEach((v,i)=>{const y=12+i*24;s+=text(8,y+15,'T'+String(v.index+1).padStart(3,'0'),14)+ '<rect x="78" y="'+y+'" width="'+(v.weight/max*350)+'" height="18" fill="'+(v.index===selectedNeighbor?'#a66a35':'#23877b')+'" tabindex="0" role="button" data-geo-pick="neighbor" data-id="'+v.index+'" aria-label="查看训练记录T'+String(v.index+1).padStart(3,'0')+'"><title>权重 '+f(v.weight*100,3)+'%</title></rect>'+text(440,y+15,f(v.weight*100,3)+'%',14);});return svg(s,'当前真实最近邻的归一化权重',540,Math.max(100,data.neighbors.length*24+15));}
 function render(){
  if(!root?.isConnected||!data)return;
  const b=data.baseline||{x:data.x,k:data.k,prediction:data.prediction};
  node('geo-live-status').textContent='当前：'+data.x.map((v,i)=>names[i]+' '+f(v,1)+' '+units[i]).join('；')+'；K='+data.k+'。下方图表与上方演示同步。';
  node('geo-object').innerHTML=engineering();
  node('geo-conclusion-0').textContent='当前K='+data.k+'，预测L='+f(data.prediction[0])+' mm、D='+f(data.prediction[1])+' mm。这两个数是几何预测量，不能直接换算成现场产能或施工效果。';
  node('geo-compare').innerHTML=comparison();
  node('geo-input-delta').innerHTML=table(['变量','基准','当前','变化'],data.x.map((v,i)=>[esc(names[i]+' / '+units[i]),f(b.x[i],2),f(v,2),signed(v-b.x[i])]).concat([['邻居数K',b.k,data.k,String(data.k-b.k)]]));
  node('geo-output-delta').innerHTML='<div><small>穿深L变化 / mm</small><strong>'+signed(data.prediction[0]-b.prediction[0])+'</strong></div><div><small>入口孔径D变化 / mm</small><strong>'+signed(data.prediction[1]-b.prediction[1])+'</strong></div>';
  const changes=data.x.map((v,i)=>v!==b.x[i]?names[i]:null).filter(Boolean);if(data.k!==b.k)changes.push('K');
  node('geo-conclusion-1').textContent=(changes.length?'与基准相比改变了'+changes.join('、')+'。':'当前与基准相同。')+'L变化'+signed(data.prediction[0]-b.prediction[0])+' mm，D变化'+signed(data.prediction[1]-b.prediction[1])+' mm。'+(changes.length>1?'本次改变多项，不能把差异全部归因于单个变量。':'该对照描述当前合成模型的局部响应。');
  node('geo-normalization').innerHTML=table(['输入','原始值 / 单位','固定范围','缩放至[0,1]'],data.x.map((v,i)=>[esc(names[i]),f(v,2)+' '+units[i],data.ranges[i].join('–'),f((v-data.ranges[i][0])/(data.ranges[i][1]-data.ranges[i][0]),5)]));
  node('geo-knn-flow').innerHTML=['按固定范围归一化','计算320条距离并排序','取最近的 '+data.k+' 条','归一化权重并加权输出'].map((v,i)=>'<div><span>'+String(i+1).padStart(2,'0')+'</span><b>'+v+'</b></div>').join('');
  const neighbor=data.neighbors.find(v=>v.index===selectedNeighbor)||data.neighbors[0];selectedNeighbor=neighbor.index;
  node('geo-weight-plot').innerHTML=weights();
  node('geo-neighbors').innerHTML=table(['训练序号','归一化距离（无量纲）','权重','L标签 / mm','D标签 / mm','对L贡献 / mm','对D贡献 / mm'],data.neighbors.map(v=>['<button type="button" data-geo-pick="neighbor" data-id="'+v.index+'" aria-label="查看训练记录T'+String(v.index+1).padStart(3,'0')+'">T'+String(v.index+1).padStart(3,'0')+'</button>',f(v.distance,6),f(v.weight,6),f(v.y[0]),f(v.y[1]),f(v.contribution[0]),f(v.contribution[1])]));
  node('geo-neighbor-detail').textContent='正在查看T'+String(neighbor.index+1).padStart(3,'0')+'：'+neighbor.x.map((v,i)=>names[i]+'='+f(v,3)+' '+units[i]).join('；')+'。距离='+f(neighbor.distance,6)+'；权重='+f(neighbor.weight*100,4)+'%。训练序号按原库顺序从1计。';
  const totals=[0,1].map(j=>data.neighbors.reduce((s,v)=>s+v.contribution[j],0)),ws=data.neighbors.reduce((s,v)=>s+v.weight,0);
  node('geo-conclusion-2').textContent='实际选取'+data.neighbors.length+'条邻居，Σw='+f(ws,8)+'；贡献之和L='+f(totals[0])+' mm、D='+f(totals[1])+' mm，与当前预测逐项对应。越近的记录权重越高；权重不代表概率或置信度。';
  const recommendation=best();
  node('geo-cv-choice').textContent='按训练内五折的'+(criterion?'D':'L')+'折外预测汇总RMSE，当前推荐K='+recommendation.k+'；L的RMSE='+f(recommendation.metrics[0].rmse)+' mm，D的RMSE='+f(recommendation.metrics[1].rmse)+' mm。';
  node('geo-apply-k').textContent='采用CV推荐 K='+recommendation.k;
  for(let j=0;j<2;j++){
   node('geo-k-current-'+j).innerHTML=plot(data.k_predictions.map(v=>({x:v.k,y:[v.y[j]],id:v.k,label:'采用K='+v.k+'；预测'+['L','D'][j]+'='+f(v.y[j])+' mm'})),{label:'当前输入下'+['L','D'][j]+'随K变化',xLabel:'邻居数量 K',yLabel:'当前预测'+['L','D'][j]+' / mm',xMin:3,xMax:21,series:1,pick:'k',selected:data.k});
   node('geo-k-cv-'+j).innerHTML=plot(data.cv.rows.map(v=>({x:v.k,y:[v.metrics[j].rmse],id:v.k,label:'K='+v.k+'，训练内CV '+['L','D'][j]+' RMSE='+f(v.metrics[j].rmse)+' mm'})),{label:'训练内部五折交叉验证'+['L','D'][j]+'误差',xLabel:'邻居数量 K',yLabel:'训练内CV '+['L','D'][j]+' RMSE / mm',xMin:3,xMax:21,pick:'cv',selected:recommendation.k});
  }
  node('geo-cv-table').innerHTML=table(['K','CV L MAE / mm','CV L RMSE / mm','CV D MAE / mm','CV D RMSE / mm'],data.cv.rows.map(v=>[v.k,f(v.metrics[0].mae),f(v.metrics[0].rmse),f(v.metrics[1].mae),f(v.metrics[1].rmse)]));
  node('geo-conclusion-3').textContent='当前K='+data.k+'；按预先选择的'+(criterion?'D':'L')+'误差指标，训练内推荐K='+recommendation.k+'。K增大只改变检索邻域与平滑程度，是否更合适由训练内CV判断；60条测试记录没有参与选K。';
  node('geo-test-metrics').innerHTML=table(['测试输出','MAE / mm','RMSE / mm','R²'],data.test_metrics.map((v,j)=>[['穿深L','入口孔径D'][j],f(v.mae),f(v.rmse),f(v.r2,5)]));
  const letter=['L','D'][output],maxRes=Math.max(.001,...data.test.map(v=>Math.abs(v.residual[output])));
  node('geo-test-scatter').innerHTML=plot(data.test.map(v=>({x:v.reference[output],y:[v.prediction[output]],id:v.index,label:'查看测试记录H'+String(v.index+1).padStart(2,'0')+'；参考'+f(v.reference[output])+'，预测'+f(v.prediction[output])+' mm'})),{label:letter+'测试参考与预测散点',xLabel:'独立合成参考 '+letter+' / mm',yLabel:'预测 '+letter+' / mm',identity:true,pick:'test-scatter',selected:selectedTest});
  node('geo-test-residual').innerHTML=plot(data.test.map(v=>({x:v.reference[output],y:[v.residual[output]],id:v.index,label:'查看测试记录H'+String(v.index+1).padStart(2,'0')+'；残差'+signed(v.residual[output])+' mm'})),{label:letter+'测试残差图',xLabel:'独立合成参考 '+letter+' / mm',yLabel:'残差：预测−参考 / mm',yMin:-maxRes,yMax:maxRes,zero:true,pick:'test-residual',selected:selectedTest});
  const test=data.test[selectedTest]||data.test[0];
  node('geo-test-detail').innerHTML='<h5>测试记录 H'+String(test.index+1).padStart(2,'0')+'</h5><p>'+test.x.map((v,i)=>esc(names[i])+' '+f(v,3)+' '+units[i]).join('；')+'</p>'+table(['输出','合成参考 / mm','预测 / mm','残差 / mm'],[0,1].map(j=>[['L','D'][j],f(test.reference[j]),f(test.prediction[j]),signed(test.residual[j])]));
  const ranked=[...data.test].sort((a,b)=>Math.abs(b.residual[output])-Math.abs(a.residual[output]));
  node('geo-test-rows').innerHTML=table(['按|'+letter+'残差|排序','参考 / mm','预测 / mm','残差 / mm'],ranked.map(v=>['<button type="button" data-geo-pick="test-table" data-id="'+v.index+'">H'+String(v.index+1).padStart(2,'0')+'</button>',f(v.reference[output]),f(v.prediction[output]),signed(v.residual[output])]));
  node('geo-conclusion-4').textContent='在独立的60条合成测试记录上，当前K='+data.k+'的L RMSE='+f(data.test_metrics[0].rmse)+' mm，D RMSE='+f(data.test_metrics[1].rmse)+' mm。图中零线/一致线提供参照，误差正负分别表示高估/低估。此结果反映合成生成关系上的误差，仍需独立靶试或现场测量验证。';
  const applied=selectionLog.filter(v=>v.action==='apply_cv').at(-1);
  node('geo-record-summary').innerHTML=table(['记录项','当前内容'],[['输入',data.x.map((v,i)=>names[i]+' '+f(v,2)+' '+units[i]).join('；')],['模型','归一化欧氏距离＋距离倒数加权KNN；K='+data.k],['预测', 'L='+f(data.prediction[0])+' mm；D='+f(data.prediction[1])+' mm'],['选K记录',applied?'最近采用训练内CV推荐K='+applied.k+'；指标='+applied.metric+'。当前K='+data.k:'尚未采用CV推荐；当前K='+data.k+'由演示设置。'],['验证依据','320条训练样本内五折CV；60条独立合成测试，未参与CV。'],['适用范围','E 20–60 kJ；UCS 20–120 MPa；围压5–60 MPa；壁厚6–15 mm。'],['来源','原教学程序；种子334/335；训练标签含扰动，测试参考无噪。']] );
  node('geo-conclusion-5').textContent='可导出完整JSON研究记录及60条测试记录CSV，保存当前条件、基准、邻居贡献、CV规则与折外误差、双输出测试指标和研究备注。';
  const conclusions=[
   'L、D分别描述地层穿深和简化入口孔径。相同输入与K应得到相同结果；几何预测量不能直接换算成现场产能或施工效果。',
   changes.length>1?'本次改变了多项设置，应恢复共同基准后做单变量比较，再讨论变量交互。':'在其余输入和K保持一致时，可用这一对照描述单变量的局部模型响应；影响方向仍需由本次计算检查。',
   'KNN通过相似样本加权得到两项输出。贡献之和应与预测吻合，权重之和应为1；权重不是概率或置信度。',
   '先确定选K指标，再用训练内部CV比较候选。K更大不自动代表更好；60条测试记录只用于独立检验，不参与推荐。',
   '同时看两项输出的带单位误差及残差分布。零线以上为高估，以下为低估；合成留出误差不能替代真实靶试或现场测量验证。',
   '一份可追溯的记录应同时保留输入、模型、预测、验证依据与适用范围，并明确数据来源和仍需完成的独立验证。'
  ];
  conclusions.forEach((v,i)=>{node('geo-observe-'+i).textContent=node('geo-conclusion-'+i).textContent;node('geo-conclusion-'+i).textContent=v;});
  root.querySelectorAll('[data-geo-action="energy"],[data-geo-action="strength"]').forEach(b=>{const energy=b.dataset.geoAction==='energy',i=energy?0:1,delta=Math.min(5,data.ranges[i][1]-data.x[i]);b.disabled=delta<=0;b.textContent=delta>0?'仅增加'+(energy?'能量E ':'UCS ')+f(delta,0)+(energy?' kJ':' MPa'):(energy?'能量E已到上限':'UCS已到上限');});

 }
 function download(name,value,mime){const url=URL.createObjectURL(new Blob([value],{type:mime})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 function record(){return {record_kind:'synthetic teaching model research record',schema_version:1,case:CASE,exported_at:new Date().toISOString(),inputs:{energy_kJ:data.x[0],strength_MPa:data.x[1],confinement_MPa:data.x[2],casing_wall_mm:data.x[3]},model:{k:data.k,algorithm:data.provenance.algorithm,ranges:data.ranges},prediction_mm:{L:data.prediction[0],D:data.prediction[1]},synthetic_reference_mm:{L:data.reference[0],D:data.reference[1]},baseline:data.baseline,neighbors:data.neighbors,training_cross_validation:data.cv,selection:{criterion:'pooled out-of-fold '+['L','D'][criterion]+' RMSE',recommended_k:best().k,current_k:data.k,log:selectionLog,automatic_cv_used_test_data:false,current_k_origin:selectionLog.at(-1)?.action==='apply_cv'&&selectionLog.at(-1)?.k===data.k?'training_cv_recommendation':'manual_or_initial_demo_setting',provenance_scope:'Automatic recommendation uses no held-out data. Manual or external slider choices cannot be certified as unbiased selection.'},independent_synthetic_test:{metrics:data.test_metrics,records:data.test},provenance:data.provenance,scope:'Only the declared synthetic input ranges; independent target tests or field measurements are required for engineering claims.',research_notes:node('geo-research-notes').value};}
 function mount(demo){
  data=null;selectionLog=[];criterion=0;selectedTest=0;selectedNeighbor=0;output=0;
  root=E('section','p1-lessons expanded-library geometry-course');root.id=PREFIX;root.tabIndex=-1;root.setAttribute('aria-label','六节课：从工程对象到研究记录');
  root.innerHTML='<h2>六节课 · 从工程对象到研究记录</h2><p class="expanded-intro">每课依次回答问题、操作对照、观察结果并形成结论。图表读取上方同一套KNN模型的实际结果。</p><nav class="expanded-nav" aria-label="课程目录">'+titles.map((v,i)=>'<a href="#'+PREFIX+'-'+i+'" data-geo-jump="'+i+'">'+String(i+1).padStart(2,'0')+' '+v+'</a>').join('')+'</nav><p class="geo-status" id="geo-live-status" role="status">等待上方演示载入，数值就绪后自动同步。</p>';
  const content=[
   '<div id="geo-object" class="geo-main-figure"></div><div class="geo-actions">'+button('energy','仅增加能量E 5 kJ')+button('default','恢复默认工况')+'</div><p class="geo-note">输入为教学能量代理量、UCS、围压与壁厚。输出L从地层界面起算，D为简化入口孔径；图形不代表真实装药或施工结构。</p>',
   '<div class="geo-actions">'+button('baseline','保存当前为基准')+button('energy','仅增加能量E 5 kJ')+button('strength','仅增加UCS 5 MPa')+button('restore','恢复已保存基准')+'</div><div id="geo-compare" class="geo-main-figure"></div><div class="geo-two"><div id="geo-input-delta"></div><div><div id="geo-output-delta" class="geo-deltas"></div><p class="geo-note">按同一K比较单变量变化；若K也改变，结论会明确列出。</p></div></div>',
   '<div id="geo-knn-flow" class="geo-knn-chain"></div><div id="geo-normalization"></div><div class="geo-two"><figure><h5>当前邻居的真实权重</h5><div id="geo-weight-plot"></div><figcaption>可点击条形或训练序号查看该样本。</figcaption></figure><div><h5>计算规则</h5><p class="geo-equation">dᵢ = √Σⱼ[(xⱼ−xᵢⱼ)/(maxⱼ−minⱼ)]²<br>wᵢ = [1/(dᵢ+10⁻⁶)] / Σₗ[1/(dₗ+10⁻⁶)]<br>ŷ = Σᵢ wᵢ yᵢ</p><p id="geo-neighbor-detail" class="geo-observation"></p></div></div><div id="geo-neighbors"></div><p class="geo-note">训练库来自种子334的320条样本，标签含原程序扰动。距离、权重与两项贡献均读取原模型；320条记录没有包含60条测试样本。</p>',
   '<div class="geo-actions"><label>预先选择CV指标 <select id="geo-cv-metric"><option value="0">穿深L的RMSE</option><option value="1">孔径D的RMSE</option></select></label>'+button('apply-cv','采用CV推荐K','id="geo-apply-k"')+'</div><p id="geo-cv-choice" class="geo-observation"></p><div class="geo-four"><figure><h5>当前工况：L随K变化</h5><div id="geo-k-current-0"></div></figure><figure><h5>当前工况：D随K变化</h5><div id="geo-k-current-1"></div></figure><figure><h5>训练内CV：L误差</h5><div id="geo-k-cv-0"></div></figure><figure><h5>训练内CV：D误差</h5><div id="geo-k-cv-1"></div></figure></div><div id="geo-cv-table"></div><p class="geo-note">五折指把训练样本分成5份，与邻居数K不同。训练序号index % 5确定分折，每折256条训练、64条验证。表中误差由320条折外预测汇总，候选K为3、5、…、21；选择只看预先确定的L或D指标。CV相对含扰动训练标签，测试相对无噪参考，二者口径不同。上方滑块与预测曲线仍允许手动设置K，导出记录会注明来源。</p>',
   '<div class="geo-actions"><label>查看输出 <select id="geo-error-output"><option value="0">穿深L / mm</option><option value="1">入口孔径D / mm</option></select></label>'+button('worst','定位最大绝对残差')+'</div><div id="geo-test-metrics"></div><div class="geo-two"><figure><h5>参考—预测与一致线</h5><div id="geo-test-scatter"></div></figure><figure><h5>残差与零线</h5><div id="geo-test-residual"></div></figure></div><p class="geo-note">两图显示全部60条测试记录。可点击圆点或按Tab后回车；深色描边为当前选中记录，橙色虚线分别表示y=x或残差为0。</p><div id="geo-test-detail" class="geo-observation"></div><h5>全部测试记录 · 可按序号点选</h5><div id="geo-test-rows"></div>',
   '<div id="geo-record-summary"></div><label class="geo-notes-label" for="geo-research-notes">研究备注：观察、疑问与下一步验证</label><textarea id="geo-research-notes" rows="3" placeholder="记录你本次比较的变量、选K依据及需要补充的独立验证。"></textarea><div class="geo-actions">'+button('export-json','导出研究记录JSON')+button('export-csv','导出60条测试记录CSV')+'</div><p class="geo-note">JSON保存完整精度值、全部邻居与CV分折；页面仅对读数做小数位显示。备注仅随本地导出保存。</p><p class="geo-note"><a href="assets/perforation-lite/geometry-training-320.csv" download>下载320条原训练样本CSV</a> · <a href="assets/perforation-lite/geometry-test-60-reference.csv" download>下载60条独立合成测试参考CSV</a></p>'
  ];
  content.forEach((html,i)=>{const a=E('article','geo-lesson expanded-article');a.id=PREFIX+'-'+i;a.tabIndex=-1;a.innerHTML='<div class="expanded-article-heading"><span>'+String(i+1).padStart(2,'0')+'</span><h3>'+titles[i]+'</h3></div><h4>本课要回答的问题</h4><p class="geo-question">'+questions[i]+'</p><h4>配图与操作</h4><div class="geo-interactive">'+html+'</div><h4>观察结果</h4><p id="geo-observe-'+i+'" class="geo-observation">等待模型结果。</p><h4>本课结论</h4><p id="geo-conclusion-'+i+'" class="geo-conclusion">等待模型结果。</p>';root.append(a);});
  const source=E('p','geo-note');source.innerHTML='方法依据：<a href="https://scikit-learn.org/stable/modules/cross_validation.html" target="_blank" rel="noopener">交叉验证与独立测试</a>、<a href="https://scikit-learn.org/stable/modules/neighbors.html" target="_blank" rel="noopener">近邻回归</a>。本站实际计算沿用原JavaScript实现，未调用scikit-learn；教学数据、公式和扰动来源分别保留。';root.append(source);demo.after(root);
  root.addEventListener('click',e=>{
   const jump=e.target.closest('[data-geo-jump]');if(jump){e.preventDefault();root.querySelector('#'+PREFIX+'-'+jump.dataset.geoJump).scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});return;}
   if(!data)return;
   const pick=e.target.closest('[data-geo-pick]');if(pick){const id=Number(pick.dataset.id);if(pick.dataset.geoPick==='neighbor')selectedNeighbor=id;else if(pick.dataset.geoPick==='k'){selectionLog.push({action:'manual_k',k:id,source:'current_input_prediction_curve',at:new Date().toISOString()});command({action:'set',k:id,lesson:3});}else if(pick.dataset.geoPick==='cv'){node('geo-cv-choice').textContent='选中K='+id+'：训练内L RMSE='+f(data.cv.rows.find(v=>v.k===id).metrics[0].rmse)+' mm，D RMSE='+f(data.cv.rows.find(v=>v.k===id).metrics[1].rmse)+' mm。点击“采用CV推荐”时仍按当前预先选择的指标确定K。';return;}else selectedTest=id;render();return;}
   const b=e.target.closest('[data-geo-action]');if(!b)return;const action=b.dataset.geoAction;
   if(action==='baseline')command({action:'baseline'});
   if(action==='default')command({action:'set',x:[40,60,25,10],k:7,lesson:0,view:0});
   if(action==='energy'||action==='strength'){const x=[...data.x],i=action==='energy'?0:1;x[i]=Math.min(data.ranges[i][1],x[i]+5);command({action:'set',x,lesson:1,view:0});}
   if(action==='restore'&&data.baseline)command({action:'set',x:data.baseline.x,k:data.baseline.k,lesson:1,view:0});
   if(action==='apply-cv'){const k=best().k;selectionLog.push({action:'apply_cv',k,metric:['L','D'][criterion]+' pooled OOF RMSE',source:'320_training_only_5_fold',at:new Date().toISOString()});command({action:'set',k,lesson:3});}
   if(action==='worst'){selectedTest=data.test.reduce((a,b)=>Math.abs(b.residual[output])>Math.abs(a.residual[output])?b:a).index;render();}
   if(action==='export-json')download('perforation-geometry-research-record.json',JSON.stringify(record(),null,2),'application/json');
   if(action==='export-csv'){const rows=data.test.map(v=>[v.index+1,...v.x,...v.reference,...v.prediction,...v.residual]);download('perforation-geometry-test-60.csv','\uFEFFrecord,E_kJ,UCS_MPa,confinement_MPa,wall_mm,reference_L_mm,reference_D_mm,predicted_L_mm,predicted_D_mm,residual_L_mm,residual_D_mm\r\n'+rows.map(v=>v.join(',')).join('\r\n'),'text/csv;charset=utf-8');}
  });
  root.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches('svg [data-geo-pick]')){e.preventDefault();e.target.dispatchEvent(new MouseEvent('click',{bubbles:true}));}});
  root.addEventListener('change',e=>{if(e.target.id==='geo-cv-metric'){criterion=Number(e.target.value);render();}if(e.target.id==='geo-error-output'){output=Number(e.target.value);render();}});
  command({action:'snapshot'});
 }
 window.addEventListener('message',e=>{if(e.source!==frame()?.contentWindow||e.data?.type!=='petro-geometry-research'||e.data.case!==CASE)return;data=e.data.value;if(!root?.isConnected)return;if(!queued){queued=true;requestAnimationFrame(()=>{queued=false;render();});}});
 window.PetroGeometryCourse={mount};
})();
