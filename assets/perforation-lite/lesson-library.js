(function(){
 'use strict';
 const id='p1-lesson-library';let currentModel=null;
 const make=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;};
 const frame=()=>document.querySelector('#case-demo-root iframe');
 function jump(target){target?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});if(target){target.focus({preventScroll:true});}}
 function command(lesson,action){frame()?.contentWindow.postMessage({type:'petro-p1-lesson-command',lesson,action},'*');jump(document.getElementById('case-demo-root'));}
 function render(data){
  let root=document.getElementById(id);
  if(root&&currentModel===data.model){activate(root,data.active);return;}
  const fresh=!root;
  if(!root){root=make('section','p1-lessons');root.id=id;root.tabIndex=-1;root.setAttribute('aria-labelledby','p1-lessons-title');document.getElementById('case-demo-root').after(root);}
  currentModel=data.model;root.replaceChildren();
  const header=make('div','p1-lessons-heading');
  const heading=make('div');heading.append(make('h2',null,'六节课 · 讲解与练习'));heading.firstChild.id='p1-lessons-title';
  heading.append(make('p',null,'结合上方演示，依次理解工程问题、参数含义、基准比较与方案优选。六节内容在本页完整展开。'));
  const back=make('button','p1-lesson-button','返回上方演示');back.type='button';back.onclick=()=>jump(document.getElementById('case-demo-root'));header.append(heading,back);root.append(header);
  const nav=make('nav','p1-lesson-nav');nav.setAttribute('aria-label','六节课目录');
  const names=['工程问题','认识参数','建立基准','单变量与交互','结果读图','优选与验证'];
  data.lessons.forEach((l,i)=>{const a=make('a',null);a.href='#p1-lesson-'+(i+1);a.append(make('span',null,String(i+1).padStart(2,'0')),make('b',null,names[i]));a.onclick=e=>{e.preventDefault();jump(document.getElementById('p1-lesson-'+(i+1)));};nav.append(a);});root.append(nav);
  const model=make('p','p1-lessons-model','文中计算示例随上方模型切换更新。当前模型：'+(data.model==='paper'?'文献响应面 · 式(15)':'根据表3重新最小二乘拟合')+'。');root.append(model);
  data.lessons.forEach((l,i)=>{
   const article=make('article','p1-lesson');article.id='p1-lesson-'+(i+1);article.tabIndex=-1;
   const head=make('header','p1-lesson-heading');head.append(make('span','p1-lesson-number',String(i+1).padStart(2,'0')));
   const intro=make('div');intro.append(make('h3',null,l.title),make('p',null,l.summary));head.append(intro);article.append(head);
   const body=make('div','p1-lesson-body');l.blocks.forEach(b=>{const topic=make('section','p1-lesson-topic');topic.append(make('h4',null,b.heading),make('p',null,b.text));body.append(topic);});article.append(body);
   const practice=make('div','p1-lesson-practice');practice.append(make('strong',null,'回到演示动手试一试'));
   const buttons=make('div');l.actions.forEach((label,j)=>{const b=make('button','p1-lesson-button',label);b.type='button';b.title='应用此操作并返回上方演示';b.onclick=()=>command(i,j);buttons.append(b);});practice.append(buttons);article.append(practice);root.append(article);
  });
  const foot=make('p','p1-lessons-source','依据：Liu等（2021）表2–5、式(14–15)。图示、响应面重算与练习用于理解本算例；模型预测、论文报告值和数值模拟值分别标明来源。');root.append(foot);activate(root,data.active);
  if(fresh){document.getElementById('case-demo-root').tabIndex=-1;}
 }
 function activate(root,index){root.querySelectorAll('.p1-lesson-nav a').forEach((a,i)=>{if(i===index)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}
 window.addEventListener('message',e=>{
  if(!frame()||e.source!==frame().contentWindow)return;
  const d=e.data;
  if(d?.type==='petro-p1-lesson-library'&&Array.isArray(d.lessons)&&d.lessons.length===6)render(d);
  if(d?.type==='petro-p1-lesson-jump'&&Number.isInteger(d.lesson))jump(document.getElementById(d.lesson===0?id:'p1-lesson-'+(d.lesson+1)));
 });
})();
