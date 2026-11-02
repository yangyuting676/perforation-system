(()=>{'use strict';
const root=new URL('../perforation-details/',document.currentScript.src);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const components={geometry:['wellbore','casing','cement','reservoir'],selection:['clearance','gun','penetration','large-entry'],evaluation:['layer-flow','layer-flow','production-monitor','logging-tool'],damage:['penetration','damage-zone','reservoir','radial-flow'],productivity:['radial-flow','wellbore','damage-zone','production-path'],cleanup:['wellbore','penetration','cleanup-debris','pressure-pulse'],network:['wellbore','aperture','entry-flow','flow-network'],depth:['ccl-collar','logging-tool','candidate-window','depth-reference'],lithology:['logging-tool','lithology','candidate-window','engineering-check']};
const scenes={geometry:['production-path','completion-clusters','physical-model'],selection:['clearance','large-entry','engineering-check'],evaluation:['production-monitor','layer-flow','engineering-check'],damage:['damage-zone','stress-rock','radial-flow'],productivity:['radial-flow','damage-zone','production-monitor'],cleanup:['cleanup-debris','pressure-pulse','measurement'],network:['entry-flow','flow-network','completion-clusters'],depth:['ccl-collar','depth-reference','engineering-check'],lithology:['lithology','candidate-window','engineering-check']};
const terms={geometry:['penetration','aperture','gun','stress-rock']};
function html(id,title='工程结构'){return `<figure class="detail-generated" data-detail-asset="${esc(id)}"><img src="${new URL(id+'.png',root).href}" alt="${esc(title)}：工程示意插图" loading="eager"><figcaption>结构示意，非实测图像</figcaption></figure>`;}
function component(c,i){return html(components[c.key]?.[i]||'engineering-check',c.title);}
function term(c,i){const fallback=['measurement','physical-model',components[c.key]?.[3]||'production-monitor','engineering-check'];return html((terms[c.key]||fallback)[i]||'engineering-check',c.background_terms?.[i]?.[0]||c.title);}
function scene(c,i){return html(scenes[c.key]?.[i]||'engineering-check',c.background_scenes?.[i]?.[0]||c.title);}
window.DetailIllustrations={html,component,term,scene,components,scenes,terms};
if(window.TopicReader){window.TopicReader.componentArt=(c,r,a,b,t,i)=>component(c,i);window.TopicReader.termArt=term;}
// Host P1 explanations in the main page, just like the other nine cases.
// Native iframe dialogs can move during focus/viewport synchronization, leaving
// their visible close button at a different hit position. One parent modal has
// a stable viewport and no delayed positioning or nested backdrop.
if(window===parent){
 let overlay=null,origin=null;
 function close(){if(!overlay)return;const old=overlay;overlay=null;old.close();old.remove();origin?.focus({preventScroll:true});origin=null;}
 window.addEventListener('message',e=>{
  const frame=document.getElementById('p1-engineering70');
  if(!frame||frame.contentWindow!==e.source||e.data?.type!=='petro-structure-open')return;
  if(typeof e.data.html!=='string')return;
  close();origin=frame;
  const box=document.createElement('dialog');box.className='p1-detail-dialog';
  box.innerHTML=e.data.html;
  for(const element of box.querySelectorAll('[src],[href]'))for(const attr of ['src','href']){
   const value=element.getAttribute(attr);if(value&&!value.startsWith('#'))element.setAttribute(attr,new URL(value,e.data.base||frame.src).href);
  }
  const title=box.querySelector('h3');if(title){title.id='p1-parent-detail-title';box.setAttribute('aria-labelledby',title.id);}
  const button=box.querySelector('header button');if(button){button.type='button';button.onclick=close;}
  box.addEventListener('cancel',ev=>{ev.preventDefault();close()});
  box.addEventListener('click',ev=>{if(ev.target===box)close()});
  document.body.append(box);overlay=box;box.showModal();
 });
 window.addEventListener('hashchange',close);
 const css=document.createElement('style');css.textContent='.p1-detail-dialog{width:min(1000px,calc(100vw - 32px));max-height:calc(100dvh - 48px);overflow:auto;padding:0;border:1px solid #b9d4cb;border-radius:16px;color:#194751;background:#fff}.p1-detail-dialog::backdrop{background:#173e4999;backdrop-filter:blur(4px)}.p1-detail-dialog header{display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;background:#fff;padding:16px 22px;border-bottom:1px solid #dce8e4;z-index:2}.p1-detail-dialog header h3{margin:0}.p1-detail-dialog .se-detail{padding:20px 24px;line-height:1.85}.p1-detail-dialog .se-crop,.p1-detail-dialog .pe-figure,.p1-detail-dialog .em-modal-art{width:min(480px,100%);margin:0 auto 18px}.p1-detail-dialog .se-detail-note{font-size:13px;color:#597670}.p1-detail-dialog svg{max-width:100%;height:auto}.p1-detail-dialog h4{color:#16796a;margin-bottom:4px}';document.head.append(css);
}
const style=document.createElement('style');style.textContent='.detail-generated{margin:0!important;background:#fff;border:1px solid #e1e9e5;border-radius:12px;padding:14px;overflow:hidden}.detail-generated img{display:block!important;position:static!important;inset:auto!important;transform:none!important;width:100%!important;height:auto!important;max-height:420px!important;object-fit:contain!important;border-radius:6px}.detail-generated figcaption{font-size:11px;line-height:1.7;color:#647b73;margin-top:10px}.se-dialog .se-crop{height:auto!important;aspect-ratio:auto!important;min-height:0!important;background:none!important}.se-dialog .se-crop>img{position:static!important;width:100%!important;height:auto!important;object-fit:contain!important}.pe-dialog .pe-figure{padding:0!important;background:none!important}.em-modal-art .detail-generated{border:0}.se-dialog:not(.pe-dialog):not(.em-dialog) .se-detail{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:16px;align-items:start}.se-dialog:not(.pe-dialog):not(.em-dialog) .se-crop{grid-row:1/3}.se-dialog .se-crop:after{display:none!important}.se-dialog.em-dialog{width:min(1000px,calc(100vw - 30px))!important}.se-dialog.em-dialog .se-detail{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);gap:0 20px;align-items:start}.se-dialog.em-dialog .em-modal-art{grid-column:1;grid-row:1/9;position:sticky;top:0}.se-dialog.em-dialog .se-detail h4,.se-dialog.em-dialog .se-detail p{grid-column:2}@media(max-width:600px){.se-dialog:not(.pe-dialog):not(.em-dialog) .se-detail,.se-dialog.em-dialog .se-detail{display:block}.se-dialog.em-dialog .em-modal-art{position:static}}';document.head.append(style);
})();