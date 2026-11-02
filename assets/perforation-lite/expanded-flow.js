(function(){
 'use strict';
 const params=new URLSearchParams(location.search),inline=params.get('inline')==='1';
 const go=i=>{const target=document.getElementById('inline-flow-step-'+i);if(target)parent.postMessage({type:'petro-inline-flow-focus',y:target.getBoundingClientRect().top},'*');};
 if(!flowPanel){
  document.documentElement.classList.add('inline-flow-parent');
  document.querySelector('.art-note').textContent='点击任务节点，定位下方已展开的操作与说明。';
  document.addEventListener('click',e=>{const b=e.target.closest('[data-step]');if(b)parent.postMessage({type:'petro-inline-architecture-jump',step:+b.dataset.step},'*');});
  window.addEventListener('message',e=>{if(e.source!==parent||e.data?.type!=='petro-inline-task-state')return;restoreFlow(e.data.state);drawArchitecture();});
  parent.postMessage({type:'petro-inline-architecture-ready',state:flowState()},'*');
 }else if(inline){
  document.documentElement.classList.add('inline-flow-child');
  const fixedStep=Math.max(0,Math.min(7,+params.get('step')||0));
  document.querySelector('.flow-io').open=true;
  let receiving=false,pending=false;
  function send(){if(receiving||pending)return;pending=true;queueMicrotask(()=>{pending=false;if(receiving)return;const destination=step;if(step!==fixedStep){step=fixedStep;render();parent.postMessage({type:'petro-inline-task-jump',step:destination},'*');}parent.postMessage({type:'petro-inline-task-state',state:flowState()},'*');queueHeight();});}
  document.addEventListener('input',send);document.addEventListener('change',send);document.addEventListener('click',e=>{if(e.target.closest('button'))send();});
  window.addEventListener('message',e=>{if(e.source!==parent||e.data?.type!=='petro-inline-task-state')return;receiving=true;restoreFlow(e.data.state);step=fixedStep;render();receiving=false;queueHeight();});
  parent.postMessage({type:'petro-inline-task-ready',state:flowState()},'*');queueHeight();
 }
})();
