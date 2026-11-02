/* Inline evidence panels: numbers come exclusively from the original P3 demo adapter. */
(()=>{
 'use strict';
 const CASE='perforation-viz-p3-334-v2',names=['岩性','钢级','壁厚','完井方式'],fields=['lith','grade','wall','completion'];
 const options={lith:['砂岩','碳酸盐岩','疏松砂岩'],grade:['N80','P110','Q125'],completion:['套管射孔','砾石充填'],goal:['优先穿深','优先大孔径','优先低成本']};
 const colors=['#24796a','#527f9c','#a56d36'];let root=null,state=null,baseline=null,focus=0,cell=null,selected=null,compareId=null,queued=false;
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const f=(v,n=3)=>Number(v).toFixed(n),signed=(v,n=2)=>(v>0?'+':'')+f(v,n);
 const frame=()=>document.querySelector('#case-demo-root iframe');
 const command=(action,values)=>frame()?.contentWindow.postMessage({type:'petro-selection-command',action,values},'*');
 const node=id=>root.querySelector('#'+id),b=(action,label,attrs='')=>'<button type="button" data-sel-action="'+action+'" '+attrs+'>'+esc(label)+'</button>';
 const txt=(x,y,t,size=16,anchor='start',color='#294e58')=>'<text x="'+x+'" y="'+y+'" font-size="'+size+'" text-anchor="'+anchor+'" fill="'+color+'">'+esc(t)+'</text>';
 const svg=(body,label,w,h)=>'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+w+' '+h+'" role="img" aria-label="'+esc(label)+'"><title>'+esc(label)+'</title>'+body+'</svg>';
 function control(id,label){return '<label>'+label+'<select class="sel-control" data-field="'+id+'">'+options[id].map((s,i)=>'<option value="'+i+'">'+s+'</option>').join('')+'</select></label>';}
 function wall(){return '<label>壁厚 / mm <output id="sel-wall-value">10.0</output><input class="sel-control" data-field="wall" type="range" min="6" max="18" step="0.5" value="10" aria-label="流程套管壁厚"></label>';}
 function weights(){return ['穿深','孔径','成本'].map((n,i)=>'<label>'+n+'权重 <output id="sel-weight-'+i+'"></output><input type="range" class="sel-control" data-field="'+['twl','twd','twc'][i]+'" min="0" max="10" step="1" aria-label="流程'+n+'权重"></label>').join('');}
 function value(i){const v=state.inputs[fields[i]];return i===2?f(v,1)+' mm':options[fields[i]][v];}
 function requirement(p,i){return i===0?p.l.map(v=>options.lith[v]).join(' / '):i===1?p.g.map(v=>options.grade[v]).join(' / '):i===2?'≤ '+p.t+' mm':p.c.map(v=>options.completion[v]).join(' / ');}
 function reason(p,i){return names[i]+'：当前 '+value(i)+'；许可 '+requirement(p,i)+'；'+(p.rules[i]?'✓ 满足':'× 不满足');}
 function utilities(p){return [p.L/700,p.D/25,1-p.C/4];}
 function parts(p){return utilities(p).map((u,i)=>100*u*state.weights[i]);}
 function table(head,rows){return '<div class="sel-table-scroll"><table><thead><tr>'+head.map(h=>'<th>'+esc(h)+'</th>').join('')+'</tr></thead><tbody>'+rows.map(r=>'<tr>'+r.map(v=>'<td>'+v+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';}
 function inputGraph(){
  let s='';for(let i=0;i<4;i++){const y=14+i*62,on=i===focus,count=state.rows.filter(p=>p.rules[i]).length;
   s+='<rect x="5" y="'+y+'" width="220" height="43" rx="5" fill="'+(on?'#deeee7':'#f2f6f6')+'" stroke="'+(on?'#24796a':'#cfddda')+'"/>'+txt(18,y+27,names[i]+' · '+value(i),15);
   s+='<path d="M225 '+(y+21)+'H266" stroke="'+(on?'#24796a':'#9db4af')+'" stroke-width="2"/><path d="M259 '+(y+16)+'l7 5-7 5" fill="none" stroke="#547b71"/>';
   s+='<rect x="270" y="'+y+'" width="345" height="43" rx="5" fill="white" stroke="#c8dcd2"/>'+txt(285,y+27,['检查岩性许可集合','检查钢级许可集合','与各型号壁厚上限比较','检查完井许可集合'][i],15)+txt(603,y+27,count+'/5 满足',14,'end',colors[0]);
  }return svg(s,'当前四项井况输入分别对应哪条适配规则；满足数是单条件判断',630,266);
 }
 function matrix(){
  const rows=[...state.rows].sort((a,b)=>a.id.localeCompare(b.id));
  const html=table(['型号',...names,'最终资格'],rows.map(p=>[b('select',p.id,'data-model="'+esc(p.id)+'"'),...p.rules.map((ok,i)=>'<button type="button" class="sel-rule '+(ok?'pass':'fail')+'" data-sel-action="cell" data-model="'+esc(p.id)+'" data-rule="'+i+'" aria-label="'+esc(p.id+' '+names[i]+' '+(ok?'满足':'失败'))+'">'+(ok?'✓ 满足':'× 失败')+'</button>'),'<strong class="'+(p.pass?'pass':'fail')+'">'+(p.pass?'可参与排序':'排除')+'</strong>']));
  let s='';const counts=[5,...[0,1,2,3].map(i=>state.rows.filter(p=>p.rules.slice(0,i+1).every(Boolean)).length)];
  counts.forEach((n,i)=>{const x=8+i*124;s+='<rect x="'+x+'" y="30" width="112" height="60" fill="#dfebe6"/><rect x="'+x+'" y="'+(90-n*12)+'" width="112" height="'+(n*12)+'" fill="#3b8775"/>'+txt(x+56,22,String(n)+' 型',16,'middle')+txt(x+56,121,['全部','岩性后','钢级后','壁厚后','完井后'][i],14,'middle');});
  return html+svg(s,'依次应用岩性、钢级、壁厚与完井约束后剩余的型号数',630,143)+'<p class="sel-note">逐步筛选计数；只有四项均满足才进入评分。</p>';
 }
 function utility(p){
  const raw=[p.L+' mm',p.D+' mm',p.C+' 相对单位'],form=['L / 700','D / 25','1 − C / 4'];let s='';
  utilities(p).forEach((u,i)=>{const y=16+i*66;s+='<rect x="5" y="'+y+'" width="178" height="46" rx="5" fill="#eaf1f5"/>'+txt(94,y+29,['穿深 ','孔径 ','成本 '][i]+raw[i],16,'middle');s+='<path d="M186 '+(y+23)+'H219" stroke="#6c9690" stroke-width="2"/><rect x="224" y="'+y+'" width="395" height="46" rx="5" fill="#edf5ef"/>'+txt(241,y+29,form[i]+' = '+f(u,5),17);});return svg(s,'所选型号的原始性能与固定效用逐项换算',630,220);
 }
 function bars(){
  const valid=state.rows.filter(p=>p.pass);if(!valid.length)return '<p class="sel-empty">无可行型号：不绘制推荐排序，先查看硬约束失败原因。</p>';
  let s='',h=55+valid.length*69;[0,25,50,75,100].forEach(n=>{const x=144+n*4.05;s+='<path d="M'+x+' 25V'+(h-30)+'" stroke="#e0e9e6"/>'+txt(x,17,String(n),12,'middle');});
  valid.forEach((p,i)=>{const y=34+i*69,previous=baseline?.rows.filter(v=>v.pass),old=previous?.find(v=>v.id===p.id);s+=txt(4,y+17,p.id,15);if(old)s+='<rect x="144" y="'+(y-4)+'" width="'+(old.score*4.05)+'" height="33" fill="none" stroke="#788c93" stroke-dasharray="5 3"/>';
   let x=144;parts(p).forEach((v,j)=>{s+='<rect x="'+x+'" y="'+y+'" width="'+(v*4.05)+'" height="25" fill="'+colors[j]+'"><title>'+esc(p.id+' '+['穿深','孔径','成本'][j]+'贡献 '+f(v)+' 分')+'</title></rect>';x+=v*4.05;});
   const rank=previous?.findIndex(v=>v.id===p.id);s+=txt(623,y+18,f(p.score,2)+'分',14,'end')+txt(144,y+47,rank>=0?'原第'+(rank+1)+' → 当前第'+(i+1):'对照中未通过 → 当前第'+(i+1),13,'start','#56717a');
  });return svg(s,'当前合格型号的评分贡献；灰色虚框为保存的对照总分，横轴0至100分',640,h);
 }
 function comparison(){
  if(!state.best)return '<p class="sel-empty"><strong>停止推荐：0个型号通过全部约束。</strong></p>'+table(['型号','失败路径'],state.rows.map(p=>[esc(p.id),p.rules.map((ok,i)=>ok?null:esc(reason(p,i))).filter(Boolean).join('<br>')]))+'<p class="sel-note">保留空候选集与失败依据，不用效用高分覆盖失败条件。</p>';
  const best=state.rows.find(p=>p.id===state.best),other=state.rows.find(p=>p.id===compareId&&p.pass&&p.id!==best.id);
  const card=(p,title)=>'<section class="sel-candidate"><h6>'+esc(title+' · '+p.id)+'</h6><strong>'+f(p.score,3)+' 分</strong><p>L '+p.L+' mm · D '+p.D+' mm · C '+p.C+'</p><p>✓ 四项硬约束全部满足</p><p>分项贡献：'+parts(p).map((n,i)=>['穿深','孔径','成本'][i]+' '+f(n,3)+'分').join('；')+'</p></section>';
  let html='<div class="sel-candidates">'+card(best,'当前首选')+(other?card(other,'比较候选'):'<p class="sel-note">当前只有一个合格型号，没有其他可行候选可比较。</p>')+'</div>';
  if(other)html+='<p class="sel-observation">首选相对比较候选：L '+signed(best.L-other.L,0)+' mm，D '+signed(best.D-other.D,0)+' mm，C '+signed(best.C-other.C)+' 相对单位。总分差 '+signed(best.score-other.score,3)+' 分；分项差依次为 '+parts(best).map((v,i)=>signed(v-parts(other)[i],3)).join(' / ')+' 分。</p>';
  return html+'<p class="sel-note">判断路径：井况输入 → 四项约束均满足 → 三项效用贡献 → 当前权重下的排名。EDU型号及性能为教学设定。</p>';
 }
 function syncSelect(id,rows,value){const e=node(id),key=rows.map(r=>r.id).join('|');if(e.dataset.options!==key){e.innerHTML=rows.map(p=>'<option value="'+esc(p.id)+'">'+esc(p.id)+(p.pass?'':'（已排除，仅查看换算）')+'</option>').join('');e.dataset.options=key;}e.value=value||'';e.disabled=!rows.length;}
 function render(){
  if(!state||!root?.isConnected)return;if(!baseline)baseline=JSON.parse(JSON.stringify(state));
  root.querySelectorAll('.sel-control').forEach(e=>{if(e.value!==String(state.inputs[e.dataset.field]))e.value=state.inputs[e.dataset.field];e.disabled=false;});
  node('sel-wall-value').textContent=f(state.inputs.wall,1);['twl','twd','twc'].forEach((id,i)=>node('sel-weight-'+i).textContent=state.inputs[id]+' → '+f(state.weights[i]*100,1)+'%');
  node('sel-live-status').textContent='同一模型实时结果：'+fields.map((v,i)=>names[i]+' '+value(i)).join('；')+'。'+state.valid.length+'/5 型通过；'+(state.best?'首选 '+state.best:'无适配，停止推荐')+'。';
  node('sel-input-graph').innerHTML=inputGraph();root.querySelectorAll('[data-sel-action="focus"]').forEach(e=>e.setAttribute('aria-pressed',String(Number(e.dataset.rule)===focus)));
  node('sel-rule-summary').textContent='当前关注'+names[focus]+'：'+value(focus)+'。'+state.rows.filter(p=>p.rules[focus]).length+'型满足该单项规则；这还不是最终可行数量。';
  node('sel-matrix').innerHTML=matrix();node('sel-matrix').dataset.focus=String(focus);if(!cell)cell={id:state.rows.find(p=>!p.pass)?.id||state.rows[0].id,i:state.rows.find(p=>!p.pass)?.rules.indexOf(false)||0};
  const cp=state.rows.find(p=>p.id===cell.id)||state.rows[0];node('sel-cell-detail').textContent=cp.id+' · '+reason(cp,cell.i);
  if(!state.rows.some(p=>p.id===selected))selected=state.best||state.rows[0].id;syncSelect('sel-utility-model',state.rows,selected);const p=state.rows.find(p=>p.id===selected);
  node('sel-utility-plot').innerHTML=utility(p);node('sel-utility-status').textContent=p.id+'：'+(p.pass?'已通过硬约束，可参与排序。':'已被排除；这里仅解释性能换算，不参与推荐。');
  node('sel-contributions').innerHTML=bars();
  const changed=Object.keys(state.inputs).filter(k=>state.inputs[k]!==baseline.inputs[k]);node('sel-baseline-status').textContent=(changed.length?'与保存对照相比变化：'+changed.map(k=>({lith:'岩性',grade:'钢级',wall:'壁厚',completion:'完井',goal:'目标预设',twl:'穿深权重',twd:'孔径权重',twc:'成本权重'}[k])).join('、'):'与保存的对照工况相同')+'。对照首选：'+(baseline.best||'无适配')+'；当前首选：'+(state.best||'无适配')+'。'+(state.inputs.twl+state.inputs.twd+state.inputs.twc===0?'三个权重均为0，原程序采用等权。':'');
  const rivals=state.rows.filter(p=>p.pass&&p.id!==state.best);if(!rivals.some(p=>p.id===compareId))compareId=rivals[0]?.id||null;syncSelect('sel-compare-model',rivals,compareId);node('sel-comparison').innerHTML=comparison();
 }
 function mount(library){
  root=library;state=null;baseline=null;selected=null;compareId=null;cell=null;
  const controls=document.createElement('section');controls.className='sel-shared-controls';controls.innerHTML='<h3>流程计算 · 与案例演示同步</h3><p id="sel-live-status" role="status">正在加载原演示模型，计算就绪后可操作。</p><div class="sel-controls">'+control('lith','岩性')+control('grade','钢级')+wall()+control('completion','完井方式')+control('goal','目标预设')+'</div><p class="sel-note">以下五项图表读取原演示的当前结果；修改井况或目标会同步更新演示。EDU为虚构教学型号。</p>';
  root.querySelector('.expanded-intro').after(controls);
  const bodies=[
   '<div class="sel-buttons">'+names.map((v,i)=>b('focus',v,'data-rule="'+i+'" aria-pressed="'+(i===0)+'"')).join('')+'</div><div id="sel-input-graph"></div><p class="sel-observation" id="sel-rule-summary"></p>',
   '<div id="sel-matrix"></div><p class="sel-observation" id="sel-cell-detail" role="status"></p>',
   '<label class="sel-model-label">查看型号 <select id="sel-utility-model" aria-label="效用换算型号"></select></label><p class="sel-note" id="sel-utility-status"></p><div id="sel-utility-plot"></div>',
   '<div class="sel-weights">'+weights()+'</div><div class="sel-buttons">'+b('preset-depth','优先穿深')+b('preset-diameter','优先大孔径')+b('preset-cost','优先低成本')+b('baseline','保存当前排序为对照')+b('restore','恢复对照工况')+'</div><p class="sel-note" id="sel-baseline-status"></p><div class="sel-legend">'+['穿深贡献','孔径贡献','成本贡献'].map((v,i)=>'<span><i style="background:'+colors[i]+'"></i>'+v+'</span>').join('')+'<span>灰色虚框：保存的对照总分</span></div><div id="sel-contributions"></div>',
   '<label class="sel-model-label">与首选比较 <select id="sel-compare-model" aria-label="推荐比较型号"></select></label><div id="sel-comparison"></div>'
  ];
  ['输入与规则对应','逐型号约束判断','原始指标与固定效用','当前评分与对照排名','推荐依据与拒绝路径'].forEach((title,i)=>{const panel=document.createElement('section');panel.className='selection-live-panel';panel.innerHTML='<h5>'+title+'</h5>'+bodies[i];node('expanded-task-'+CASE+'-'+i).append(panel);});
  root.querySelectorAll('.sel-control').forEach(e=>e.disabled=true);
  root.addEventListener('input',e=>{if(e.target.matches('input.sel-control')&&state)command('set',{[e.target.dataset.field]:Number(e.target.value)});});
  root.addEventListener('change',e=>{if(e.target.matches('select.sel-control')&&state)command('set',{[e.target.dataset.field]:Number(e.target.value)});if(e.target.id==='sel-utility-model'){selected=e.target.value;render();}if(e.target.id==='sel-compare-model'){compareId=e.target.value;render();}});
  root.addEventListener('click',e=>{const btn=e.target.closest('[data-sel-action]');if(!btn||!state)return;const a=btn.dataset.selAction;
   if(a==='focus')focus=Number(btn.dataset.rule);if(a==='cell'){cell={id:btn.dataset.model,i:Number(btn.dataset.rule)};selected=cell.id;}if(a==='select')selected=btn.dataset.model;
   if(a==='baseline')baseline=JSON.parse(JSON.stringify(state));if(a==='restore')command('set',baseline.inputs);
   if(a.startsWith('preset-'))command('set',{goal:{'preset-depth':0,'preset-diameter':1,'preset-cost':2}[a]});render();
  });
  command('snapshot');
 }
 window.addEventListener('message',e=>{if(e.source!==frame()?.contentWindow||e.data?.type!=='petro-selection-state'||e.data.case!==CASE||!root?.isConnected)return;state=e.data.value;if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;render();});});
 window.PetroSelectionFlow={mount};
})();
