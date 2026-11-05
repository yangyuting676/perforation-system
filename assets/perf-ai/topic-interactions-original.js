/* Presentation-only geometry and motion. Does not load or modify case models. */
window.TopicInteraction=function(C){
 const meta={
 geometry:{labels:['孔道观察位置','入口观察范围'],units:['%','%'],help:'移动观察标记，分别识别岩石内的穿深方向和套管上的入口位置。标记移动不改变原图几何。',parts:['井筒','套管','水泥环','储层岩石']},
 selection:{labels:['套管通径示意','设计偏向：深穿透'],units:['%','%'],help:'先缩小通径，观察器材外形是否越过通径边界；再改变设计偏向。图中展示几何适配和设计目标，实际型号筛选仍在案例演示中计算。',parts:['井筒通径','器材外径','深穿透目标','大孔径目标']},
 evaluation:{labels:['上层流入显示强度','下层流入显示强度'],units:['%','%'],help:'分别改变两层的流入显示强度，比较各层流线与汇流端。总流动现象相近时，分层贡献仍可能不同，评价需要分层资料。',parts:['上部层段','下部层段','井筒汇流','分层观测']},
 damage:{labels:['压实带显示厚度','压实带相对渗透性'],units:['%','%'],help:'加厚压实带，观察低渗区域扩大；降低相对渗透性，观察通过压实带的运动变慢。颜色与速度用于表现阻力来源。',parts:['孔道','压实带','未损伤地层','径向流动']},
 productivity:{labels:['井底压力相对位置','近井阻力显示强度'],units:['%','%'],help:'提高井底压力，观察地层到井筒的压差缩小；增大近井阻力，观察流线通过近井区时变慢。实际产能数值请在案例演示中核对。',parts:['地层压力','井底压力','近井阻力','流入路径']},
 cleanup:{labels:['脉冲峰值显示幅度','脉冲衰减时间'],units:['%','%'],help:'提高峰值，观察回流增强；延长衰减时间，观察回流保持更久。播放进度控制同一次脉冲的时间，碎屑随回流向井筒迁移。',parts:['井筒','孔道','残留碎屑','欠平衡回流']},
 network:{labels:['第2孔相对孔径','沿程孔径差异'],units:['%','%'],help:'增大第2孔开口，观察其示意流束变宽；增大孔间差异，比较各入口。此图展示几何差异，真实流量须由案例中的压力网络求解。',parts:['公共井筒','孔眼入口','分支通道','流量分配']},
 depth:{labels:['观测深度标记','深度校正位移'],units:['%','%'],help:'移动观测深度标记，对照接箍事件与信号参照；器材写实底图保持固定。改变校正位移，比较观测位置与目标层段的相对关系。',parts:['套管接箍','CCL工具','目标层段','测深参照']},
 lithology:{labels:['候选窗口中心','候选窗口厚度'],units:['%','%'],help:'沿测井曲线移动候选窗口，再改变窗口厚度，观察它跨越哪些岩性界面。岩性识别只是选层依据之一，还需结合物性与工程约束。',parts:['测井曲线','岩性界面','候选窗口','工程复核']}
 }[C.key];
 const explain={
 '井筒':['井筒内流体位于套管内侧，是射孔器材所在空间，也是生产或回流的汇集通道。','井筒压力、流体与间隙条件影响射流传播及射孔后的流动，应与地层条件分别记录。'],
 '套管':['套管是井筒的钢制支护结构；射流在管壁形成入口孔眼。入口孔径应在套管开口位置定义。','套管材料、壁厚、内径与器材间隙影响穿透和适配。孔道穿深与套管入口孔径需要分别评价。'],
 '水泥环':['水泥环位于套管与地层之间，承担固井和层间封隔作用。射孔通道需穿过该区域。','固井质量和水泥环完整性影响隔离与连通，不能只根据射孔长度推断封隔状态。'],
 '储层岩石':['储层岩石是射孔通道延伸的介质。岩性、强度、孔隙结构及应力条件影响侵彻与孔周破坏。','预测需要与目标岩性和应力范围对应；地面靶试与井下条件不应直接等同。']
 };
 const why={
 selection:['先核对最小通径与工具全长的通过条件，再检查输送方式和温压条件；不能用名义套管尺寸直接替代实际通径。','将器材外径与实测或设计通径比较，并保留所需间隙。外径满足条件后，才继续核对其他适配规则。','比较穿深时统一靶材、围压和测量起点。深穿透是目标之一，应与入口孔径、施工条件和成本一起权衡。','入口孔径影响孔眼压降。比较大孔径器材时，需要区分初始开口与冲蚀后的开口，并核对试验条件。'],
 evaluation:['分别记录该层的措施时刻、压力和流量，才能判断层段贡献是否改变，而不是将总量变化平均分配给各层。','将本层观测与其他层放在同一时间和压力基准下比较，识别低效段、窜流或不同步响应。','核对总量与分层量的对应时段，并检查生产制度变化；只有总量资料时，分层效果仍需补充观测。','把观测深度、工具和采样时刻对应到层段，减少错层、错时对效果解释的影响。'],
 damage:['孔道几何为流动路径提供边界。解释附加阻力时还要测量或估计孔周损伤，不能只用孔道长度代替。','分别改变压实带厚度与渗透性，观察影响方向；定量表皮需使用相应几何、渗透率与边界条件计算。','使用同一介质和应力条件下的渗透性作为参照，才能解释压实带与原岩之间的差异。','沿流入路径检查低渗区域的位置。近孔道损害只是总表皮的一个可能分量，需与其他损害和完井效应区分。'],
 productivity:['将地层压力与井底流压统一到同一深度和单位，避免把基准差异解释为生产压差。','改变井底流压相当于改变生产条件。比较措施效果时应控制或校正压差差异。','区分近井损伤、孔道几何与其他表皮来源，结合试井或生产资料验证，不将全部阻力归因于射孔。','把流动路径与模型假设对应起来；单相稳定径向流公式不能直接替代多相、非稳态或复杂裂缝流动计算。'],
 cleanup:['井筒压力需与地层压力使用同一基准。欠平衡的幅值和时间历程共同决定回流驱动。','先确定通道几何、碎屑状态及流体条件，再解释回流是否能够携带颗粒。','记录颗粒数量、尺寸和位置；相同残留比例可能对应不同空间分布，不能只凭一个比例还原真实堵塞。','比较相同峰值、不同持续时间的过程，区分瞬时强度与累计作用，并用实验或现场观测校准清洁模型。'],
 network:['公共压力节点连接各分支，改变任一分支条件都可能影响整体分配，应联立求解而不是分别固定各孔流量。','开口面积与直径的平方相关。孔径差异会传递到压降和流量分配，需要核对孔径测量时刻。','每条分支都应保留自身阻力、地层压力和几何条件，避免把不同工况当作完全相同的并联孔。','核对各孔流量之和与给定总量，并检查压降残差。分配均匀程度与总量守恒是不同的检查项。'],
 depth:['用多个相邻接箍的间距和波形建立对应，减少将噪声尖峰误认为真实接箍的可能。','工具运动方向、速度、采样与信号质量都影响事件识别，需检查重复测段与异常点。','把目标层界、射孔枪位置和校正后的工具深度对应，检查所选区间是否落在目标层内。','记录采用的测深基准、校正量和匹配事件，保留可复核的定位依据，而不是只展示一个平移数值。'],
 lithology:['先统一曲线单位、缺失值和深度采样，再评价分类；训练与测试应按井划分，避免相邻样本泄漏。','检查界面附近的标签和采样分辨率，避免将窗口中的混合岩性误称为单一均质层。','改变窗口中心与厚度时，同时核对所覆盖的曲线、标签与有效厚度；窗口汇总不等于最终射孔层段。','将岩性结果与含流体性、物性、应力及施工限制共同复核，再提出工程候选区间。']
 };
 const descriptions=meta.parts.map((name,i)=>[name,...(explain[name]||[
  ({selection:['通径给出器材可通过的空间边界。主图上方展示套管内壁与射孔器之间的间隙；应按最小实际通径核对器材通过条件。','器材外径必须与井筒通径、输送方式和施工条件对应。几何可通过只是适配检查的一部分。','深穿透以形成向地层延伸的通道为目标，需要明确测量起点、岩性与试验条件。','大孔径侧重套管入口开口尺度，常与孔眼压降和处理液分配有关。'],evaluation:['上层入口表示一个独立层段的流入贡献，需用分层测试或解释资料识别。','下层入口与上层分别显示。总量变化不能直接说明每层都同幅改善。','井筒汇流汇集不同层段的流体；总量观测会丢失部分分层信息。','分层观测把措施前后的层段响应对应起来，用于识别低效段与贡献差异。'],damage:['孔道是流体进入井筒的通道，其几何和孔周渗透性共同影响流动。','孔周压实带的渗透性可能低于未损伤地层，构成近孔道附加阻力。','远离孔周扰动的地层提供比较渗透性的参照。','径向流体需通过孔周区域；低渗带越厚、渗透性越低，附加阻力通常越重要。'],productivity:['地层压力为流入提供压力边界，需与井底流压在同一基准下比较。','井底流压是生产条件之一，决定地层到井筒的驱动压差。','近井损伤、完井几何等会形成附加阻力；总表皮需区分其来源。','流入路径连接地层与井筒。定量计算还需流体性质、渗透率、厚度及边界条件。'],cleanup:['井筒侧压力低于地层侧时，压差可驱动流体向井筒回流。','孔道提供流体与碎屑运移的路径，孔道几何与残留状态是不同信息。','碎屑可能滞留在孔道内。颗粒可动性、沉积和孔壁状态影响清洁过程。','回流随压差变化而变化；峰值与有效持续时间共同决定清洁作用历程。'],network:['公共井筒将多个孔眼连接起来，各孔入口压力与沿程压力损失相关。','入口孔径决定开口面积，是孔眼压降关系的重要几何量。','各孔构成并联流动分支，但各孔阻力和局部压力可以不同。','各孔流量需同时满足分支压降关系及总量守恒，不能单独指定后直接相加。'],depth:['接箍对应套管连接部位，可在CCL信号中提供定位事件。','CCL工具随深度移动，通过磁响应变化识别套管连接事件。','目标层段来自地层解释，需与工具测深采用一致的深度参照。','测深校正建立工具记录与参考记录之间的对应关系，应核对基准、重复段和异常事件。'],lithology:['测井曲线表征不同物性响应；岩性推断通常需要多曲线及标签支持。','岩性界面标记层间变化，界面附近的窗口可能包含不同岩性。','候选窗口给出初筛区间；中心和厚度变化会改变纳入的层段。','岩性初筛不能单独给出射孔方案，还需结合物性、流体、应力和施工条件。']}[C.key]||[])[i]||C.intro,
  why[C.key][i]
 ])]);
 C.parts=descriptions;
 const text=(x,y,s,n=19,color='#163e4a')=>`<text x="${x}" y="${y}" font-size="${n}" fill="${color}">${s}</text>`;
 const label=(i,x,y,w=145)=>`<g class="ti-hotspot" data-part="${i}" tabindex="0" role="button" aria-label="${meta.parts[i]}说明"><rect x="${x}" y="${y}" width="${w}" height="36" rx="7" fill="white" stroke="#6b9b94"/>${text(x+10,y+25,meta.parts[i]+' ↗',17)}</g>`;
 const dot=(x,y,r=5,c='#19a993')=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" stroke="white"/>`;
 const line=(x,y,a,b,c='#289786',w=3)=>`<path d="M${x} ${y}L${a} ${b}" stroke="${c}" stroke-width="${w}" fill="none"/>`;
 function svg(a,b,t,scene,anatomy=false,clean=false){
  const A=a/100,B=b/100;let out='';
  if(!anatomy&&C.key==='geometry'&&scene===1){
   let bdy=`<rect x="65" y="95" width="720" height="80" rx="30" fill="url(#pipe)" stroke="#537f89" stroke-width="4"/><defs><linearGradient id="pipe"><stop stop-color="#abc4cc"/><stop offset=".5" stop-color="#e9f2f2"/><stop offset="1" stop-color="#68939d"/></linearGradient></defs>`;
   for(let i=0;i<4;i++){let x=160+i*175,r=9+A*22+(i-1.5)*B*8;bdy+=`<path d="M${x} 175V320" stroke="#d5b98c" stroke-width="${r*2+10}"/><path d="M${x} 175V320" stroke="#3c9eaa" stroke-width="${r*2}"/>`;for(let j=0;j<6;j++)bdy+=dot(x,175+130*((t+j/6)%1),4);bdy+=text(x-25,354,'孔 '+(i+1),19);}
   return `<svg viewBox="0 0 860 460" role="img" aria-label="入口孔径与孔间差异"><rect width="860" height="460" rx="12" fill="#f6faf9"/>${bdy}${text(70,55,'多孔入口几何：统一尺度与孔间差异分别调节',23)}<g data-term="1" role="button" tabindex="0" class="ti-hotspot"><rect x="620" y="355" width="170" height="35" rx="6" fill="white" stroke="#368c80"/>${text(635,379,'入口孔径 D ↗',18)}</g>${text(75,416,'开口面积随直径变化；实际分流需联立孔眼压降与总量守恒。',19)}</svg>`;
  }
  if(!anatomy&&scene===1){
   const one=svg(35,35,t,0,true),two=svg(a,b,t,0,true);
   return `<svg viewBox="0 0 860 490" role="img" aria-label="${C.scenes[scene][0]}：基准与当前几何对照"><rect width="860" height="490" rx="12" fill="#f6faf9"/>${text(25,28,'固定示意基准：35% / 35%',20)}${text(450,28,'当前设置：'+a+'% / '+b+'%',20)}<svg x="0" y="45" width="420" height="370" viewBox="0 0 860 460">${one}</svg><svg x="440" y="45" width="420" height="370" viewBox="0 0 860 460">${two}</svg>${text(25,450,'先固定一个输入，再比较另一个输入改变的部位与方向。',20)}</svg>`;
  }
  if(!anatomy&&C.key==='geometry'&&scene===2){
   let mesh='';for(let x=95;x<350;x+=22)for(let y=105;y<285;y+=22)mesh+=`<rect x="${x}" y="${y}" width="20" height="20" fill="${(x+y)%3?'#d4e5dc':'#94b4ab'}" stroke="#648e88" stroke-width=".5"/>`;
   const tip=160+A*160;
   return `<svg viewBox="0 0 860 460" role="img" aria-label="物理模型、代理模型与独立验证"><rect width="860" height="460" fill="#f6faf9"/>${text(55,48,'物理模型：描述侵彻过程',22)}${mesh}<path d="M95 195H${tip}" stroke="#b5753b" stroke-width="${8+B*22}"/>${dot(95+(tip-95)*t,195,8,'#e8a456')}${text(470,48,'代理模型：学习输入与输出关系',22)}${Array.from({length:12},(_,i)=>{const x=480+i%4*75,y=110+Math.floor(i/4)*70;return line(x,y,780,195,'#a5bcb6',1)+dot(x,y,9,i<Math.round(A*12)?'#1d8e7b':'#b9cbc7')}).join('')}${dot(780,195,16)}${text(70,335,'数值离散 → 材料与边界 → 计算响应',18)}${text(470,335,'输入样本 → 拟合关系 → 输出估计',18)}${text(90,410,'两类方法均需独立验证；动画仅展示步骤与输入作用位置。',20)}<g data-scene-detail="2" role="button" tabindex="0" class="ti-hotspot"><rect x="30" y="70" width="800" height="295" fill="transparent"/><rect x="330" y="360" width="215" height="34" rx="7" fill="white" stroke="#368c80"/>${text(345,384,'方法与验证说明 ↗',18)}</g></svg>`;
  }

  const well=`<rect x="55" y="65" width="115" height="265" rx="10" fill="url(#water)"/><rect x="170" y="65" width="22" height="265" fill="#6e8b99"/><rect x="192" y="65" width="32" height="265" fill="#d5c9b1"/><rect x="224" y="65" width="601" height="265" rx="6" fill="url(#rock)"/>`;
  if(C.key==='geometry'){
   const end=330+450*A,h=10+36*B;out=well+`<path d="M170 ${200-h}H${end-40}Q${end+40} 200 ${end-40} ${200+h}H170Z" fill="#496f73" stroke="#e4d4b7" stroke-width="6"/>`;
   for(let i=0;i<15;i++)out+=dot(end-(end-165)*((t+i/15)%1),200+Math.sin(i)*h*.4,4);
   out+=line(225,282,end,282)+text(320,310,'地层穿深 L：从岩石入口量起',18)+line(150,200-h,150,200+h)+text(65,365,'D：套管开口尺度；L：地层内部延伸尺度',19);
  }else if(C.key==='selection'){
   let gap=35+110*A,toolx=90+120*t;out=`<rect x="65" y="${200-gap}" width="620" height="${gap*2}" rx="40" fill="#e0eef2" stroke="#8aabb6" stroke-width="4"/><path d="M65 ${200-gap}H685M65 ${200+gap}H685" stroke="#297d8e" stroke-dasharray="9 7" stroke-width="3"/><rect x="${toolx}" y="144" width="390" height="112" rx="22" fill="url(#steel)"/>`;
   for(let i=0;i<5;i++)out+=`<path d="M${toolx+60+i*65} 145v110" stroke="#293f48" stroke-width="6"/>`;
   out+=`<path d="M${toolx+400} 200h${90+150*B}" stroke="#b97c3a" stroke-width="${10+30*(1-B)}"/>`+text(100,350,gap<56?'间隙不足':'比较器材外径与通径边界',20)+text(540,280,B>.5?'深穿透侧重':'大孔径侧重',19);
  }else if(C.key==='evaluation'||C.key==='network'){
   out=`<rect x="65" y="85" width="720" height="80" rx="30" fill="url(#steel)"/>`;
   for(let i=0;i<4;i++){let x=170+i*165,v=C.key==='network'?(i===1?.2+A:.3+(i%2?B:1-B)*.6):(i<2?A:B),w=7+24*v;
    out+=`<path d="M${x} 165V320" stroke="#dbc6a3" stroke-width="${w+14}"/><path d="M${x} 165V320" stroke="#439ca4" stroke-width="${w}"/>`;
    for(let j=0;j<5;j++)out+=dot(x,C.key==='network'?175+145*((t*(.35+v)+j/5)%1):310-145*((t*(.35+v)+j/5)%1),3+v*3);
    out+=text(x-28,350,C.key==='network'?'孔 '+(i+1):i<2?'上层':'下层',18);
   }for(let i=0;i<20;i++)out+=dot(C.key==='network'?80+700*((t+i/20)%1):780-700*((t+i/20)%1),125,4,'#51d8c5');
   out+=text(80,385,C.key==='network'?'流束宽度表示开口差异；流量由原压力网络计算':'分别观察层段贡献，再解释全井总量',19);
  }else if(C.key==='damage'||C.key==='productivity'){
   const radius=65+95*(C.key==='damage'?A:B);out=`<rect x="65" y="70" width="720" height="270" rx="12" fill="url(#rock)"/><circle cx="430" cy="205" r="${radius}" fill="${C.key==='damage'?`rgb(${150+Math.round(B*50)},${95+Math.round(B*75)},95)`:'#b17b50'}" opacity=".5"/><circle cx="430" cy="205" r="49" fill="url(#water)" stroke="#42606c" stroke-width="8"/>`;
   for(let i=0;i<14;i++){let angle=i*Math.PI/7;out+=line(430+210*Math.cos(angle),205+120*Math.sin(angle),430+52*Math.cos(angle),205+52*Math.sin(angle),'#b2c9be',1);
    const speed=C.key==='damage'?.15+B*.7:.1+(1-A)*(1-B*.8);let u=(t*speed+i*.07)%1,r=52+(1-u)*150;out+=dot(430+r*Math.cos(angle),205+r*.6*Math.sin(angle),5);}
   if(C.key==='productivity')out+=`<rect x="90" y="90" width="28" height="220" fill="#bee0df"/><rect x="90" y="${310-200*A}" width="28" height="${200*A}" fill="#257b86"/>`+text(75,345,'井底压力',16);
   out+=text(80,380,C.key==='damage'?'棕色环：压实带；青色粒子：穿过近井区域的流动':'驱动压差与近井阻力分别改变流动显示',19);
  }else if(C.key==='cleanup'){
   const decay=Math.exp(-t*5/(.25+B*2)),amp=A*decay;out=well+`<path d="M170 177H745Q795 200 745 223H170Z" fill="#5c8086" stroke="#beaa8c" stroke-width="8"/>`;
   for(let i=0;i<19;i++){let x=225+((i*29-t*(100+500*A)*(.3+B))%530+530)%530;out+=dot(x,192+(i%3)*8,4,'#42d8d0');}
   for(let i=0;i<13;i++){let x=260+i*35-t*A*(.3+B)*360;out+=`<path d="M${x} ${214-i%3*6}l9 -9 8 12-11 4Z" fill="#b76d43" opacity="${x<170?.15:1}"/>`;}
   let points=Array.from({length:81},(_,i)=>`${100+i*8},${382-60*A*Math.exp(-i/16/(.25+B*2))}`).join(' ');out+=`<polyline points="${points}" fill="none" stroke="#b77937" stroke-width="3"/>`+line(100+t*640,310,100+t*640,390,'#167a79',2)+text(75,420,'下方：归一化压差历程；竖线：当前时刻',18)+text(550,300,'当前相对幅度 '+amp.toFixed(2),19);
  }else if(C.key==='depth'){
   out=`<rect x="170" y="70" width="75" height="290" fill="url(#steel)"/><rect x="245" y="70" width="390" height="290" fill="#f0f6f5"/>`;
   for(let y=90;y<360;y+=65)out+=`<rect x="160" y="${y}" width="95" height="18" rx="3" fill="#547582"/>`;
   let y=90+240*((A+t*.35)%1);out+=`<rect x="310" y="${y-24}" width="45" height="48" rx="9" fill="#236e75"/>`+line(332,65,332,y-24,'#597d80',2)+`<rect x="450" y="${210+(B-.5)*100}" width="150" height="70" fill="#e4ba75" opacity=".65" stroke="#9d7031"/>`;
   let points=Array.from({length:121},(_,i)=>{let z=75+i*2.3,p=Math.exp(-Math.pow(((z-99)%65)/7,2));return`${690+p*55},${z}`}).join(' ');out+=`<polyline points="${points}" fill="none" stroke="#248b83" stroke-width="3"/>`+line(650,y,770,y,'#b47436',2)+text(80,397,'工具位置与目标层段采用同一深度参照',19);
  }else if(C.key==='lithology'){
   out=`<rect x="65" y="65" width="720" height="295" fill="#f8faf9" stroke="#cfddda"/>`;
   const cols=['#c5d3c3','#e0c69c','#b7cbd4','#dfc3a8','#b4cfc3'];for(let i=0;i<5;i++)out+=`<rect x="450" y="${65+i*59}" width="285" height="59" fill="${cols[i]}"/>`+text(545,103+i*59,['砂岩','泥岩','砂岩','灰岩','泥岩'][i],18);
   let points=Array.from({length:130},(_,i)=>`${210+45*Math.sin(i*.23)+30*Math.cos(i*.08)},${70+i*2.2}`).join(' ');out+=`<polyline points="${points}" fill="none" stroke="#258c82" stroke-width="3"/>`;
   const h=25+B*100,y=80+A*(260-h);out+=`<rect x="105" y="${y}" width="650" height="${h}" fill="#48b59c" fill-opacity=".13" stroke="#0b786a" stroke-width="3" stroke-dasharray="8 5"/>`+line(90,80+t*270,770,80+t*270,'#b47939',2)+text(100,402,'虚线框：候选窗口；横线：当前阅读深度',19);
  }
  if(!anatomy&&scene===2){const x=210+500*t;out+=`<path d="M${x} 75V330" stroke="#ac6e2d" stroke-width="2" stroke-dasharray="6 6"/><circle cx="${x}" cy="205" r="23" fill="none" stroke="#ad7135" stroke-width="3"/>`+text(75,440,'移动观测位置：核对几何、边界与独立观测的对应关系',18);}
  const anchors={geometry:[[110,140],[180,250],[210,120],[650,270]],selection:[[95,120],[230,190],[670,200],[540,200]],evaluation:[[170,240],[665,240],[400,125],[500,300]],network:[[400,125],[335,190],[500,280],[670,260]],damage:[[430,205],[505,240],[670,200],[300,170]],productivity:[[700,220],[430,205],[490,240],[280,170]],cleanup:[[110,180],[460,200],[640,210],[270,200]],depth:[[200,170],[330,200],[500,245],[710,240]],lithology:[[220,150],[500,180],[110,260],[660,300]]}[C.key];
  const links=anchors.map((p,i)=>line(98+i*205,50,p[0],p[1],'#668d87',1)+`<circle cx="${p[0]}" cy="${p[1]}" r="15" fill="#fff" fill-opacity=".18" stroke="#397d72" stroke-width="2" data-part="${i}" class="ti-hotspot" role="button" tabindex="0" aria-label="${meta.parts[i]}部位"/>`).join('');
  return `<svg viewBox="0 0 860 460" role="img" aria-label="${C.title}：${anatomy?'工程对象':C.scenes[scene][0]}" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="water"><stop stop-color="#166987"/><stop offset="1" stop-color="#3bafbc"/></linearGradient><linearGradient id="steel"><stop stop-color="#406571"/><stop offset=".45" stop-color="#b7c9ce"/><stop offset="1" stop-color="#426570"/></linearGradient><pattern id="rock" width="33" height="27" patternUnits="userSpaceOnUse"><rect width="33" height="27" fill="#e9d7b6"/><circle cx="7" cy="9" r="2" fill="#c5a77e"/><circle cx="25" cy="22" r="1.6" fill="#bda784"/></pattern></defs><rect width="860" height="460" rx="14" fill="#f6faf9"/>${out}${clean?'':links+label(0,25,14)+label(1,230,14)+label(2,435,14)+label(3,640,14)}</svg>`;
 }
 function mount(host,scene=0,anatomy=false){
  let a=55,b=55,t=.2,playing=!anatomy,last=0,raf=0,hovering=false,pressed=false;
  let controlLabels=meta.labels,guide=meta.help;
  if(C.key!=='geometry'&&scene===1)guide='左侧固定为35% / 35%的几何示意，右侧随当前设置改变。'+meta.help;
  if(C.key!=='geometry'&&scene===2)guide='移动的观测标记提示需要在哪些部位取得独立资料。'+meta.help;

  host.classList.add('ti-root');host.innerHTML=`${anatomy?'':`<header class="ti-head"><h3>${C.scenes[scene][0]}</h3><span>机理与几何演示</span></header><div class="ti-controls">${controlLabels.map((l,i)=>`<label>${l}<output>${i?b:a}${meta.units[i]}</output><input aria-label="${l}" type="range" min="5" max="95" value="55" data-ti="${i}"></label>`).join('')}</div>`}<div class="ti-canvas"></div>${anatomy?'':`<div class="ti-transport"><button data-play>暂停</button><button data-reset>重播</button><label>过程进度 <input aria-label="过程进度" type="range" min="0" max="100" value="20" data-time></label><output data-status>20%</output></div><p class="ti-guide">拖动参数观察图形；点击图中标记查看含义与工程作用。</p><button class="ti-scene-detail" data-scene-detail="${scene}">阅读本场景：用途、观察方法与应用条件 ↗</button>`}`;
  const canvas=host.querySelector('.ti-canvas'),visual=window.TopicInteraction(C);function draw(){canvas.innerHTML=visual.render(a,b,t,scene,anatomy);
 // Decorative leaders must never intercept a component click. Each label and
 // its remote anchor get separate hit areas, so keyboard/automation centers
 // and direct clicks all land on a real control rather than empty group space.
 const svg=canvas.querySelector('svg');
 if(svg){
  const ns='http://www.w3.org/2000/svg';
  for(const g of [...svg.querySelectorAll('g[data-part]')]){
   for(const dot of [...g.querySelectorAll('circle')]){
    if(dot.closest('[data-part]')!==g)continue;
    for(const name of ['data-part','role','tabindex'])dot.setAttribute(name,g.getAttribute(name));
    dot.setAttribute('aria-label',(g.getAttribute('aria-label')||'部件说明').replace(/说明$/,'部位'));
    dot.classList.add('ti-hotspot');dot.setAttribute('r',Math.max(16,Number(dot.getAttribute('r'))||0));
    g.after(dot);
   }
  }
  const controls=[...svg.querySelectorAll('[data-part],[data-term]')];
  for(const el of svg.querySelectorAll('*'))el.style.pointerEvents='none';
  for(const el of controls){
   if(el.tagName.toLowerCase()==='g'){
    const box=el.getBBox(),hit=document.createElementNS(ns,'rect');
    for(const [k,v] of Object.entries({x:box.x,y:box.y,width:box.width,height:box.height,fill:'transparent'}))hit.setAttribute(k,v);
    el.prepend(hit);
   }
   el.style.pointerEvents='all';for(const child of el.querySelectorAll('*'))child.style.pointerEvents='all';
   if(el.parentNode===svg)svg.append(el);
  }
 }
host.dataset.visualState=[a,b,Math.round(t*100)].join(',');}
  host.addEventListener('focusin',()=>{hovering=true});host.addEventListener('focusout',()=>{hovering=false});
  host.addEventListener('pointerover',ev=>{if(ev.target.closest('.ti-hotspot'))hovering=true});host.addEventListener('pointerout',ev=>{if(!ev.relatedTarget?.closest?.('.ti-hotspot'))hovering=false});host.addEventListener('pointerdown',()=>{pressed=true});host.addEventListener('pointerup',()=>requestAnimationFrame(()=>{pressed=false}));host.addEventListener('pointercancel',()=>{pressed=false;hovering=false});
  host.addEventListener('input',ev=>{let el=ev.target;if(el.hasAttribute('data-ti')){if(el.dataset.ti==='0')a=+el.value;else b=+el.value;el.previousElementSibling.textContent=el.value+'%';draw()}if(el.hasAttribute('data-time')){t=+el.value/100;playing=false;host.querySelector('[data-play]').textContent='播放';draw()}});
  host.addEventListener('click',ev=>{if(ev.target.closest('[data-play]')){playing=!playing;host.querySelector('[data-play]').textContent=playing?'暂停':'播放'}if(ev.target.closest('[data-reset]')){t=0;playing=true;host.querySelector('[data-play]').textContent='暂停'}const p=ev.target.closest('[data-part]');if(p)parent.postMessage({type:'petro-topic-component',key:C.key,index:+p.dataset.part,state:[a,b,t],scene},'*');if(ev.target.closest('[data-scene-detail]'))parent.postMessage({type:'petro-topic-scene',key:C.key,index:scene,state:[a,b,t]},'*')});
  host.addEventListener('keydown',ev=>{if((ev.key==='Enter'||ev.key===' ')&&ev.target.matches('[data-part],[data-term],[data-scene-detail]')){ev.preventDefault();ev.target.dispatchEvent(new MouseEvent('click',{bubbles:true}))}});
  function frame(now){if(!host.isConnected)return;if(playing&&!hovering&&!pressed&&now-last>55){t=(t+.009)%1;draw();host.querySelector('[data-time]').value=Math.round(t*100);host.querySelector('[data-status]').textContent=Math.round(t*100)+'%';last=now}raf=requestAnimationFrame(frame)}draw();if(!anatomy)raf=requestAnimationFrame(frame);return()=>cancelAnimationFrame(raf);
 }
 function detail(a,b,t,i){
  const views={geometry:['45 65 140 265','130 120 130 160','180 65 120 265','230 90 555 240'],selection:['65 70 620 270','90 110 480 190','470 110 350 190','470 110 350 190'],evaluation:['100 150 260 205','430 150 300 205','65 85 720 120','95 170 640 185'],network:['65 85 720 120','260 145 150 190','430 165 150 190','585 165 150 190'],damage:['360 130 145 145','275 70 310 270','590 70 195 270','180 70 390 270'],productivity:['590 70 195 270','360 130 145 145','280 70 310 270','180 70 390 270'],cleanup:['55 65 135 265','170 150 620 100','420 155 340 105','145 150 450 110'],depth:['155 130 110 170','280 65 120 295','430 140 200 200','650 65 125 290'],lithology:['140 65 230 295','450 120 285 160','100 90 650 200','450 65 285 295']}[C.key];
  return svg(a,b,t,0,true,true).replace('viewBox="0 0 860 460"','viewBox="'+views[i]+'"');
 }
 return {mount,parts:descriptions,render:svg,detail,help:meta.help};
};

