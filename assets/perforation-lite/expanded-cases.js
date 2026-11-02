(function(){
 'use strict';
 const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
 let taskAnchor=null,anchorUntil=0;
 function jump(node){if(!node)return;if(node.id.startsWith('inline-flow-step-')){taskAnchor=node;anchorUntil=performance.now()+3000;node.scrollIntoView({block:'start',behavior:'instant'});node.focus({preventScroll:true});return;}node.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});node.focus({preventScroll:true});}
 // The same atlas crop is one shared illustration, even when its lesson-specific aria label differs.
 function artKey(figure){const image=figure.querySelector('image,img');if(!image)return null;const svg=figure.querySelector('svg');return [image.getAttribute('href')||image.getAttribute('src'),svg?.getAttribute('viewBox')||'',image.getAttribute('x')||'',image.getAttribute('y')||''].join('|');}
 function joinCourseFigures(root){
  const articles=[...root.querySelectorAll(':scope>.expanded-article')];let group=null;
  articles.forEach(article=>{
   const figure=article.querySelector('.expanded-figure'),key=artKey(figure);
   // Computational diagrams are independent figures; only repeated illustration assets are grouped.
   if(!key){group=null;return;}
   if(!group||group.key!==key){
    const row=el('section','expanded-course-group'),visual=el('div','expanded-shared-visual'),content=el('div','expanded-shared-content');
    article.before(row);visual.append(figure);row.append(visual,content);group={key,row,figure,content,articles:[]};
   }else figure.remove();
   article.querySelector('.expanded-reading').classList.add('expanded-reading-text');group.content.append(article);group.articles.push(article);
   const names=group.articles.map(a=>a.querySelector('.expanded-article-heading h3').textContent);
   group.figure.querySelector('figcaption').textContent=names.length>1?'共用配图 · '+names.join(' → '):'对应课程示意 · '+names[0];
  });
 }
 function section(c,kind){
  const root=el('section','p1-lessons expanded-library');root.id='expanded-'+kind+'-'+c.id;root.tabIndex=-1;
  const title=el('h2',null,kind==='course'?'六节课 · 完整讲解':'任务流程 · 逐步说明');root.setAttribute('aria-labelledby',root.id+'-title');title.id=root.id+'-title';root.append(title);
  root.append(el('p','expanded-intro',kind==='course'?'结合上方演示阅读。每节课的原理、练习、检查与结果解释均在本页展开。':'保留上方四阶段架构，下面逐项展开各任务的输入、方法、输出与检查。点击架构中的任务可定位对应内容。'));
  const nav=el('nav','expanded-nav');nav.setAttribute('aria-label',kind==='course'?'课程目录':'任务目录');root.append(nav);
  const count=kind==='course'?c.lessons.length:c.steps.length;
  for(let i=0;i<count;i++){
   const name=kind==='course'?c.lessons[i][0]:c.steps[i].name,id=root.id+'-'+i;
   const link=el('a',null,String(i+1).padStart(2,'0')+' '+name);link.href='#'+id;link.onclick=e=>{e.preventDefault();jump(document.getElementById(id));};nav.append(link);
   const article=el('article','expanded-article');article.id=id;article.tabIndex=-1;
   const header=el('div','expanded-article-heading');header.append(el('span',null,String(i+1).padStart(2,'0')),el('h3',null,name));article.append(header);
   const body=el('div','expanded-reading'),figure=el('figure','expanded-figure');
   figure.innerHTML=kind==='course'?TopicReader.courseArt(c,i):TopicReader.stepArt(c,i);
   figure.append(el('figcaption',null,kind==='course'?'本课方法图解':'本任务方法图解'));
   const text=el('div','expanded-text');const blocks=kind==='course'?TopicReader.course(c,i):TopicReader.step(c,i);
   blocks.forEach(([heading,content])=>{const topic=el('section');if(heading!==name)topic.append(el('h4',null,heading));topic.append(el('p',null,content));text.append(topic);});
   body.append(figure,text);article.append(body);
   if(kind==='course'){const back=el('button','p1-lesson-button','返回上方演示');back.type='button';back.onclick=()=>jump(document.getElementById('case-demo-root'));article.append(back);}
   root.append(article);
  }
  if(kind==='course')joinCourseFigures(root);
  return root;
 }
 function current(){const scene=location.hash.match(/^#\/scene\/(p[1-4])(?:\?|$)/);if(!scene||!window.Cases)return;const id=new URLSearchParams(location.hash.split('?')[1]||'').get('case');return Cases.bySceneAll(scene[1]).find(c=>c.id===id)||Cases.bySceneAll(scene[1])[0];}
 function flowStageArt(c,k,original){
  if(c.key!=='selection')return original.cloneNode(true);
  const names=['01-input-rules','02-hard-constraints','03-utility-ranking','04-explain-review'];
  const descriptions=['将井况输入对应到5个EDU虚构教学型号的适配关系，记录规则来源与版本','岩性、钢级、壁厚和完井四项约束取逻辑与，失败则排除并记录原因','用固定L/700、D/25、1−C/4效用，归一化权重后只对可行型号评分排序','无可行型号则拒绝推荐；否则解释型号和排名，保留规则与评分依据供复核'];
  const img=el('img','selection-workflow-art');img.src='assets/perforation-lite/figures/selection-workflow/'+names[k]+'.svg?v=20261029-selection-flow-v1';img.alt=descriptions[k];img.width=640;img.height=620;img.decoding='async';return img;
 }
 function stageRows(root,stages){
  root.classList.add('expanded-task-library');root.querySelector('.expanded-nav')?.remove();
  stages.forEach((stage,k)=>{const row=el('section','expanded-stage-row'),aside=el('div','expanded-stage-visual'),heading=el('h3',null,String(k+1).padStart(2,'0')+' '+stage.name),figure=el('figure');figure.append(stage.image);figure.append(el('figcaption',null,stage.caption||stage.name+'阶段共用配图'));aside.append(heading,figure);const content=el('div','expanded-stage-tasks');stage.tasks.forEach(article=>{const repeated=article.querySelector('.expanded-figure');if(repeated&&artKey(repeated)&&artKey(repeated).split('|')[0]===(stage.sharedArtSource||artKey(figure)?.split('|')[0])){repeated.remove();article.querySelector('.expanded-reading').classList.add('expanded-reading-text');}const old=article.querySelector('.expanded-article-heading h3')||article.querySelector(':scope>h3');if(old){const h=el('h4',null,old.textContent);old.replaceWith(h);}content.append(article);});row.append(aside,content);root.append(row);});
  const intro=root.querySelector('.expanded-intro');if(intro)intro.textContent='按数据收集、建模、分析与应用依次阅读，阶段配图与对应任务放在一起。';
 }
 function p1Tasks(){
  const architecture=document.getElementById('p1-lite-flow');if(!architecture||document.getElementById('inline-flow-tasks'))return;
  const names=['收集研究资料','核对数据与编码','建立物理模型','构建响应面','分析参数交互','施加约束并优选','验证候选结果','形成应用方案'];
  const library=el('section','p1-lessons expanded-library');library.id='inline-flow-tasks';library.append(el('h2',null,'八项任务 · 操作与讲解'),el('p','expanded-intro','各项内容直接展开。参数、约束、候选与完成记录在已加载的任务之间同步。'));
  const nav=el('nav','expanded-nav');nav.setAttribute('aria-label','交互任务目录');library.append(nav);
  names.forEach((name,i)=>{const article=el('article','inline-flow-task');article.id='inline-flow-step-'+i;article.tabIndex=-1;article.append(el('h3',null,String(i+1).padStart(2,'0')+' '+name));const f=el('iframe');f.title='步骤'+(i+1)+'：'+name;f.dataset.inlineStep=i;f.loading='eager';f.scrolling='no';f.setAttribute('sandbox','allow-scripts allow-downloads allow-popups allow-popups-to-escape-sandbox');f.src='assets/perforation-lite/flow.html?panel=1&inline=1&step='+i+'&v=20261028-stage-paired';article.append(f);library.append(article);const a=el('a',null,String(i+1).padStart(2,'0')+' '+name);a.href='#'+article.id;a.onclick=e=>{e.preventDefault();jump(article);};nav.append(a);});
  const stages=['数据收集','建模','分析','应用'].map((name,k)=>{const image=el('div','expanded-p1-stage-image');image.setAttribute('role','img');image.setAttribute('aria-label',name+'阶段示意图');image.style.backgroundPosition=(k*100/3)+'% center';return {name,image,tasks:[...library.querySelectorAll('.inline-flow-task')].slice(k*2,k*2+2)};});
  stageRows(library,stages);architecture.after(library);architecture.remove();library.researchState=null;
  document.querySelector('.panel[data-panel="flow"]')?.classList.add('expanded-flow-page');
 }
 function render(){
  if(document.querySelector(".ai-revised-flow")||document.getElementById("case-demo-root")?.dataset.aiRevised==="true")return;
  const selected=current();if(selected?.id==='perforation-viz-p1-334-v2'){p1Tasks();return;}const c=window.PetroInlineCaseConfig?.[selected?.id];if(!c||!window.TopicReader)return;
  const demo=document.getElementById('case-demo-root'),flow=document.querySelector('.panel[data-panel="flow"]');
  if(demo&&!document.getElementById('expanded-course-'+c.id)){if(c.id==='perforation-viz-p2-334-v2'&&window.PetroGeometryCourse)window.PetroGeometryCourse.mount(demo);else demo.after(section(c,'course'));}
  if(flow&&!document.getElementById('expanded-task-'+c.id)){
   const architecture=flow.querySelector('.cc-flow-stages');
   const library=section(c,'task');if(c.key==='selection')library.classList.add('selection-workflow-library');
   if(architecture){const stages=[...architecture.querySelectorAll('.cc-flow-stage')].map((stage,k)=>({name:stage.querySelector('h3').textContent.replace(/^\d+\s*/,''),image:flowStageArt(c,k,stage.querySelector('svg')),sharedArtSource:stage.querySelector('svg image')?.getAttribute('href'),caption:c.key==='selection'?'流程方法图 · '+stage.querySelector('h3').textContent.replace(/^\d+\s*/,'')+'（非当前工况结果）':null,tasks:(c.key==='selection'?[[0],[1],[2,3],[4]][k].map(n=>library.querySelector('#expanded-task-'+c.id+'-'+n)):[...stage.querySelectorAll('[data-cc-step]')].map(b=>library.querySelector('#expanded-task-'+c.id+'-'+b.dataset.ccStep))).filter(Boolean)}));stageRows(library,stages);architecture.after(library);architecture.remove();}else flow.append(library);
   flow.classList.add('expanded-flow-page');
   if(c.key==='selection')window.PetroSelectionFlow?.mount(library);
  }
  document.querySelectorAll('[data-cc-step],[data-cc-lesson]').forEach(b=>{if(b.dataset.ccCase===c.id){const text=b.textContent.replace(/↗/g,'');if(text!==b.textContent)b.textContent=text;b.title='定位下方已展开的内容';}});
 }
 window.PetroExpanded={jumpLesson(id,n){render();jump(document.getElementById('expanded-course-'+id+'-'+n));},jumpTask(id,n){render();jump(document.getElementById('expanded-task-'+id+'-'+n));}};
 let queued=false;new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;render();});}).observe(document.getElementById('view'),{childList:true,subtree:true});
 window.addEventListener('hashchange',render);
 window.addEventListener('message',e=>{if(e.data?.type!=='petro-inline-flow-focus')return;const f=[...document.querySelectorAll('.panel[data-panel="flow"] iframe')].find(f=>f.contentWindow===e.source);if(!f||!Number.isFinite(e.data.y))return;window.scrollBy({top:f.getBoundingClientRect().top+e.data.y-105,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});});
 window.addEventListener('message',e=>{
  const library=document.getElementById('inline-flow-tasks'),architecture=document.getElementById('p1-lite-flow');if(!library)return;
  const frames=[architecture,...library.querySelectorAll('iframe')].filter(Boolean),f=frames.find(f=>f.contentWindow===e.source);if(!f)return;const d=e.data;
  if(d?.type==='petro-lite-height'&&taskAnchor?.isConnected&&performance.now()<anchorUntil)requestAnimationFrame(()=>{if(taskAnchor?.isConnected)window.scrollBy({top:taskAnchor.getBoundingClientRect().top-110,behavior:'instant'});});
  if(d?.type==='petro-inline-architecture-ready'){if(!library.researchState)library.researchState=d.state;frames.forEach(other=>other.contentWindow.postMessage({type:'petro-inline-task-state',state:library.researchState},'*'));}
  if(d?.type==='petro-inline-task-ready'){if(!library.researchState)library.researchState=d.state;f.contentWindow.postMessage({type:'petro-inline-task-state',state:library.researchState},'*');}
  if(d?.type==='petro-inline-task-state'){library.researchState=d.state;frames.forEach(other=>{if(other!==f)other.contentWindow.postMessage({type:'petro-inline-task-state',state:d.state},'*');});}
  if((d?.type==='petro-inline-task-jump'||d?.type==='petro-inline-architecture-jump')&&Number.isInteger(d.step))jump(document.getElementById('inline-flow-step-'+d.step));
 });
 render();
})();
