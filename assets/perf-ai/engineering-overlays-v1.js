/* Coordinates are calibrated to each complete 1536 x 1024 generated scene.
   Overlays illustrate the stated teaching relations, not a solved physical field. */
(()=>{'use strict';
const green='#26d6b7', amber='#efaa50', blue='#55bbf0';
const num=v=>Number(v).toLocaleString('zh-CN',{maximumFractionDigits:2});
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const line=(x,y,u,v,c=green,w=3,dash='')=>`<path d="M${x} ${y}L${u} ${v}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" ${dash?`stroke-dasharray="${dash}"`:''}/>`;
const dot=(x,y,r=5,c=green)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" stroke="white" stroke-width="1.5"/>`;
const ring=(x,y,rx,ry,c=green,op=.8,w=3)=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="none" stroke="${c}" stroke-width="${w}" opacity="${op}"/>`;
const box=(x,y,w,h,c=green,op=.14)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" fill="${c}" fill-opacity="${op}" stroke="${c}" stroke-width="2"/>`;
function label(x,y,text,c='#175c50',anchor='start'){const w=Math.max(74,Array.from(text).reduce((s,ch)=>s+(ch.charCodeAt(0)>255?17:9),0)+22),xx=anchor==='end'?x-w:anchor==='middle'?x-w/2:x;return `<g class="es-annotation"><rect x="${xx}" y="${y-23}" width="${w}" height="34" rx="6" fill="white" fill-opacity=".94" stroke="${c}" stroke-opacity=".35"/><text x="${xx+11}" y="${y}" fill="${c}" font-size="17">${esc(text)}</text></g>`;}
function dim(x,y,u,v,text,c=green){const dx=u-x,dy=v-y,l=Math.hypot(dx,dy)||1,nx=-dy/l*7,ny=dx/l*7;return line(x,y,u,v,'#173f38',6)+line(x,y,u,v,c,3)+line(x-nx,y-ny,x+nx,y+ny,c)+line(u-nx,v-ny,u+nx,v+ny,c)+label((x+u)/2,(y+v)/2-15,text,'#175c50','middle');}
function path(points,c=green,w=4,opacity=.9){return `<polyline points="${points.map(p=>p.join(',')).join(' ')}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" opacity="${opacity}"/>`;}
function flow(points,t,strength=1,c=green){
 if(strength<=0)return '';const weight=strength/(.6+strength),speed=.8+2*Math.sqrt(strength),desired=Math.min(16,Math.max(3,Math.round(4+4*Math.sqrt(strength))));
 let h=path(points,'#16493e',4+8*weight,.6)+path(points,c,2+6*weight,.8);
 const lens=points.slice(1).map((p,i)=>Math.hypot(p[0]-points[i][0],p[1]-points[i][1])),total=lens.reduce((a,b)=>a+b,0),count=Math.min(desired,Math.max(1,Math.floor(total/65)));
 for(let i=0;i<count;i++){let d=((t*speed+i/count)%1)*total,j=0;while(j<lens.length-1&&d>lens[j])d-=lens[j++];const f=d/(lens[j]||1),a=points[j],b=points[j+1],x=a[0]+(b[0]-a[0])*f,y=a[1]+(b[1]-a[1])*f,angle=Math.atan2(b[1]-a[1],b[0]-a[0])*180/Math.PI,size=8+6*weight;
 h+=`<path data-effect="flow-arrow" d="M${size} 0L${-size} ${size*.55}L${-size*.6} 0L${-size} ${-size*.55}Z" transform="translate(${x} ${y}) rotate(${angle})" fill="${c}" stroke="white" stroke-width="1.5"/>`;
 }return h;
}
function fans(cx,cy,left,right,strength,t){let h='';for(let i=0;i<5;i++){let d=(i-2)*35;h+=flow([[left,cy+d],[cx-85,cy+d*.5],[cx-15,cy]],t,strength/3)+flow([[right,cy+d],[cx+85,cy+d*.5],[cx+15,cy]],t+.11,strength/3);}return h;}
const compareIds=new Set(['geometry-2','selection-0','selection-1','selection-2','evaluation-2','lithology-2','productivity-2','cleanup-2','network-2','depth-1','depth-2']);
const readings={
 'geometry-0':'改变穿深会移动孔道量尺终点；改变损害范围会移动边界。亮色箭头沿孔道进入井筒。',
 'geometry-1':'第二簇入口越大、背压越小，其注入箭头越密、越快；三簇份额同步重新分配。',
 'geometry-2':'覆盖带表示已有工况范围；橙色查询点移到带外时标记为外推。它不是岩石内的空间覆盖。',
 'selection-0':'圆形放大示意直接比较通径和工具外径；两圈之间的余隙变窄或变红，表示通过条件的改变。',
 'selection-1':'两张候选图的评分条随归一化偏好变化；当前偏好由评分较高的候选表示。',
 'selection-2':'压力表指针与向内作用箭头随压力变化；温度计和工具暖色随温度变化。红色表示超过示例边界。',
 'evaluation-0':'井口观测指示随措施后指标变化；橙色对照区间显示同期制度影响，不能解释为措施净效果。',
 'evaluation-1':'两层流入箭头的速度、宽度和密度分别由对应流量控制，汇流箭头表示两层合计。',
 'evaluation-2':'调整生产压差，观察压力表与孔道驱动标记；调整开井时率，观察24小时等效生产窗口。两项条件须分别核对后，才能比较措施响应。',
 'lithology-0':'扫描标记沿测量位置移动；GR和孔隙度读数直接改变标尺位置及初筛状态，不反演底图岩性。',
 'lithology-1':'窗口上下界随中心和厚度移动；白色扫描线在当前窗口内巡查，亮色区分与示例砂岩的交叠。',
 'lithology-2':'储层证据和工程复核分别越过各自门槛；两项都满足才显示双重通过。',
 'damage-0':'损害范围扩大时标记带加宽；局部渗透率降低时流入指示减弱，表皮按界面给定关系计算。',
 'damage-1':'左侧为无损害参照，右侧为当前损害条件。损害半径和渗透率共同控制右侧相对流入指示。',
 'damage-2':'分别显示损害和其他表皮分量；箭头表达合计阻力对应的相对流入，表皮分量与损害半径分别阅读。',
 'productivity-0':'两项压力之差控制流入箭头。压差为零或为负时，亮色生产箭头停止。',
 'productivity-1':'相对产能系数降低时，汇入井筒的亮色箭头显著变慢、变细；不把表皮画成孔道长度。',
 'productivity-2':'阴影选择当前核对窗口，观测点的离散随扰动变化；本图用于检查资料的一致性。',
 'cleanup-0':'颗粒沿孔道回流到井筒；压差增大使回流加快，阻力增大使其减慢，零压差时停止。',
 'cleanup-1':'脉冲前沿沿孔道移动，压力衰减控制前沿亮度；持续时间后亮色脉冲消失。',
 'cleanup-2':'观测组数改变记录点数量，测量扰动改变点的离散；记录点代表重复测量。',
 'network-0':'入口孔径改变入口标记尺度，压差和面积共同改变穿过入口的流动箭头。',
 'network-1':'第二孔孔径和背压改变其支路亮度、速度及份额，其余支路按共同总量重新归一化。',
 'network-2':'亮色孔眼表示当前配置；簇数改变分组数量，每簇孔数改变组内孔眼数。底图提供井筒与层位参照。',
 'depth-0':'探测位置沿套管移动；经过示例接箍位置时响应增强，噪声影响信号读数而非工具尺寸。',
 'depth-1':'橙色为观测位置，蓝色为施加校正后的层位；校正量改变蓝色标记的位置和残差。',
 'depth-2':'基准修正和伸长修正各自改变读数位置；虚线为原始基准，便于比较修正前后读数。'
};
const mechanism=id=>({mode:compareIds.has(id)?'compare':'process',reading:readings[id]});
function plate(x,y,w,h){return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" fill="#fffffff0" stroke="#cbded8" stroke-width="1.5"/>`;}
function meter(x,y,w,v,max,title,limit=null,color=green){const f=Math.max(0,Math.min(1,v/max));return `<g data-effect="meter">${plate(x,y,w,77)}<text x="${x+14}" y="${y+25}" fill="#244e48" font-size="17">${esc(title)} ${num(v)}</text><path d="M${x+16} ${y+52}h${w-32}" stroke="#dce9e4" stroke-width="14" stroke-linecap="round"/><path d="M${x+16} ${y+52}h${(w-32)*f}" stroke="${color}" stroke-width="14" stroke-linecap="round"/>${limit===null?'':line(x+16+(w-32)*limit/max,y+38,x+16+(w-32)*limit/max,y+67,'#a86a24',3)}</g>`;}
function gauge(cx,cy,value,max,limit,title,unit){const angle=-225+270*value/max,a=angle*Math.PI/180,c=value>limit?'#d35a39':green;return `<g data-effect="pressure-gauge">${plate(cx-100,cy-105,200,205)}<circle cx="${cx}" cy="${cy}" r="70" fill="#f8fbf9" stroke="#a7beb4" stroke-width="3"/>${Array.from({length:8},(_,i)=>{let q=(-225+270*i/7)*Math.PI/180;return line(cx+57*Math.cos(q),cy+57*Math.sin(q),cx+67*Math.cos(q),cy+67*Math.sin(q),'#607c70',2);}).join('')}<path d="M${cx} ${cy}L${cx+55*Math.cos(a)} ${cy+55*Math.sin(a)}" stroke="${c}" stroke-width="7" stroke-linecap="round"/>${dot(cx,cy,6,c)}<text x="${cx}" y="${cy-80}" text-anchor="middle" font-size="18" fill="#244e48">${esc(title)}</text><text x="${cx}" y="${cy+46}" text-anchor="middle" font-size="24" font-weight="bold" fill="#244e48">${num(value)} ${esc(unit)}</text></g>`;}
function trace(x,y,w,h,values,title,window=null){const X=i=>x+16+i*(w-32)/Math.max(1,values.length-1),Y=v=>y+37+(1.5-v)*(h-53)/1.1;return `<g data-effect="observations">${plate(x,y,w,h)}${window===null?'':`<rect x="${X(Math.max(0,values.length-window))}" y="${y+32}" width="${Math.max(0,x+w-16-X(Math.max(0,values.length-window)))}" height="${h-42}" fill="#d9f1e5"/>`}<text x="${x+13}" y="${y+23}" font-size="17" fill="#244e48">${esc(title)}</text>${line(x+16,Y(1),x+w-16,Y(1),'#b8cfc3',2,'5 4')}${values.map((v,i)=>dot(X(i),Y(v),4,amber)).join('')}</g>`;}

function signalPlot(x,y,w,h,a,b,pos){const X=z=>x+16+(w-32)*z/100,Y=v=>y+h-18-v*(h-54)/1.5,signal=z=>a*[20,50,80].reduce((v,c)=>v+Math.exp(-(((z-c)/3)**2)),0)+b*.5*(1+Math.sin(z*1.2));return `<g data-effect="ccl-waveform">${plate(x,y,w,h)}<text x="${x+12}" y="${y+25}" font-size="17" fill="#244e48">合成CCL响应 / 探测位置</text>${path(Array.from({length:151},(_,i)=>[X(i/1.5),Y(signal(i/1.5))]),green,3)}${line(X(pos),y+34,X(pos),y+h-16,amber,3)}${line(x+16,Y(.5),x+w-16,Y(.5),'#b56836',2,'5 4')}</g>`;}
function signedMeter(x,y,w,v,min,max,title){const X=z=>x+16+(w-32)*(z-min)/(max-min),zero=X(0),end=X(v);return `<g data-effect="signed-meter">${plate(x,y,w,77)}<text x="${x+14}" y="${y+25}" font-size="17" fill="#244e48">${esc(title)} ${num(v)}</text>${line(x+16,y+52,x+w-16,y+52,'#dce9e4',14)}${line(zero,y+52,end,y+52,v<0?blue:amber,14)}${line(zero,y+38,zero,y+67,'#607c70',2)}</g>`;}
function pulsePlot(a,b,t){const x=560,y=45,w=355,h=145,X=v=>x+16+(w-32)*v/3,Y=v=>y+h-16-v*(h-50);return `<g data-effect="pulse-envelope">${plate(x,y,w,h)}<text x="${x+12}" y="${y+24}" font-size="17" fill="#244e48">压力包络 · 持续 ${num(a)} s</text>${path(Array.from({length:121},(_,i)=>{const q=i/40;return [X(q),Y(q<=a?Math.exp(-q/b):0)];}),green,3)}${line(X(a),y+34,X(a),y+h-15,'#b46d32',2,'4 4')}${line(X(t*3),y+34,X(t*3),y+h-15,amber,3)}</g>`;}
function overlay(id,a,b,t){let h='',q,s,x,y,w;switch(id){
case 'geometry-0':{
 const start=[345,310],end=[345+430*a/1.5,310+62*a/1.5],boundary=345+430*b/1.5;
 h=box(345,210,430*b/1.5,245,amber,.12)+line(boundary,210,boundary,455,amber,2,'8 7');
 h+=flow([end,start,[180,280],[180,160]],t,1.5)+dim(345,420,end[0],420,'L = '+num(a)+' m')+dot(...end,7)+label(boundary,192,'损害范围 '+num(b)+' m','#8e5c22','middle');break;}
case 'geometry-1':{

 q=[144,a*a*Math.sqrt(1-b),144];s=q.reduce((v,k)=>v+k,0);
 [[285,305],[514,351],[762,398]].forEach(([x,y],i)=>{const k=q[i]/s*3;h+=ring(x,y,12+(i===1?a:12),5+(i===1?a:12)*.7,i===1?amber:green);for(let j=-1;j<=1;j++)h+=flow([[x,y],[x+j*12,y-45],[x+j*42,y-130]],t,k*.7,i===1?amber:green);h+=label(x,y+65,'簇'+(i+1)+' · '+num(q[i]/s*100)+'%',i===1?'#966325':'#175c50','middle');});h+=flow([[170,285],[835,413]],t,1.5);break;}

case 'geometry-2':{

 const x0=135,w0=730,lo=(100-a)/2;
 h=plate(105,500,790,135)+label(500,530,'工况覆盖示意 · 非岩石空间范围','#175c50','middle')+line(x0,575,x0+w0,575,'#bdcbc5',14)+line(x0+lo*w0/100,575,x0+(lo+a)*w0/100,575,green,22);
 for(let i=0;i<=Math.floor(a/5);i++)h+=dot(x0+(lo+i*5)*w0/100,575,4,'#16836f');
 x=x0+b*w0/100;h+=line(x,547,x,602,amber,4)+dot(x,575,9,amber)+label(x,625,b>=lo&&b<=lo+a?'查询在覆盖带内':'查询需要外推','#996027','middle');break;}

case 'selection-0':{

 const cx=775,cy=220,scale=.65,ok=a>b;
 h=plate(650,75,245,340)+label(cx,110,'通径 / 工具截面放大','#175c50','middle')+`<circle data-effect="casing-clearance" cx="${cx}" cy="${cy}" r="${a*scale}" fill="#e1e7e2" stroke="#506c61" stroke-width="4"/><circle cx="${cx}" cy="${cy}" r="${b*scale}" fill="${ok?'#48bfa4':'#dc775c'}" fill-opacity=".6" stroke="${ok?'#168575':'#b1422b'}" stroke-width="4"/>`+dim(cx-a*scale,335,cx+a*scale,335,'通径 '+num(a)+' mm')+label(cx,386,'径向余隙 '+num((a-b)/2)+' mm',ok?'#175c50':'#a3442d','middle')+line(650,220,570,350,green,2);break;}

case 'selection-1':{

 w=a+b?a/(a+b):.5;const vals=[.85*w+.4*(1-w),.45*w+.9*(1-w)],best=vals[0]>=vals[1]?0:1;
 h=meter(55,65,400,vals[0],1,'深穿透候选评分',null,best===0?green:blue)+meter(545,65,400,vals[1],1,'大孔径候选评分',null,best===1?green:blue);
 h+=path([[145,330],[390,345]],green,4+vals[0]*12,.3+vals[0]*.6)+ring(690,330,65,32,blue,.3+vals[1]*.6,3+vals[1]*10)+label(500,600,'偏好改变评分，不改变两种器材的既有孔道','#175c50','middle');break;}

case 'selection-2':{

 const heat=(b-80)/170,hot=b>180,pressureColor=a>100?'#d65b3a':green,color=`rgb(${Math.round(60+185*heat)},${Math.round(160-75*heat)},${Math.round(220-170*heat)})`;
 h=`<defs><linearGradient id="tool-heat" x1="0" x2="1"><stop stop-color="${color}" stop-opacity=".1"/><stop offset=".5" stop-color="${color}" stop-opacity=".55"/><stop offset="1" stop-color="${color}" stop-opacity=".1"/></linearGradient></defs><rect data-effect="tool-temperature" x="454" y="65" width="160" height="505" rx="28" fill="url(#tool-heat)"/>`;
 h+=gauge(205,190,a,140,100,'工作压力','MPa')+label(205,321,a>100?'超过示例边界 100 MPa':'示例压力边界 100 MPa',a>100?'#a3442d':'#175c50','middle');
 h+=plate(725,90,220,350)+label(835,122,'工作温度','#175c50','middle')+`<rect x="752" y="160" width="26" height="210" rx="13" fill="#e2eae5"/><rect data-effect="temperature-column" x="752" y="${370-210*heat}" width="26" height="${Math.max(1,210*heat)}" rx="10" fill="${color}"/>`+dot(765,380,22,color)+line(747,370-210*100/170,790,370-210*100/170,'#b95135',3,'5 4')+label(800,220,num(b)+' °C',hot?'#a3442d':'#175c50')+label(835,420,hot?'超过示例边界 180°C':'示例温度边界 180°C',hot?'#a3442d':'#175c50','middle');
 for(let yy of [260,360,460])for(let side of [-1,1]){const x=535+side*120,len=15+a*.48,tip=535+side*76;h+=line(tip+side*len,yy,tip,yy,pressureColor,3+a/22)+path([[tip+side*14,yy-9],[tip,yy],[tip+side*14,yy+9]],pressureColor,3);}
 break;}

case 'evaluation-0':{

 h=flow([[770,490],[570,490],[280,460],[265,345],[265,140],[690,140]],t,a/50)+meter(570,35,350,a,200,'措施后观测指数',100)+meter(570,125,350,a-b,200,'扣除设定影响后的对照',100,amber)+label(475,590,'基准100 · 同期设定影响 '+num(b),'#926128','middle');break;}

case 'evaluation-1':{
 const total=a+b;h=flow([[70,145],[265,175],[505,215]],t,a/16)+flow([[900,450],[720,445],[505,445]],t,b/16,amber)+flow([[505,480],[505,130]],t,total/25)+label(270,125,'上层 '+num(a/total*100)+'%','#175c50','middle')+label(770,495,'下层 '+num(b/total*100)+'%','#986326','middle')+label(520,570,'井筒汇流 '+num(total),'#175c50','middle');break;}
case 'evaluation-2':{
 const on=a>0&&b>0,pc='#da913b',bc='#299ec3',ink='#193d49',sub='#5b747d';
 const angle=(-140+280*a/12)*Math.PI/180;
 h=`<defs><linearGradient id="eval-wash"><stop stop-color="#efaa50" stop-opacity="0"/><stop offset="1" stop-color="#efaa50" stop-opacity="${a/30}"/></linearGradient></defs>`;
 h+=`<g data-effect="pressure-instrument">${plate(22,22,190,186)}<text x="40" y="48" font-size="15" fill="${sub}">01 / 生产驱动</text><circle cx="117" cy="108" r="51" fill="#f5f8f7" stroke="#d5e2df" stroke-width="9"/>`;
 for(let i=0;i<=6;i++){const q=(-140+280*i/6)*Math.PI/180;h+=line(117+43*Math.sin(q),108-43*Math.cos(q),117+49*Math.sin(q),108-49*Math.cos(q),pc,2);}
 h+=line(117,108,117+38*Math.sin(angle),108-38*Math.cos(angle),pc,5)+dot(117,108,5,pc)+`<text x="117" y="178" text-anchor="middle" fill="${ink}" font-size="28" font-weight="600">${num(a)}<tspan font-size="13"> MPa</tspan></text><text x="117" y="198" text-anchor="middle" fill="${sub}" font-size="12">地层压力 − 井底流压</text></g>`;
 h+=path([[212,115],[227,115],[252,242]],pc,2,.8)+dot(252,242,4,pc);
 h+=`<path data-effect="pressure-condition" d="M20 485Q120 448 230 475L230 550Q110 580 20 550Z M303 475Q450 430 615 470L615 550Q440 595 303 550Z" fill="url(#eval-wash)" opacity="${a/12}"/>`;
 if(on){
  for(const pts of [[[43,493],[160,487],[235,495]],[[55,544],[165,535],[235,523]],[[500,472],[400,485],[286,495]],[[500,550],[400,537],[286,523]]])h+=flow(pts,.42,.7+a/8,pc);
  h+=`<path data-effect="producing-route" d="M260 520V222Q260 88 325 93Q360 90 380 134L770 167" fill="none" stroke="#125b62" stroke-opacity=".45" stroke-width="9"/><path class="eval-live-flow" d="M260 520V222Q260 88 325 93Q360 90 380 134L770 167" fill="none" stroke="#47ddc4" stroke-width="4" stroke-dasharray="5 16" stroke-linecap="round"/>`;
 }else h+=`<circle data-effect="closed-state" cx="260" cy="300" r="25" fill="#f4f7f7e8" stroke="#71858c" stroke-width="3"/>${line(245,315,275,285,'#71858c',4)}`;
 h+=`<g data-effect="operating-window">${plate(515,270,460,186)}<text x="535" y="299" font-size="15" fill="${sub}">02 / 生产制度</text><text x="950" y="302" text-anchor="end" fill="${ink}" font-size="27" font-weight="600">${num(b)}<tspan font-size="14"> % 开井时率</tspan></text>`;
 for(let i=0;i<24;i++){const f=Math.max(0,Math.min(1,24*b/100-i));h+=`<rect x="${536+i*17.4}" y="324" width="13.5" height="35" rx="3" fill="#e6ecee"/>`+(f>0?`<rect data-effect="onstream-slot" x="${536+i*17.4}" y="324" width="${13.5*f}" height="35" rx="3" fill="${bc}"/>`:'');}
 h+=`<text x="536" y="380" font-size="12" fill="${sub}">0 h</text><text x="948" y="380" text-anchor="end" font-size="12" fill="${sub}">24 h · 等效时段示意</text><text x="536" y="414" fill="${ink}" font-size="19">开井 ${num(b/100*24)} h<tspan fill="${sub}" font-size="15"> / 停井 ${num((1-b/100)*24)} h</tspan></text><text x="536" y="438" fill="${sub}" font-size="12">这里只表示时率，不指定真实启停的先后顺序。</text></g>`;
 h+=path([[750,270],[750,220],[655,169]],bc,2,.8)+dot(655,169,4,bc);
 h+=label(265,591,on?'开井时段内：地层 → 井筒 → 地面':b===0?'当前停井：不显示生产流向':'压差为零：不显示生产流向','#175c50','middle');
 h+=`<g data-effect="attribution-note">${plate(515,477,460,145)}<text x="536" y="506" font-size="15" fill="${sub}">03 / 比较措施之前</text><text x="536" y="541" font-size="22" fill="${ink}" font-weight="600">先对齐压差，再核对开井时间</text><text x="536" y="572" font-size="15" fill="${sub}">相同日历时长 ≠ 相同有效生产时间</text><text x="536" y="600" font-size="14" fill="${sub}">总产量变化仍不能单独确定射孔措施收益。</text></g>`;
 break;}


case 'lithology-0':{

 const ok=a<=90&&b>=15,yy=145+t*390;
 h=meter(590,65,330,a,160,'GR / API',90,a<=90?green:amber)+meter(590,160,330,b,35,'孔隙度 / %',15,b>=15?green:amber)+line(325,105,325,535,'#c5e7de',8)+line(250,yy,400,yy,green,6)+dot(325,yy,12,green)+label(325,yy-22,'测量扫查','#175c50','middle')+label(730,530,ok?'当前输入通过示例初筛':'当前输入需补充核对',ok?'#175c50':'#996127','middle');break;}

case 'lithology-1':{

 const Y=z=>130+(z-20)/160*390,lo=a-b/2,hi=a+b/2,scan=lo+t*b,ol=Math.max(lo,75),oh=Math.min(hi,120);
 h=box(285,Y(lo),585,Y(hi)-Y(lo),green,.08)+line(265,Y(a),895,Y(a),amber,2,'9 6');if(oh>ol)h+=box(285,Y(ol),585,Y(oh)-Y(ol),green,.24);
 h+=line(280,Y(scan),875,Y(scan),'white',9)+line(280,Y(scan),875,Y(scan),green,3)+dot(290,Y(scan),10,green)+label(675,Y(lo)-15,'窗口 '+num(lo)+'–'+num(hi)+' m','#175c50','middle')+label(665,590,'扫描深度 '+num(scan)+' m','#175c50','middle');break;}

case 'lithology-2':{

 h=meter(65,120,350,a,100,'储层证据 / %',60,a>=60?green:amber)+meter(580,120,350,b,100,'工程复核 / %',60,b>=60?green:amber)+line(240,200,260,300,a>=60?green:amber,4)+line(750,200,535,300,b>=60?green:amber,4);
 h+=label(250,390,a>=60?'储层证据通过':'储层证据待补',a>=60?'#175c50':'#996127','middle')+label(750,390,b>=60?'工程复核通过':'工程复核待补',b>=60?'#175c50':'#996127','middle')+label(510,590,a>=60&&b>=60?'两项均达到教学门槛':'仍有独立条件需要复核',a>=60&&b>=60?'#175c50':'#996127','middle');break;}

case 'damage-0':{
 h=ring(470,332,65+a*32,65+a*22,amber,.25+.65*(1-b),10)+flow([[870,260],[710,310],[460,330],[150,285]],t,6/(6+(1/b-1)*Math.log(a))*3)+flow([[860,470],[710,405],[460,345],[150,285]],t+.2,6/(6+(1/b-1)*Math.log(a))*3)+dim(330,490,330+a*65,490,'半径比 '+num(a),amber)+label(670,170,'kd/k = '+num(b),'#926128','middle');break;}
case 'damage-1':{

 const skin=(1/b-1)*Math.log(a),relative=6/(6+skin);
 for(let i=0;i<4;i++){const y=200+i*80;h+=flow([[70,y],[205,y+10],[250,y+12]],t,1.7)+flow([[945,y],[815,y+10],[775,y+12]],t,relative*1.7,amber);}
 h+=ring(770,295,30+a*13,12+a*7,amber,.65,7)+label(250,95,'无损害参照','#175c50','middle')+label(770,95,'当前损害条件','#926128','middle')+meter(610,500,320,relative,1,'相对流入指示 J/J₀',null,amber);break;}

case 'damage-2':{

 h=fans(530,385,230,850,24/(6+a+b),t)+meter(60,65,350,a,20,'局部损害表皮',null,amber)+signedMeter(585,65,350,b,-5,10,'其他表皮分量')+label(535,565,'合计表皮 '+num(a+b),'#175c50','middle');break;}

case 'productivity-0':{
 const dp=a-b;h=fans(500,390,160,845,Math.max(0,dp)/6,t)+flow([[500,480],[500,160]],t,Math.max(0,dp)/6)+label(190,180,'地层 '+num(a)+' MPa','#175c50','middle')+label(720,155,'井底 '+num(b)+' MPa','#175c50','middle')+label(500,580,dp>0?'压差 '+num(dp)+' MPa':'当前设定无生产压差',dp>0?'#175c50':'#996127','middle');break;}
case 'productivity-1':{

 q=b/(b+a);h=fans(510,375,110,915,q*4,t)+flow([[510,490],[510,140]],t,q*4)+meter(620,65,320,q,1,'J/J₀',null,green)+label(240,120,'表皮 '+num(a)+' · 基准阻力 '+num(b),'#926128','middle');break;}

case 'productivity-2':{

 const vals=Array.from({length:40},(_,i)=>Math.exp(-i/90)*(1+b/100*Math.sin(i*1.7)));
 h=trace(170,445,680,180,vals,'教学合成记录 · 当前窗口 '+num(a)+' 天',a)+line(825,175,825,420,green,3)+label(750,120,'记录窗口与观测扰动','#175c50','middle');break;}

case 'cleanup-0':{
 q=a/b;h=flow([[85,305],[275,315],[600,335],[755,335],[755,120]],t,q,green);for(let i=0;i<(q>0?8:0);i++){x=90+((t*(.5+q*.2)+i/8)%1)*510;y=305+(x-90)/510*30+8*Math.sin(i*3);h+=dot(x,y,3,amber);}h+=label(250,210,'欠平衡 '+num(a)+' MPa','#175c50','middle')+label(815,180,'回流阻力 '+num(b),'#996127','middle');break;}
case 'cleanup-1':{

 const current=t*3,pressure=current<=a?Math.exp(-current/b):0;
 [[140,430],[640,430]].forEach(([x,y],i)=>{if(pressure>0){const xx=x+Math.min(230,current/3*230);h+=line(x,y,xx,y,i?amber:green,6+pressure*20)+ring(xx,y,10,22,i?amber:green,pressure,5)+flow([[xx,y],[x,y],[x-20,y-200]],t,pressure*3,i?amber:green);}});
 h+=pulsePlot(a,b,t)+meter(90,65,340,pressure,1,'当前归一化压力',null,green)+label(760,105,'显示时刻 '+num(current)+' s','#996127','middle')+label(500,570,'持续 '+num(a)+' s · 衰减常数 '+num(b)+' s','#175c50','middle');break;}

case 'cleanup-2':{

 const vals=Array.from({length:a},(_,i)=>1+b/100*Math.sin(i*2.31));h=trace(120,455,690,170,vals,'重复观测 '+num(a)+' 组 · 扰动 '+num(b)+'%')+line(815,490,850,310,green,3)+ring(850,300,56,16,green);break;}

case 'network-0':{
 q=(a/12)**2*Math.sqrt(b/3);h=ring(470,345,8+a*.7,12+a,amber,.9)+flow([[90,330],[320,335],[470,345],[710,335],[900,300]],t,q)+label(500,170,'入口孔径 '+num(a)+' mm','#996127','middle')+label(780,535,'入口压差 '+num(b),'#175c50','middle');break;}
case 'network-1':{
 const vals=[1,a*a*Math.sqrt(1-b),1,.9,.8,.7],total=vals.reduce((x,y)=>x+y,0);h=flow([[80,205],[920,280]],t,1.5);
 for(let i=0;i<6;i++){x=185+i*126;y=218+i*11;h+=ring(x,y,15,i===1?9+a*3:12,i===1?amber:green)+flow([[x,y],[x,y+90],[x-10,y+175]],t,vals[i]/total*12,i===1?amber:green)+label(x,y+228,num(vals[i]/total*100)+'%',i===1?'#996127':'#175c50','middle');}break;}
case 'network-2':{

 for(let i=0;i<a;i++){const u=(i+.5)/a*470;x=u<=110?230+u:u<=295?435+u-110:705+u-295;y=281+(x-250)*.175;for(let j=0;j<b;j++){const xx=x+(j-(b-1)/2)*6,yy=y+(j%2?8:-8);h+=`<ellipse data-effect="configured-hole" cx="${xx}" cy="${yy}" rx="4.3" ry="6.3" transform="rotate(9.4 ${xx} ${yy})" fill="#143c34" stroke="${green}" stroke-width="3"/>`;}h+=label(x,y+80,'簇'+(i+1),'#175c50','middle');}
 h+=label(510,115,num(a)+' 簇 × '+num(b)+' 孔 · 亮色孔眼为当前输入','#175c50','middle');break;}

case 'depth-0':{

 const pos=t*100,yy=150+t*390,signal=a*[20,50,80].reduce((sum,c)=>sum+Math.exp(-(((pos-c)/3)**2)),0)+b*.5*(1+Math.sin(pos*1.2));
 h=line(490,150,490,540,'#a1cabc',3,'8 7')+line(465,yy,595,yy,green,7)+dot(525,yy,12,green)+meter(660,105,285,signal,1.5,'当前合成响应',.5,signal>=.5?green:amber);
 h+=signalPlot(650,215,300,185,a,b,pos)+label(525,605,'探测位置 '+num(pos),'#175c50','middle');break;}

case 'depth-1':{

 const target=410,observed=target+a*15,corrected=target+(a-b)*15;h=line(140,target,900,target,green,3,'10 6')+line(480,observed,600,observed,amber,5)+line(480,corrected,600,corrected,blue,6)+ring(540,observed,65,13,amber)+ring(540,corrected,65,13,blue)+dim(685,target,685,corrected,'残差 '+num(a-b)+' m',blue)+label(210,155,'观测偏移 '+num(a)+' m','#996127','middle')+label(785,155,'校正 '+num(b)+' m','#326c8a','middle');break;}

case 'depth-2':{

 const original=420,datum=original+a*25,corrected=original+(a+b)*25;
 h=line(470,original,680,original,'#e5e8e3',4,'7 6')+line(470,datum,620,datum,amber,5)+line(470,corrected,620,corrected,blue,6)+dim(665,original,665,corrected,'合计修正 '+num(a+b)+' m',blue)+label(280,200,'基准修正 '+num(a)+' m','#996127','middle')+label(795,200,'伸长修正 '+num(b)+' m','#326c8a','middle')+label(735,605,'校正读数 '+num(1000+a+b)+' m','#175c50','middle');break;}

default:throw new Error('Missing image overlay: '+id);
}return `<g data-overlay-id="${esc(id)}" data-values="${a},${b}" data-progress="${t.toFixed(3)}">${h}</g>`;}
window.EngineeringOverlay={version:'evaluation-attribution-v3-20261101',render:overlay,mechanism};
})();
