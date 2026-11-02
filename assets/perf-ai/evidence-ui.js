/* Adds explanation, independently recomputed diagnostics and export to demos. */
(()=>{'use strict';
const access=window.PerfDemoAccess;if(!access)return;
const $=id=>document.getElementById(id),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),fmt=x=>typeof x==='number'?(Number.isFinite(x)?(Math.abs(x)>=100?x.toFixed(1):Math.abs(x)<.001&&x!==0?x.toExponential(2):x.toFixed(3)):'未定义'):String(x??'未记录');
const spec={
 design:['NSGA-II','在给定孔密约束下，从49个有限候选搜索表皮、质量流量与工作量代理的非支配取舍。','种群规模、代数、变异率、孔密上限；候选配置及CFD指标。','各代候选、Pareto前沿、选中方案、完整有限前沿覆盖。','Ma等（2025）表3：49条公开CFD配置。','离散有限候选，不是连续几何优化；工作量代理不等于真实成本。'],
 selection:['贝叶斯优化 · 高斯过程 + EI','在有限模拟试验预算内，顺序选择可行点并提高已观测的穿深响应。','评估预算、枪径上限、探索参数ξ；只用已观测响应拟合GP。','后验均值与标准差、期望改进EI、采样序列及当前最优。','公开生成关系构成450点模拟试验网格；不是商品弹型实测。','固定RBF核长度0.34、噪声1e−5；未采样响应只用于事后验收。'],
 geometry:['XGBoost','由结构化器材和靶体参数预测模拟地面靶试穿深。','装药质量、枪径、靶强、套管外径、孔密、相位。','穿深预测、单参数条件响应、测试残差及分裂增益重要性。','1400条公开生成的模拟记录，1120训练 / 280测试；未取得原论文1648条原始记录。','当前输出仅穿深，未验证孔径或完整孔道形态；模拟成绩不能外推井下。'],
 evaluation:['LightGBM','由历史滞后输入预测生产响应，并与昨日持续性基线对照。','测试记录位置；滞后压力、油嘴和历史油量情景倍率；13项滞后特征。','日油量预测、参考序列对照、基线误差与工况残差。','Volve F-14作者仓库生产子集；按时间70% / 15% / 15%划分。','生产关联预测，不是射孔措施的因果净效应；情景输入无对应干预真值。'],
 damage:['高斯过程回归 GPR（固定核参数）','从孔道与损害配置估计附加表皮，并检查小样本误差和条件区间。','穿深、孔密、孔径、损害区深度、损害程度、相位；手动核长度和噪声。','后验均值、均值±1.96σ条件区间、留出误差及局部敏感性。','Ma等（2025）49条公开CFD配置：固定39训练 / 10测试。','RBF核参数在每次拟合中固定，不自动寻优；核参数在一次拟合中固定，区间非工程保证。'],
 lithology:['1D-CNN · Adam训练','按同井局部测井上下文，初筛砂岩及砂泥互层与其他岩性。','GR、RHOB、NPHI、RDEP、DTC的9点窗口，阈值及当前测试位置。','分类得分、沿深度标签对照、混淆矩阵及两类别精确率/召回率/F1。','FORCE 4800行稀疏子集；按井隔离，4752个有效9点窗口。','二分类，不能冒充全部原始岩性类别；9点窗口不是固定米数。'],
 productivity:['TCN · Adam训练','使用过去32日油量作因果卷积预测，区分一步测试与多步递推。','历史窗口、测试起点、递推天数和假设历史倍率。','一步与递推序列、持续性基线、不同步长的参考误差。','Volve F-14生产子集，按时间划分；仅使用起点前历史。','单井序列预测不代表储量或射孔增产；多步必须单独检验。'],
 cleanup:['TCN-Autoencoder · Adam训练','用正常历史重建压力/温度，检测重建误差超过正常校准阈值的窗口。','32点×2通道窗口、当前文件/位置、正常阈值分位。','重建信号、窗口MSE、异常区间；有真实事件标签时展示检出指标。','Petrobras 3W实测文件：正常50%训练、后10%校准、未来40%及另一文件检查。','事件标签包含过渡；异常分数不是残留百分比、清洁率或事故概率。'],
 network:['PINN · Adam训练','在六支路无量纲物理基准中预测逐孔流量与共同压力。','给定总流量、第三孔相对孔径；支路阻力与背压。','逐孔流量、独立求根参考解、总量和压降残差、分项训练损失。','公开六支路代数物理基准，无现场流量标签；独立参考解仅用于评价。','总流量0.4—1.7、孔径倍率0.65—1.5；非多相井筒与裂缝耦合模型。'],
 depth:['带宽约束DTW · 动态规划','对参考与待配准测井曲线计算单调带约束的最小累计代价路径。','真实GR片段、构造平移/伸缩、允许路径带宽。','匹配路径、累计代价、局部深度修正和真值重叠区定位误差。','FORCE真实GR的320点片段；只对深度坐标施加已知扰动。','真值仅存在于受控扰动重叠区；重复纹理与带宽可能误配，缺少真实CCL锚点。']
};
const initial=access(),key=initial.C.key,config=spec[key],main=$('ai-app');
const explanation=document.createElement('section');explanation.id='algorithm-explanation';explanation.className='ev-section ev-explanation';explanation.innerHTML='<h3>算法说明</h3><dl>'+['算法名称','解决的问题','输入参数','输出结果','数据来源','适用范围'].map((s,i)=>`<div><dt>${s}</dt><dd>${esc(config[i])}</dd></div>`).join('')+'</dl>';main.prepend(explanation);
const section=document.createElement('section');section.className='ev-section';section.id='performance-evidence';section.innerHTML=`<header class="ev-header"><div><span class="ev-kicker">COMPUTED EVIDENCE</span><h3>性能评价与计算过程</h3></div><span id="ev-origin" class="ev-badge"></span></header><p id="ev-state" role="status">正在用当前模型复算评价…</p><p id="ev-split" class="ev-note"></p><div id="ev-metrics" class="ev-metrics"></div><div class="ev-toolbar"><label id="ev-feature-label" hidden>响应参数 <select id="ev-feature" aria-label="评价响应参数"></select></label><button id="ev-export" disabled>导出输入、结果与评价数据</button></div><div id="ev-charts" class="ev-charts"></div><details class="ev-audit"><summary>评价记录、参数与复算口径</summary><pre id="ev-meta"></pre></details>`;main.append(section);
const conclusions=document.createElement('section');conclusions.className='ev-section';conclusions.id='limitations-expectations';conclusions.innerHTML='<h3>不足与期望</h3><dl id="ev-conclusions"></dl>';main.append(conclusions);
if(['geometry','damage','network'].includes(key)){$('ev-feature-label').hidden=false;$('ev-feature').innerHTML=(key==='network'?['给定总流量','第三孔相对孔径']:initial.M.features).map((name,i)=>`<option value="${i}">${esc(name)}</option>`).join('');if(key==='network')$('ev-feature').value='1';}
const palette=['#227b6b','#c27741','#467fa2','#a45e85','#7b8750','#7c70ab'];
const text=(x,y,t,size=13,anchor='start')=>`<text x="${x}" y="${y}" font-size="${size}" text-anchor="${anchor}" fill="#34545e">${esc(t)}</text>`;
function chart(c){
 const W=800,H=340,left=88,right=22,top=42,bottom=72,iw=W-left-right,ih=H-top-bottom;
 let body='';
 if(c.kind==='matrix'){
  const max=Math.max(1,...c.matrix.flat());for(let i=0;i<2;i++)for(let j=0;j<2;j++){const v=c.matrix[i][j];body+=`<rect x="${220+j*150}" y="${62+i*93}" width="144" height="87" rx="8" fill="hsl(164 30% ${95-v/max*48}%)"/>`+text(292+j*150,113+i*93,v,25,'middle');}body+=text(290,279,'预测'+c.labels[0],13,'middle')+text(445,279,'预测'+c.labels[1],13,'middle')+text(200,112,'参考'+c.labels[0],13,'end')+text(200,205,'参考'+c.labels[1],13,'end');
 }else if(c.kind==='heatmap'){
  const values=c.cells.map(x=>x[2]).filter(Number.isFinite).sort((a,b)=>a-b),cap=values[Math.floor(values.length*.9)]||1,n=c.size;const X=i=>170+i/n*430,Y=j=>45+j/n*230;
  for(const [i,j,v] of c.cells)body+=`<rect x="${X(i)}" y="${Y(j)}" width="${430*c.stride/n+1}" height="${230*c.stride/n+1}" fill="${v===null?'#e4e9e8':`hsl(${170-Math.min(v/cap,1)*110} 38% ${92-Math.min(v/cap,1)*45}%)`}"/>`;
  body+=`<polyline points="${c.path.map(([i,j])=>`${X(i)},${Y(j)}`).join(' ')}" stroke="#243f78" stroke-width="2.4" fill="none"/>`+text(385,310,'参考样本 →；待配准样本向下；灰色为带外',14,'middle');
 }else{
  const points=c.series.flatMap(s=>s.points).filter(p=>p.every(Number.isFinite));if(!points.length)return '<p>当前区间没有有效评价样本。</p>';
  let xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);if(c.band)ys.push(...c.band.low,...c.band.high);if(c.marker){xs.push(c.marker[0]);ys.push(c.marker[1])}if(c.zero||c.kind==='bars'||c.bounded)ys.push(0);if(c.bounded)ys.push(1);
  let xmin=Math.min(...xs),xmax=Math.max(...xs),ymin=Math.min(...ys),ymax=Math.max(...ys);if(xmin===xmax){xmin-=.5;xmax+=.5}if(c.kind==='bars'||c.labels){xmin-=.5;xmax+=.5}if(ymin===ymax){ymin-=.5;ymax+=.5}const pad=(ymax-ymin)*.08;ymin-=pad;ymax+=pad;
  if(c.diagonal){const min=Math.min(xmin,ymin),max=Math.max(xmax,ymax);xmin=ymin=min;xmax=ymax=max}
  const X=v=>left+(v-xmin)/(xmax-xmin)*iw,Y=v=>top+(ymax-v)/(ymax-ymin)*ih;
  for(let i=0;i<=4;i++){const v=ymin+(ymax-ymin)*i/4,y=Y(v);body+=`<path d="M${left} ${y}H${W-right}" stroke="#e0e9e5"/>`+text(left-10,y+4,fmt(v),12,'end')}
  if(c.labels){c.labels.forEach((s,i)=>{body+=text(X(c.series[0].points[i]?.[0]??i),H-bottom+21,String(s).slice(0,19),11,'middle')})}else for(let i=0;i<=4;i++){const v=xmin+(xmax-xmin)*i/4;body+=text(X(v),H-bottom+21,fmt(v),12,'middle')}
  body+=text((left+W-right)/2,H-12,c.xLabel,13,'middle')+text(left,18,c.yLabel,13);
  if(c.intervals)for(const [a,b] of c.intervals)body+=`<rect x="${X(a)}" y="${top}" width="${Math.max(2,X(b)-X(a))}" height="${ih}" fill="#d9855a" opacity=".11"/>`;
  if(c.band)body+=`<polygon points="${c.band.x.map((x,i)=>`${X(x)},${Y(c.band.high[i])}`).concat(c.band.x.slice().reverse().map((x,i)=>`${X(x)},${Y(c.band.low[c.band.x.length-1-i])}`)).join(' ')}" fill="#b9ddd3" opacity=".65"/>`;
  if(c.zero)body+=`<path d="M${left} ${Y(0)}H${W-right}" stroke="#7f9995" stroke-dasharray="4 4"/>`;
  if(c.diagonal)body+=`<path d="M${X(xmin)} ${Y(xmin)}L${X(xmax)} ${Y(xmax)}" stroke="#b17b56" stroke-dasharray="5 4"/>`;
  c.series.forEach((s,j)=>{const color=palette[j%palette.length],p=s.points.filter(p=>p.every(Number.isFinite));if(c.kind==='bars'){const group=iw/Math.max(c.labels?.length||p.length,1)*.65,w=group/c.series.length;p.forEach(([x,y])=>{body+=`<rect x="${X(x)-group/2+j*w}" y="${Math.min(Y(y),Y(0))}" width="${Math.max(2,w-2)}" height="${Math.max(1,Math.abs(Y(y)-Y(0)))}" fill="${color}"><title>${esc(s.name+': '+fmt(y))}</title></rect>`})}else if(c.kind==='scatter'){p.forEach(([x,y],i)=>{body+=`<circle cx="${X(x)}" cy="${Y(y)}" r="3.3" fill="${color}" opacity=".72"><title>${esc(s.name+': '+fmt(x)+', '+fmt(y))}</title></circle>`;if(c.numbered&&p.length<=35&&(i<4||i===p.length-1))body+=text(X(x)+5,Y(y)-7,i+1,11)})}else{let coords=[];p.forEach(([x,y],i)=>{if(c.steps&&i)coords.push(`${X(x)},${Y(p[i-1][1])}`);coords.push(`${X(x)},${Y(y)}`)});body+=`<polyline points="${coords.join(' ')}" stroke="${color}" stroke-width="2.3" fill="none"/>`}});
  if(c.marker)body+=`<circle cx="${X(c.marker[0])}" cy="${Y(c.marker[1])}" r="5.5" fill="#c27741" stroke="white" stroke-width="2"/>`;
 }
 const legend=c.series?'<div class="ev-legend">'+c.series.map((s,i)=>`<span><i style="background:${palette[i%palette.length]}"></i>${esc(s.name)}</span>`).join('')+(c.band?'<span>阴影：均值±1.96σ（条件区间）</span>':'')+'</div>':'';
 return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(c.title)}"><title>${esc(c.title)}</title>${body}</svg>${legend}`;
}
let worker=new Worker(URL.createObjectURL(new Blob([window.PerfEvidenceWorkerSource],{type:'text/javascript'}))),version=null,request=0,latest=null,timer=null,trainingSeconds=null;
const status=s=>$('ev-state').textContent=s;
function schedule(){clearTimeout(timer);++request;section.dataset.evidenceState='updating';section.setAttribute('aria-busy','true');$('ev-export').disabled=true;status('输入或模型已更新，正在同步评价…');timer=setTimeout(refresh,80)}
function refresh(){
 const a=access(),modelVersion=a.M.training?.job||'bundled-'+key;
 $('ev-origin').textContent=['design','selection','depth'].includes(key)?(a.pending?'本次运行：尚未计算':'本次运行结果'):(a.M.training?'本次训练模型':'随包模型结果');
 section.dataset.evidenceState=a.pending?'pending':'updating';section.setAttribute('aria-busy','true');$('ev-export').disabled=true;status(a.pending?'参数已改变或尚未运行：点击原运行按钮生成本次结果。':'正在复算当前模型的评价与图表…');
 const payload={id:++request,key,values:{...a.values},state:{pending:a.pending,result:a.result,chosen:a.chosen,nsgaResult:a.nsgaResult,boState:a.boState},options:{feature:+$('ev-feature').value||0}};
 if(version!==modelVersion){payload.model=a.M;version=modelVersion}worker.postMessage(payload);
}
worker.onmessage=e=>{
 const {id,result,error}=e.data;if(id!==request)return;if(error){status('评价未完成：'+error+'。现有推理结果保留，评价导出暂不可用。');return}
 latest=result;section.setAttribute('aria-busy','false');const a=access();result.metadata={...result.metadata,evaluation_definition_version:'20261102-v1',model_parameters:(a.M.training?.settings?(key==='damage'?Object.fromEntries(['length','noise','seed'].map(k=>[k,a.M.training.settings[k]])):Object.fromEntries(['rounds','lr','seed'].map(k=>[k,a.M.training.settings[k]]))):null)||{recorded_rounds:a.M.loss?.length??a.M.trees?.length??a.M.model?.tree_info?.length??null,kernel_length:a.M.length??null,kernel_noise:a.M.noise??null,unrecorded_parameters:'随包训练未记录的超参数或耗时不补造；完整权重与数据随评价导出'},algorithm_run_seconds:window.PerfDemoRunSeconds??null,training_seconds:trainingSeconds,training_request_note:'training字段记录浏览器本次拟合设置；GPR使用固定核参数，其余算法记录轮数、学习率与种子。',export_model_origin:a.M.training?'本次训练模型':'随包模型',current_view_parameters:{...a.values},response_feature:+$('ev-feature').value||0};
 $('ev-split').textContent=result.split;$('ev-metrics').innerHTML=Object.entries(result.metrics).map(([name,m])=>{let value=m.value,unit=m.unit;if(unit==='% fraction'){value=typeof value==='number'?value*100:value;unit='%'}return `<div><span>${esc(name.replace(/R2/g,'R²'))}</span><strong>${esc(fmt(value))}</strong><small>${esc(unit)}</small></div>`}).join('');
 $('ev-charts').innerHTML=result.charts.map(c=>`<article><h4>${esc(c.title)}</h4>${chart(c)}</article>`).join('');
 $('ev-conclusions').innerHTML=[['已验证表现','verified'],['当前不足','shortcoming'],['使用边界','boundary'],['后续期望','next']].map(([title,key])=>`<div><dt>${title}</dt><dd>${esc(result.conclusions[key])}</dd></div>`).join('');
 $('ev-meta').textContent=JSON.stringify({data_split:result.split,...result.metadata},null,2);$('ev-export').disabled=result.pending;
 status(result.pending?'尚未运行：没有本次优化成绩。':`已用当前${a.M.training?'本次模型':'随包数据/模型'}计算 · 评价耗时 ${fmt(result.metadata.evaluation_seconds)} s · 训练损失仅作为优化日志`);
 section.dataset.evidenceState=result.pending?'pending':'ready';section.dataset.modelOrigin=a.M.training?'fresh':'bundled';section.dataset.chartCount=result.charts.length;
 window.PerfEvaluationSnapshot=()=>latest;
};
worker.onerror=e=>{status('评价工作线程失败：'+e.message);$('ev-export').disabled=true};
$('ev-feature').onchange=schedule;
$('ev-export').onclick=()=>{
 if(!latest||latest.pending)return;
 const a=access(),payload={schema:'perforation-evidence/1',exported_at:new Date().toISOString(),case:a.C.id,algorithm:config[0],inputs:{...a.values},current_result:a.result,model_origin:a.M.training?'fresh':'bundled',model:a.M,evaluation:latest};
 const content=JSON.stringify(payload,null,2),href=URL.createObjectURL(new Blob([content],{type:'application/json;charset=utf-8'})),dialog=document.createElement('dialog');
 dialog.className='ev-export-dialog';dialog.setAttribute('aria-label','导出评价数据');
 dialog.innerHTML='<header><h3>导出评价数据</h3><button type="button" aria-label="关闭评价导出">关闭 ×</button></header><p>JSON包含输入参数、当前模型权重、结果、逐样本参考值与预测值、指标和评价范围，可用于独立复算。</p><a id="ev-download">下载评价 JSON</a><details><summary>查看本次导出内容</summary><textarea readonly aria-label="评价JSON内容"></textarea></details>';
 const link=dialog.querySelector('a');link.href=href;link.download=key+'-evaluation.json';dialog.querySelector('textarea').value=content;
 const close=()=>{dialog.close();dialog.remove();URL.revokeObjectURL(href)};dialog.querySelector('button').onclick=close;dialog.addEventListener('cancel',e=>{e.preventDefault();close()});dialog.addEventListener('click',e=>{if(e.target===dialog)close()});document.body.append(dialog);dialog.showModal();
};
window.addEventListener('perf-demo-updated',schedule);window.addEventListener('perf-model-replaced',schedule);
window.addEventListener('message',e=>{if((e.source===parent||e.source===window)&&e.data?.type==='perf-ai-train-state'&&e.data.case===initial.C.id&&Number.isFinite(e.data.elapsed))trainingSeconds=e.data.elapsed});
window.addEventListener('pagehide',()=>worker.terminate());refresh();
})();
