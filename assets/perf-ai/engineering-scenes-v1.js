/* Scene-specific educational relations; never modifies case models or field data. */
(()=>{'use strict';
const assetRoot=new URL('../perforation-scenes/',document.currentScript.src);
const C={
geometry:[
{c:[['孔道穿深 L',.2,1.5,.05,.8,'m'],['近井损害范围',.1,1,.05,.45,'m']],note:'对照孔道末端和损害边界；穿过损害区是几何条件，不等于产量保证。'},
{c:[['第2簇入口孔径',6,20,1,12,'mm'],['第2簇相对外压',0,.8,.05,.25,'']],note:'固定共同入口压力和其余入口，用简化孔口关系比较相对分流；未计算裂缝扩展。'},
{c:[['已有样本覆盖',20,100,5,60,'%'],['查询工况位置',0,100,5,45,'%']],note:'覆盖带与查询点用于识别插值/外推；覆盖比例不换算成模型精度。'}],
selection:[
{c:[['套管最小通径',80,150,5,120,'mm'],['工具最大外径',50,140,5,90,'mm']],note:'径向余隙仅反映几何通过条件；输送、温压与全长条件仍需复核。'},
{c:[['穿深偏好',0,100,5,65,'%'],['孔径偏好',0,100,5,35,'%']],note:'两个示例候选使用固定的归一化性能，说明偏好取舍，不对应真实商品推荐。'},
{c:[['工作压力',30,140,5,70,'MPa'],['工作温度',80,250,5,140,'°C']],note:'以示例边界100 MPa、180°C展示条件核对；不是器材额定值。工具色带表示温度条件，不是求解温度场或热变形。'}],
evaluation:[
{c:[['措施后观测量',50,160,5,120,'指数'],['同期制度影响',-30,30,5,10,'指数']],note:'基准观测量设为100；扣除人为设定的同期影响只作对照，不是因果效应估计。'},
{c:[['上层观测流量',10,80,5,50,'相对单位'],['下层观测流量',10,80,5,30,'相对单位']],note:'汇总和占比由两层观测量相加计算；总量相同仍可能有不同的分层贡献。'},
{c:[['生产压差',0,12,.5,6,'MPa'],['开井时率',0,100,5,70,'%']],note:'流线和颜色仅示意开井时的驱动方向与压差条件，不计算流量或措施增益；24小时时段仅将时率换算为等效开井时间。'}],
lithology:[
{c:[['GR响应',40,160,5,75,'API'],['孔隙度',5,35,1,20,'%']],note:'背景区使用GR≤90、孔隙度≥15%的教学界线；实际岩性识别应使用对应井的模型与标签。'},
{c:[['候选窗口中心',40,160,5,95,'m'],['候选窗口厚度',5,50,5,25,'m']],note:'示例砂岩层位为75–120 m；重叠厚度由窗口与该区间求交得到，不等于最终有效射孔厚度。'},
{c:[['储层证据充分度',0,100,5,80,'%'],['工程条件符合度',0,100,5,70,'%']],note:'60%界线仅用于演示双重门槛；岩性初筛与工程复核分别判断，不能互相替代。'}],
damage:[
{c:[['损害半径比 rd/rw',1.1,5,.1,2.5,''],['相对渗透率 kd/k',.05,1,.05,.4,'']],note:'单相同心损害带示例：s=(k/kd−1)ln(rd/rw)；固定D=6，用J/J₀=6/(6+s)表示相对流入指示。未包含裂缝、非达西等其他分量。'},
{c:[['当前半径比 rd/rw',1.1,5,.1,2.5,''],['相对渗透率 kd/k',.05,1,.05,.4,'']],note:'固定基准阻力D=6，右侧按J/J₀=6/(6+s)对照损害条件，左侧为无损害参照；流线是简化单相相对流入示意。'},
{c:[['局部损害表皮',0,20,1,8,''],['其他表皮分量',-5,10,1,2,'']],note:'表皮分量按定义相加；固定D=6，流入指示按6/(6+s合计)对照，不用全井表皮反推出唯一局部损害参数。'}],
productivity:[
{c:[['地层压力',10,40,1,25,'MPa'],['井底流压',0,40,1,10,'MPa']],note:'固定产能系数J=1个相对单位，展示q=J(pr−pw)；负压差表示不满足当前生产流向。'},
{c:[['附加表皮 s',0,20,1,8,''],['基准几何阻力 D',3,10,.5,6,'']],note:'固定其余条件时相对产能系数为D/(D+s)；这是简化径向单相关系。'},
{c:[['回看窗口长度',5,30,1,15,'天'],['示例观测扰动',0,30,2,10,'%']],note:'时序是明确标注的教学合成记录，用来说明资料核对；不作为本站模型的测试成绩。'}],
cleanup:[
{c:[['欠平衡压差',0,10,.5,4,'MPa'],['相对回流阻力',1,5,.25,2,'']],note:'以压差/相对阻力表示回流驱动力；图中不输出未经试验标定的残留率。'},
{c:[['脉冲持续时间',.2,3,.1,1.5,'s'],['压力衰减时间常数',.2,2,.1,.8,'s']],note:'示例p(t)=exp(−t/τ)，持续时间后截断；面积表示归一化压力冲量，不等于清洁率。'},
{c:[['重复观测组数',5,50,5,20,'组'],['相对测量扰动',0,30,2,10,'%']],note:'显示教学观测点的覆盖与离散，不将样本数或拟合程度直接解释成现场清洁效果。'}],
network:[
{c:[['入口孔径',6,20,1,12,'mm'],['入口压差',.5,10,.5,3,'相对单位']],note:'固定流量系数时相对流量∝d²√Δp，基准为12 mm、压差3；不换标现场流量单位。'},
{c:[['第2孔孔径倍率',.6,1.8,.1,1.2,'倍'],['第2孔相对背压',0,.8,.05,.2,'']],note:'六支路使用共同归一化入口压力；按孔口关系求相对份额，未包含沿程压降与多相效应。'},
{c:[['射孔簇数',2,6,1,3,'簇'],['每簇孔眼数',2,10,1,5,'孔']],note:'仅组织多簇几何输入，孔数和簇数不直接代表总流量或裂缝均匀度。'}],
depth:[
{c:[['接箍事件强度',.2,1,.05,.7,'相对单位'],['背景噪声幅度',0,.5,.05,.15,'']],note:'波形是合成接箍事件与背景扰动，固定示例阈值0.5；不报告现场定位精度。'},
{c:[['观测深度偏移',-5,5,.5,2,'m'],['施加校正量',-5,5,.5,1,'m']],note:'残差=观测偏移−校正量；先统一基准，再比较目标层位，不把GR配准等同CCL验证。'},
{c:[['地面基准修正',-2,2,.2,.6,'m'],['缆线伸长修正',0,4,.2,1.2,'m']],note:'以1000 m作为示例读数，分开记录两类修正；实际符号和数值须按现场标定。'}]};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const col=['#168575','#c17a38','#537f9d','#9b5972','#789b56','#655f9c'];
const f=n=>Number(n).toLocaleString('zh-CN',{maximumFractionDigits:2});
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const T=(x,y,t,size=15,color='#244d4a',anchor='start')=>'<text x="'+x+'" y="'+y+'" font-size="'+size+'" fill="'+color+'" text-anchor="'+anchor+'">'+esc(t)+'</text>';
const R=(x,y,w,h,fill='#e6f1ec',stroke='none',rx=6)=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+rx+'" fill="'+fill+'" stroke="'+stroke+'"/>';
const L=(x,y,xx,yy,color=col[0],width=2,dash='')=>'<path d="M'+x+' '+y+'L'+xx+' '+yy+'" fill="none" stroke="'+color+'" stroke-width="'+width+'"'+(dash?' stroke-dasharray="'+dash+'"':'')+'/>';
const circle=(x,y,r,fill=col[0])=>'<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+fill+'"/>';
const poly=(pts,color=col[0],width=3)=>'<polyline points="'+pts.map(p=>p.join(',')).join(' ')+'" fill="none" stroke="'+color+'" stroke-width="'+width+'"/>';
function SVG(body,label){return '<svg viewBox="0 0 500 320" role="img" aria-label="'+esc(label)+'" xmlns="http://www.w3.org/2000/svg"><rect x="1" y="1" width="498" height="318" rx="14" fill="#fbfdfb" stroke="#deebe4"/>'+body+'</svg>';}
function P(series,xlabel,ylabel,include=[]){const pts=series.flatMap(s=>s.p).concat(include);let xmin=Math.min(...pts.map(p=>p[0])),xmax=Math.max(...pts.map(p=>p[0])),ymin=Math.min(0,...pts.map(p=>p[1])),ymax=Math.max(...pts.map(p=>p[1]));if(xmax===xmin)xmax=xmin+1;if(ymax===ymin)ymax=ymin+1;const X=x=>55+(x-xmin)/(xmax-xmin)*405,Y=y=>260-(y-ymin)/(ymax-ymin)*190;let h='';for(let i=0;i<5;i++){const x=xmin+i*(xmax-xmin)/4,y=ymin+i*(ymax-ymin)/4;h+=L(X(x),70,X(x),260,'#e4ece6',1)+L(55,Y(y),460,Y(y),'#e4ece6',1)+T(X(x),280,f(x),12,'#658075','middle')+T(47,Y(y)+4,f(y),12,'#658075','end');}series.forEach((s,i)=>{h+=poly(s.p.map(p=>[X(p[0]),Y(p[1])]),s.color||col[i])+L(55+i*170,25,75+i*170,25,s.color||col[i],3)+T(82+i*170,30,s.name,13);});h+=T(257,307,xlabel,14,'#42645d','middle')+T(20,54,ylabel,14);return {h,X,Y};}
function bars(names,values,label,colors=col){const ymin=Math.min(0,...values),ymax=label.includes('双重门槛')?Math.max(100,...values):Math.max(1,...values),Y=v=>260-(v-ymin)/(ymax-ymin)*170,zero=Y(0);let h=T(25,30,label,17)+L(45,zero,465,zero,'#b5cec0');names.forEach((name,i)=>{const x=55+i*400/names.length,w=260/names.length,v=values[i],y=Y(v);h+=R(x,Math.min(y,zero),w,Math.abs(y-zero),colors[i%colors.length],'none',5)+T(x+w/2,v>=0?y-10:Math.min(268,y+16),f(v),14,'#2a544b','middle')+T(x+w/2,299,name,13,'#42645d','middle');});return h;}
function curve(lo,hi,fn,n=40){return Array.from({length:n+1},(_,i)=>{const x=lo+(hi-lo)*i/n;return [x,fn(x)];});}
function point(a,x,y,label){return L(a.X(x),260,a.X(x),a.Y(y),col[1],1,'4 4')+circle(a.X(x),a.Y(y),6,col[1])+T(475,52,label,13,col[1],'end');}
function skin(a,b){return (1/b-1)*Math.log(a);}
function compute(id,a,b){
let h='',p,pts,v,w,total;
switch(id){
case 'geometry-0':{
 const X=x=>75+x*245;h=T(25,30,'孔道末端与损害边界',18)+R(65,65,370,170,'#eedfc5')+R(65,65,a>0?b*245:0,170,'#d4c1a1')+R(65,65,20,170,'#78928c')+R(75,139,a*245,24,'#3d605c')+L(X(b),55,X(b),245,col[1],2,'5 4')+T(75,280,'井壁',14)+T(X(b),260,'损害边界',13,col[1],'middle')+L(75,207,X(a),207,col[0],3)+T(270,307,'L='+f(a)+' m · 损害范围='+f(b)+' m',14,'#42645d','middle');
 return {h,title:'孔道跨越损害区的几何比较',stats:[['末端相对损害边界',f(a-b)+' m'],['几何观察',a>b?'已跨过示例边界':'仍在示例损害范围内']]};}
case 'geometry-1':{
 const q=[144, a*a*Math.sqrt(1-b),144],sum=q.reduce((x,y)=>x+y,0),share=q.map(x=>x/sum*100);h=bars(['簇1','簇2','簇3'],share,'共同入口条件下的流量份额 / %');
 return {h,title:'三簇入口条件与相对分流',stats:[['第2簇份额',f(share[1])+'%'],['第2簇入口面积比',f(a*a/144)]]};}
case 'geometry-2':{
 const lo=(100-a)/2,hi=(100+a)/2,X=x=>55+x*4.05;h=T(25,30,'查询条件与已有样本覆盖',18)+R(55,105,405,95,'#eef2ef')+R(X(lo),105,(hi-lo)*4.05,95,'#cfe9da')+L(55,220,460,220,'#9cb9a9')+L(X(b),85,X(b),225,col[1],3)+circle(X(b),150,9,col[1])+T(250,270,'左侧灰区与右侧灰区为未覆盖范围',14,'#5d766a','middle')+T(250,302,'查询点位置 '+f(b)+'%',16,col[1],'middle');
 return {h,title:'样本覆盖和插值/外推边界',stats:[['已有覆盖宽度',f(a)+'%'],['查询状态',b>=lo&&b<=hi?'在示例覆盖带内':'在示例覆盖带外']]};}
case 'selection-0':{
 const x=250,y=154;h=T(25,30,'最小通径与最大外径',18)+circle(x,y,a*.82,'#cddbd6')+circle(x,y,a*.69,'#fbfdfb')+circle(x,y,b*.69,b<a?'#70bbaa':'#d69779')+L(x,y,x+a*.69,y,col[0],2)+T(250,285,'外圆：通径 · 内圆：工具外径',15,'#42645d','middle');
 return {h,title:'工具通过的径向余隙',stats:[['径向余隙',f((a-b)/2)+' mm'],['几何判断',a>b?'存在正余隙':a===b?'零余隙，仍需核对':'外径超过通径']]};}
case 'selection-1':{
 const weight=a+b?a/(a+b):.5,A=.85*weight+.4*(1-weight),B=.45*weight+.9*(1-weight);h=bars(['示例深穿透候选','示例大孔径候选'],[A,B],'归一化偏好分数',col);
 return {h,title:'两个示例候选的偏好权衡',stats:[['归一化穿深权重',f(weight*100)+'%'],['当前偏好',Math.abs(A-B)<.001?'两者相当':A>B?'示例深穿透候选':'示例大孔径候选']]};}
case 'selection-2':{
 const vals=[a/100,b/180];h=T(25,30,'工作条件 / 示例边界',18);vals.forEach((v,i)=>{const y=100+i*88;h+=R(55,y,385,26,'#edf2ed')+R(55,y,clamp(v/1.5,0,1)*385,26,v<=1?col[0]:col[1])+L(55+385/1.5,y-12,55+385/1.5,y+38,'#926440',2,'4 4')+T(55,y-15,i===0?'压力：'+f(a)+' / 100 MPa':'温度：'+f(b)+' / 180°C',15);});h+=T(250,298,'虚线为示例边界，非实际器材额定值',14,'#5c7468','middle');
 return {h,title:'施工温压条件分别核对',stats:[['示例压力边界',a<=100?'未超过':'已超过'],['示例温度边界',b<=180?'未超过':'已超过']]};}
case 'evaluation-0':{
 const observed=a-100,adjusted=observed-b;h=bars(['基准观测','措施后观测','扣除设定影响'],[100,a,a-b],'教学观测指数（基准=100）');
 return {h,title:'观测变化与设定对照',stats:[['观测差值',f(observed)+' 指数'],['扣除设定影响后的差值',f(adjusted)+' 指数']]};}
case 'evaluation-1':{
 const sum=a+b;h=R(80,75,60,190,'#7c9a92')+R(145,75,290,67,'#e6d6b9')+R(145,175,290,67,'#d9c299')+L(410,110,140,110,col[0],a/10)+L(410,210,140,210,col[1],b/10)+T(300,95,'上层 '+f(a),16)+T(300,195,'下层 '+f(b),16)+T(80,295,'两层汇入同一井筒：'+f(sum),17);
 return {h,title:'分层贡献与井筒汇流',stats:[['上层占比',f(a/sum*100)+'%'],['下层占比',f(b/sum*100)+'%']]};}
case 'evaluation-2':{return {h:'',title:'压力条件与有效生产时间',stats:[['当前生产压差',f(a)+' MPa'],['等效开井时间',f(b/100*24)+' h / 24 h']]};}
case 'lithology-0':{
 p=P([{name:'示例孔隙度界线',p:[[40,15],[160,15]]}],'GR / API','孔隙度 / %',[[40,5],[160,35],[a,b]]);h=p.h+R(p.X(40),p.Y(35),p.X(90)-p.X(40),p.Y(15)-p.Y(35),'#d7eddf','none',0)+L(p.X(90),p.Y(5),p.X(90),p.Y(35),col[0],1,'5 4')+circle(p.X(a),p.Y(b),7,col[1]);
 return {h,title:'测井响应的候选初筛示例',stats:[['示例候选区',a<=90&&b>=15?'当前点落在候选区':'当前点不在候选区'],['当前输入','GR '+f(a)+' / φ '+f(b)+'%']]};}
case 'lithology-1':{
 const lo=a-b/2,hi=a+b/2,overlap=Math.max(0,Math.min(hi,120)-Math.max(lo,75)),Y=z=>45+(z-20)/160*235;h=R(100,45,275,235,'#d5d9d2')+R(100,Y(75),275,Y(120)-Y(75),'#e4c898')+R(82,Y(lo),310,Y(hi)-Y(lo),'#47a78c30',col[0],0)+L(70,Y(a),405,Y(a),col[1],2,'5 4')+T(400,Y(75)+5,'75 m',13)+T(400,Y(120)+5,'120 m',13)+T(240,307,'候选窗口 '+f(lo)+'–'+f(hi)+' m',15,'#42645d','middle');
 return {h,title:'候选窗口与岩性层界的重叠',stats:[['窗口内示例砂岩厚度',f(overlap)+' m'],['窗口覆盖比例',f(overlap/b*100)+'%']]};}
case 'lithology-2':{
 h=bars(['储层证据','工程条件'],[a,b],'示例双重门槛 / %');const y=260-.6*170;h+=L(45,y,465,y,col[1],2,'6 4')+T(460,45,'教学门槛 60%',13,col[1],'end');
 return {h,title:'岩性初筛与工程复核分别判断',stats:[['储层证据',a>=60?'示例门槛通过':'需补充证据'],['工程条件',b>=60?'示例门槛通过':'需补充复核']]};}
case 'damage-0':{
 const rd=20*a;h=T(25,30,'同心损害带的横截面',18)+circle(250,163,127,'#e4cfac')+circle(250,163,rd,'rgba(140,105,65,'+(.25+.65*(1-b))+')')+circle(250,163,20,'#547b70')+L(250,163,250+rd,163,'white',3)+T(250,307,'内圈 rw · 中圈 rd · 外圈未损伤地层',13,'#42645d','middle')+T(250,168,'rw',12,'white','middle');
 return {h,title:'损害带半径与渗透率比',stats:[['解析示例表皮 s',f(skin(a,b))],['局部渗透率比',f(b)]]};}
case 'damage-1':{
 p=P([{name:'固定渗透率比',p:curve(1,5,x=>skin(x,b))}],'损害半径比 rd/rw','表皮 s',[[a,skin(a,b)]]);h=p.h+point(p,a,skin(a,b),'当前半径比 '+f(a));
 return {h,title:'损害参数敏感性曲线',stats:[['当前表皮 s',f(skin(a,b))],['同半径比下的关系','渗透率比越小，阻力越大']]};}
case 'damage-2':{
 const vals=[a,b,a+b];h=bars(['局部损害','其他分量','合计'],vals,'分量加和示例（可含负分量）');h+=T(250,58,'负值的符号以标注数字为准',12,'#6f7b73','middle');
 return {h,title:'全井解释中的表皮分量',stats:[['合计表皮',f(a+b)],['局部损害分量',f(a)]]};}
case 'productivity-0':{
 p=P([{name:'固定 J 的压差关系',p:curve(0,40,x=>Math.max(a-x,0))}],'井底流压 / MPa','相对产量',[[b,Math.max(a-b,0)]]);h=p.h+point(p,b,Math.max(a-b,0),'当前压差 '+f(a-b)+' MPa');
 return {h,title:'稳定单相压差与流入关系',stats:[['当前压差',f(a-b)+' MPa'],['相对产量（J=1）',f(Math.max(a-b,0))]]};}
case 'productivity-1':{
 const ratio=b/(b+a);p=P([{name:'固定基准阻力 D',p:curve(0,20,x=>b/(b+x))}],'附加表皮 s','J / J0',[[a,ratio]]);h=p.h+point(p,a,ratio,'当前 J/J0 '+f(ratio));
 return {h,title:'附加表皮与相对产能系数',stats:[['J / J0',f(ratio)],['相对基准降低',f((1-ratio)*100)+'%']]};}
case 'productivity-2':{
 const ref=curve(0,39,x=>100*Math.exp(-x/90),39),obs=ref.map(([x,y])=>[x,y*(1+b/100*Math.sin(x*1.7))]),start=40-a;p=P([{name:'合成参考',p:ref},{name:'合成观测',p:obs}],'教学记录 / 天','相对观测量');h=p.h+L(p.X(start),70,p.X(start),260,col[1],2,'5 4');
 return {h,title:'生产资料的同窗核对',stats:[['本次核对窗口',f(a)+' 天'],['设定观测扰动',f(b)+'%']]};}
case 'cleanup-0':{
 const drive=a/b;h=T(25,30,'欠平衡条件下的回流方向',18)+R(45,65,85,195,'#b7e0d8')+R(145,65,300,195,'#e8d2ac')+R(110,143,300,35,'#665f4d')+L(390,160,75,160,col[0],2+drive)+T(50,290,'孔道 → 井筒',17);for(let i=0;i<7;i++)h+=circle(140+i*37,154+8*Math.sin(i),3.5,'#d4ba82');
 return {h,title:'压差和回流阻力的对照',stats:[['相对回流驱动指数',f(drive)],['回流方向',a>0?'孔道指向井筒':'零设定压差']]};}
case 'cleanup-1':{
 const p0=t=>t<=a?Math.exp(-t/b):0,area=b*(1-Math.exp(-a/b));p=P([{name:'归一化压力脉冲',p:curve(0,3,p0,120)}],'时间 / s','p / p0');h=p.h+L(p.X(a),70,p.X(a),260,col[1],1,'5 4');
 return {h,title:'脉冲持续时间与压力冲量',stats:[['归一化压力冲量',f(area)+' s'],['截断时刻压力比',f(Math.exp(-a/b))]]};}
case 'cleanup-2':{
 const pts=Array.from({length:a},(_,i)=>[i+1,1+b/100*Math.sin(i*2.31)]);p=P([{name:'示例参考水平',p:[[1,1],[a,1]]}],'重复观测组号','归一化读数',pts);h=p.h+pts.map(v=>circle(p.X(v[0]),p.Y(v[1]),3.5,col[1])).join('');
 return {h,title:'清理观测的覆盖与离散',stats:[['重复观测',f(a)+' 组'],['相对测量扰动',f(b)+'%']]};}
case 'network-0':{
 const q=(a/12)**2*Math.sqrt(b/3);p=P([{name:'固定当前孔径',p:curve(.5,10,x=>(a/12)**2*Math.sqrt(x/3))}],'相对入口压差','相对流量');h=p.h+point(p,b,q,'当前孔径 '+f(a)+' mm');
 return {h,title:'单孔入口面积与压差关系',stats:[['相对基准流量',f(q)],['相对基准入口面积',f((a/12)**2)]]};}
case 'network-1':{
 const q=[1,a*a*Math.sqrt(1-b),1,.9,.8,.7],sum=q.reduce((x,y)=>x+y,0),shares=q.map(x=>x/sum*100);h=bars(['孔1','孔2','孔3','孔4','孔5','孔6'],shares,'共同入口条件下的流量份额 / %');
 return {h,title:'六个支路的相对分配',stats:[['第2孔份额',f(shares[1])+'%'],['六孔份额之和',f(shares.reduce((x,y)=>x+y,0))+'%']]};}
case 'network-2':{
 const w=400/a;h=T(25,30,'簇数、每簇孔数与几何组织',18)+R(40,125,420,42,'#829f94');for(let i=0;i<a;i++){h+=R(45+i*w,80,w-12,140,i%2?'#e8d7bd':'#d8e9dc');for(let j=0;j<b;j++)h+=circle(55+i*w+(j%5)*(w-30)/5,112+Math.floor(j/5)*35,4,col[0]);h+=T(45+i*w+(w-12)/2,250,'簇'+(i+1),13,'#42645d','middle');}h+=T(250,295,'几何孔数不直接等于产量或改造效果',13,'#60796c','middle');
 return {h,title:'多簇模型的几何输入',stats:[['输入总孔数',f(a*b)+' 孔'],['几何组织',f(a)+' 簇 × '+f(b)+' 孔/簇']]};}
case 'depth-0':{
 const signal=x=>a*[20,50,80].reduce((s,c)=>s+Math.exp(-(((x-c)/3)**2)),0)+b*.5*(1+Math.sin(x*1.2));p=P([{name:'合成接箍响应',p:curve(0,100,signal,150)},{name:'示例检测阈值',p:[[0,.5],[100,.5]]}],'示例测深位置','相对响应');h=p.h;
 return {h,title:'接箍事件与背景扰动',stats:[['设定事件位置','20 / 50 / 80'],['阈值用途','示例判据，需独立事件核对']]};}
case 'depth-1':{
 const scale=95/Math.max(1,Math.abs(a),Math.abs(a-b)),Y=z=>160+z*scale;h=T(25,30,'目标层位、观测位置与校正后位置',17)+L(65,160,455,160,col[0],3)+T(70,145,'基准目标层位',14,col[0])+L(90,Y(a),430,Y(a),col[1],2,'6 4')+circle(190,Y(a),7,col[1])+T(95,Y(a)+22,'观测偏移 '+f(a)+' m',13,col[1])+L(90,Y(a-b),430,Y(a-b),col[2],3)+circle(350,Y(a-b),7,col[2])+T(250,298,'校正量 '+f(b)+' m',15,'#42645d','middle');
 return {h,title:'施加校正量后的目标层位残差',stats:[['校正后残差',f(a-b)+' m'],['示例校正目标',Math.abs(a-b)<.01?'与基准重合':'仍需核对独立锚点']]};}
case 'depth-2':{
 h=bars(['地面基准修正','缆线伸长修正','修正量合计'],[a,b,a+b],'测深修正分量 / m');h+=T(250,57,'负分量的符号以标注数字为准',12,'#6f7b73','middle');
 return {h,title:'测深基准与伸长修正分别记录',stats:[['修正量合计',f(a+b)+' m'],['示例修正后读数',f(1000+a+b)+' m']]};}
default:throw new Error('Unknown scene: '+id);
}}
function render(host,key,n,values,t=0,playing=true){
 const cfg=C[key][n],id=key+'-'+n,result=compute(id,...values);
 host.querySelector('.es-overlay').innerHTML=window.EngineeringOverlay.render(id,...values,t);
 host.querySelector('.es-values').innerHTML=result.stats.map(s=>'<div><span>'+esc(s[0])+'</span><strong>'+esc(s[1])+'</strong></div>').join('');
 host.dataset.sceneState=JSON.stringify({id,values,progress:+t.toFixed(3),playing});
 host.querySelectorAll('[data-es-input]').forEach((e,i)=>{e.value=values[i];e.previousElementSibling.querySelector('output').textContent=f(values[i])+' '+cfg.c[i][5];});
 const slider=host.querySelector('[data-es-time]');if(slider){if(document.activeElement!==slider)slider.value=Math.round(t*100);host.querySelector('[data-es-progress]').textContent=Math.round(t*100)+'%';host.querySelector('[data-es-play]').textContent=playing?'暂停演示':'播放演示';}
}
function mount(host,c,n){
 const cfg=C[c.key]?.[n];if(!cfg)throw new Error('Unknown scene');
 const values=cfg.c.map(v=>v[4]),id=c.key+'-'+n,motion=window.EngineeringOverlay.mechanism(id);let t=motion.mode==='process'?0:.5,playing=motion.mode==='process',frame=0,last=0,disposed=false;
 host.classList.add('es-root');host.dataset.sceneId=id;host.dataset.sceneMode=motion.mode;
 host.innerHTML='<header class="es-head"><h3>'+esc(c.scenes[n][0])+'</h3><span>'+esc(motion.mode==='process'?'过程演示':'参数对照')+'</span></header><div class="es-controls">'+cfg.c.map((v,i)=>'<label><span>'+esc(v[0])+'<output></output></span><input data-es-input="'+i+'" aria-label="'+esc(v[0])+'" type="range" min="'+v[1]+'" max="'+v[2]+'" step="'+v[3]+'" value="'+v[4]+'"></label>').join('')+'</div><p class="es-reading">'+esc(motion.reading)+'</p><div class="es-stage"><svg viewBox="0 0 1000 666.6667" role="img" aria-label="'+esc(c.scenes[n][0])+'：在生成图上的交互演示"><image href="'+new URL((id==='network-2'?'network-2-clean':id==='evaluation-2'?'evaluation-2-clean-v2':id)+'.png?v=evaluation-attribution-v3-20261101',assetRoot).href+'" x="0" y="0" width="1000" height="666.6667" preserveAspectRatio="xMidYMid meet"/><g class="es-overlay"></g></svg></div>'+(motion.mode==='process'?'<div class="es-playbar"><button data-es-play>暂停演示</button><button data-es-replay>重播</button><label>过程进度<input data-es-time aria-label="过程进度" type="range" min="0" max="100" value="0"><output data-es-progress>0%</output></label></div>':'')+'<div class="es-values" aria-live="polite"></div><p class="es-note">'+esc(motion.mode==='process'?'箭头与扫描标记表达当前设定下的过程；进度用于逐帧观察。':'此处为参数对照；图中指示随输入直接变化。')+''+esc(cfg.note)+'</p><footer><button data-es-reset>恢复本场景默认</button><button data-es-detail>用途与应用条件 ↗</button></footer>';
 const draw=()=>render(host,c.key,n,values,t,playing);
 const onInput=e=>{if(e.target.hasAttribute('data-es-time')){t=+e.target.value/100;playing=false;draw();return;}if(e.target.dataset.esInput!==undefined){values[+e.target.dataset.esInput]=+e.target.value;draw();}};
 const onClick=e=>{
  if(e.target.closest('[data-es-play]')){playing=!playing;last=0;draw();}
  if(e.target.closest('[data-es-replay]')){t=0;playing=true;last=0;draw();}
  if(e.target.closest('[data-es-reset]')){cfg.c.forEach((v,i)=>values[i]=v[4]);t=motion.mode==='process'?0:.5;playing=false;draw();}
  if(e.target.closest('[data-es-detail]')){playing=false;draw();parent.postMessage({type:'petro-topic-scene',key:c.key,index:n,scene:n,settings:values.slice()},'*');}
 };
 const tick=now=>{if(disposed||!host.isConnected)return;frame=requestAnimationFrame(tick);if(!playing||document.hidden){last=0;return;}if(last&&now-last<90)return;const dt=last?Math.min(.25,(now-last)/1000):0;last=now;t=(t+dt/12)%1;host.querySelector('.es-overlay').innerHTML=window.EngineeringOverlay.render(id,...values,t);const slider=host.querySelector('[data-es-time]');if(document.activeElement!==slider)slider.value=Math.round(t*100);host.querySelector('[data-es-progress]').textContent=Math.round(t*100)+'%';host.dataset.sceneState=JSON.stringify({id,values,progress:+t.toFixed(3),playing});};
 host.addEventListener('input',onInput);host.addEventListener('click',onClick);draw();if(motion.mode==='process')frame=requestAnimationFrame(tick);
 return()=>{disposed=true;cancelAnimationFrame(frame);host.removeEventListener('input',onInput);host.removeEventListener('click',onClick);};
}
const previous=window.TopicInteraction;window.TopicInteraction=c=>{const r=previous(c),old=r.mount;r.mount=(host,n=0,anatomy=false)=>anatomy?old(host,n,true):mount(host,c,n);return r;};
window.EngineeringScenes={version:'evaluation-attribution-v3-20261101',config:C,compute,mount,describe:(key,n)=>{const q=C[key]?.[n];return q?window.EngineeringOverlay.mechanism(key+'-'+n).reading+' '+q.note:'';}};
const style=document.createElement('style');style.textContent=`
#topic-scene.es-root{display:block!important;grid-template-columns:none!important}
.es-root{padding:18px;border:1px solid #d4e5dd;border-radius:14px;background:#fff}
.es-head{display:flex;justify-content:space-between;align-items:center;gap:16px}.es-head h3{margin:0;font-size:20px}.es-head>span{font-size:12px;color:#668277}
.es-controls{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:16px 0}.es-controls label{padding:11px 14px;background:#f1f7f3;border-radius:9px;font-size:14px}.es-controls label>span{display:flex;justify-content:space-between;gap:10px}.es-controls output{font-weight:700;color:#167b6b}.es-root input{accent-color:#168575}.es-controls input{width:100%;margin-top:10px}
@keyframes eval-flow{to{stroke-dashoffset:-84}}.eval-live-flow{animation:eval-flow 2.5s linear infinite}@media(prefers-reduced-motion:reduce){.eval-live-flow{animation:none}}.es-reading{font-size:14px;line-height:1.8;color:#355e52;border-left:3px solid #239d82;padding:7px 12px;background:#f3f8f5;margin:10px 0 14px}.es-stage{display:block;max-width:900px;margin:0 auto;border:1px solid #dce8e0;border-radius:12px;overflow:hidden;background:#fcfbf7}.es-stage>svg{display:block;width:100%;height:auto}.es-stage text{font-family:Microsoft YaHei,system-ui,sans-serif}
.es-playbar{display:flex;align-items:center;gap:10px;margin-top:12px}.es-playbar>label{display:flex;align-items:center;gap:12px;flex:1;font-size:14px;white-space:nowrap}.es-playbar input{flex:1;min-width:40px}.es-playbar output{width:42px;text-align:right;color:#167b6b}
.es-values{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin:14px 0}.es-values>div{padding:11px 15px;border:1px solid #d8e7dd;border-radius:9px;background:#f5f9f6}.es-values span{display:block;font-size:12px;color:#587569}.es-values strong{font-size:21px;color:#176b5e;font-weight:600}.es-note{font-size:13px;line-height:1.8;color:#516e61;margin:10px 0}
.es-root footer{display:flex;gap:10px;flex-wrap:wrap}.es-root button{font:inherit;font-size:14px;border:1px solid #aacdbd;background:#fff;color:#1c6d59;border-radius:7px;padding:8px 12px;cursor:pointer}.es-root button:hover{background:#e8f4ed}.es-root input:focus-visible,.es-root button:focus-visible{outline:3px solid #d3a251;outline-offset:3px}
@media(max-width:700px){.es-controls{grid-template-columns:1fr}.es-root{padding:12px}.es-head h3{font-size:17px}.es-values strong{font-size:18px}.es-playbar{flex-wrap:wrap}.es-playbar>label{flex-basis:100%}}
`;document.head.append(style);
})();
