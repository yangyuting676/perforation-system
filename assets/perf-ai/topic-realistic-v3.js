/* AI material plates share one coordinate system with their clickable details. */
(()=>{'use strict';
const root=new URL('../perforation-figures/',document.currentScript.src),url=n=>new URL(n,root).href;
const img=(n,x,y,w,h)=>`<image href="${url(n)}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="none"/>`;
const txt=(x,y,s,size=18)=>`<text x="${x}" y="${y}" font-family="Microsoft YaHei,sans-serif" font-size="${size}" fill="#193d43">${s}</text>`;
const stroke=(d,c='#edfefa',w=2)=>`<path d="${d}" stroke="${c}" stroke-width="${w}" fill="none"/>`;
const captions={geometry:'地层穿深从岩石入口量起；入口孔径在套管开口处测量。',selection:'先核对通径与器材外径，再比较深穿透和大孔径的设计取向。'};
function labels(names,points){return names.map((s,i)=>{let x=20+i*210,p=points[i];return stroke(`M${x+95} 49L${p[0]} ${p[1]}`,'white',4)+stroke(`M${x+95} 49L${p[0]} ${p[1]}`,'#426b67',1)+`<g class="ti-hotspot" data-part="${i}" tabindex="0" role="button" aria-label="${s}说明"><rect x="${x}" y="10" width="190" height="38" rx="9" fill="white" stroke="#aec6bf"/>${txt(x+12,36,s+' ↗',19)}<circle cx="${p[0]}" cy="${p[1]}" r="9" fill="#ffffff60" stroke="#fcfffb" stroke-width="2"/></g>`}).join('')}
function dimension(x,y,end,label,vertical=false){const d=vertical?`M${x} ${y}V${end}M${x-6} ${y}H${x+6}M${x-6} ${end}H${x+6}`:`M${x} ${y}H${end}M${x} ${y-6}V${y+6}M${end} ${y-6}V${y+6}`;return stroke(d,'white',6)+stroke(d,'#155e5a',2)+`<rect x="${vertical?x-150:(x+end)/2-112}" y="${vertical?(y+end)/2-16:y+12}" width="${vertical?135:224}" height="31" rx="6" fill="#fffffff2"/>`+txt(vertical?x-143:(x+end)/2-103,vertical?(y+end)/2+7:y+34,label,17)}
function geometry(a,b,t,clean=false,term=-1,inspect=false){
 // One complete source image: never stretch a cut-out tunnel over another plate.
 const end=705,entry=320,openingX=197,top=233,bottom=302;
 let body=img('geometry-structure-v2.png',26,80,808,404);
 if(term!==1)body+=(clean?'':'<g class="ti-hotspot" data-term="0" tabindex="0" role="button" aria-label="地层穿深 L 说明">')+dimension(entry,443,end,'L · 岩石入口至孔道末端')+(clean?'':'</g>');
 if(term!==0)body+=(clean?'':'<g class="ti-hotspot" data-term="1" tabindex="0" role="button" aria-label="套管入口孔径 D 说明">')+dimension(openingX,top,bottom,'D · 套管开口',true)+(clean?'':'</g>');
 if(inspect){
  const x=entry+(end-entry)*a/100,range=8+b*.24;
  body+=stroke(`M${x} 224V330`,'#e9b95b',2)+`<circle cx="${x}" cy="276" r="7" fill="#e9b95b" stroke="white" stroke-width="2"/><ellipse cx="197" cy="268" rx="${range}" ry="${range+8}" fill="none" stroke="#e9b95b" stroke-width="2" stroke-dasharray="5 4"/>`;
 }
 if(!clean)body+=labels(['井筒','套管','水泥环','储层岩石'],[[99,170],[194,180],[270,170],[690,170]]);
 body+=txt(30,535,captions.geometry,18)+txt(30,570,inspect?'移动观察标记识别测量位置；原图几何保持不变。':'完整写实剖面 · 结构示意，不按工程比例',16);
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 860 595" class="topic-realistic-v3" data-visual-key="geometry" role="group" aria-label="井筒、套管、水泥环与储层孔道的完整写实剖面"><rect width="860" height="595" rx="16" fill="#f4f7f5"/>${body}</svg>`;
}
function selectionGoal(i){
 const crop=i===2?'110 118 710 310':'930 118 710 310';
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 860 470" role="img" aria-label="${i===2?'深穿透目标':'大孔径目标'}"><rect width="860" height="470" fill="#f4f7f5"/>${txt(28,42,i===2?'深穿透取向 · 相对细长的通道':'大孔径取向 · 相对短宽的通道',24)}<svg x="26" y="80" width="808" height="320" viewBox="${crop}">${img('selection.png',0,0,1672,941)}</svg>${txt(28,442,'设计取向示意；具体性能以对应型号的试验资料为准。',18)}</svg>`;
}
function selection(a,b,t,clean=false){
 const items=[['井筒通径',20,10,75,182],['器材外径',650,10,358,250],['深穿透目标',100,609,342,440],['大孔径目标',550,609,589,438]];
 const marks=clean?'':items.map(([name,x,y,px,py],i)=>`<path d="M${x+95} ${y<100?y+38:y}L${px} ${py}" fill="none" stroke="white" stroke-width="4"/><path d="M${x+95} ${y<100?y+38:y}L${px} ${py}" fill="none" stroke="#426b67" stroke-width="1.3"/><g class="ti-hotspot" data-part="${i}" tabindex="0" role="button" aria-label="${name}说明"><rect x="${x}" y="${y}" width="190" height="38" rx="9" fill="white" stroke="#aec6bf"/>${txt(x+12,y+26,name+' ↗',19)}<circle cx="${px}" cy="${py}" r="8" fill="#ffffff70" stroke="#155e5a" stroke-width="2"/></g>`).join('');
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 860 665" class="topic-realistic-v3" data-visual-key="selection" role="group" aria-label="射孔弹型选型写实主图：上方套管与射孔器通径配合，下方深穿透与大孔径成孔目标"><rect width="860" height="665" rx="16" fill="#f4f7f5"/>${img('selection-anatomy-v4.png',26,65,808,539)}${marks}</svg>`;
}
const views={geometry:['35 80 135 404','170 110 50 355','220 90 100 380','325 90 490 380'],selection:['670 110 145 330','120 160 540 240','430 375 385 100','430 375 385 100'],evaluation:['265 110 340 180','265 385 340 180','170 65 125 235','175 270 130 170'],damage:['365 265 130 140','275 180 310 300','600 160 190 290','220 180 380 330'],productivity:['590 150 220 260','370 75 125 480','300 235 290 245','180 145 420 335'],cleanup:['40 100 170 450','200 245 600 180','420 310 345 100','120 240 420 190'],network:['45 180 750 110','315 240 85 120','425 250 150 300','600 240 160 300'],depth:['145 235 80 80','170 270 65 175','385 385 200 100','595 90 180 480'],lithology:['80 100 220 430','430 170 350 130','85 200 650 200','430 100 350 460']};
function render(c,a,b,t,scene=0,anatomy=false,clean=false){
 let s;if(c.key==='geometry')s=geometry(a,b,t,clean,-1,!anatomy);else if(c.key==='selection')s=selection(a,b,t,clean);else if(c.key==='evaluation')s=window.EvaluationRealFigure.render(a,b,t,{clean});else s=window.EngineeringRealFigures.render(c.key,a,b,t,{clean});
 if(!anatomy&&scene===2){s=s.replace(/<\/svg>$/,`<path d="M${350+t*410} 100V480" stroke="#b57b35" stroke-width="2" stroke-dasharray="7 5"/><circle cx="${350+t*410}" cy="300" r="20" fill="none" stroke="#b57b35" stroke-width="3"/></svg>`)}
 if(!anatomy&&scene===1&&c.key!=='geometry'){
 const one=render(c,35,35,t,0,true,true),two=render(c,a,b,t,0,true,true);
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 860 430" role="img" aria-label="固定基准与当前参数的写实对照"><rect width="860" height="430" rx="14" fill="#f4f7f5"/>${txt(20,28,'固定基准 · 35% / 35%',20)}${txt(455,28,'当前设置 · '+a+'% / '+b+'%',20)}<svg x="0" y="40" width="420" height="325" viewBox="0 0 860 650">${one}</svg><svg x="440" y="40" width="420" height="325" viewBox="0 0 860 650">${two}</svg>${txt(25,405,'在同一材料剖面内比较参数；定量结果见案例演示。',19)}</svg>`}
 return s;
}
function clipDetail(svg){
 const m=svg.match(/viewBox="([\d. -]+)"/);if(!m)return svg;
 const [x,y,w,h]=m[1].trim().split(/\s+/).map(Number),id='detail-crop-'+[x,y,w,h].join('-');
 const start=svg.indexOf('>')+1,end=svg.lastIndexOf('</svg>');
 return svg.slice(0,start)+`<defs><clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath></defs><g clip-path="url(#${id})">`+svg.slice(start,end)+'</g>'+svg.slice(end);
}
const original=window.TopicInteraction;
window.TopicInteraction=c=>{const r=original(c);r.render=(a,b,t,scene=0,anatomy=false)=>render(c,a,b,t,scene,anatomy);r.detail=(a,b,t,i)=>clipDetail(c.key==='selection'&&i>=2?selectionGoal(i):c.key==='evaluation'?window.EvaluationRealFigure.detail(a,b,t,i):(['geometry','selection'].includes(c.key)?render(c,a,b,t,0,true,true).replace(/viewBox="0 0 860 (?:595|610|650)"/,`viewBox="${views[c.key][i]}"`):window.EngineeringRealFigures.detail(c.key,a,b,t,i)));return r};
window.TopicRealistic={geometry,render,views};
const style=document.createElement('style');style.textContent='.ti-canvas svg.topic-realistic-v3{width:100%;height:auto;max-height:650px}.ti-canvas svg.topic-realistic-v3[data-visual-key="geometry"]{max-height:580px}.ti-canvas svg.topic-realistic-v3[data-visual-key="selection"]{max-height:520px}.ti-hotspot{cursor:pointer}.ti-hotspot:focus{outline:2px solid #298a77}.ti-canvas svg text{paint-order:stroke;stroke:#ffffff20;stroke-width:1px}';document.head.append(style);
})();
