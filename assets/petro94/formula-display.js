/* Explicit mathematical typography; numerical models remain in mechanics.js. */
(()=>{'use strict';
const S=String.raw;
const templates={
geosteer:{lines:[S`w=\begin{cases}\tfrac12 e^{-d/\lambda},&d\ge0\\1-\tfrac12e^{d/\lambda},&d<0\end{cases}`,S`R_{\mathrm{app}}=\left(\frac{1-w}{R_{\mathrm{up}}}+\frac{w}{R_{\mathrm{low}}}\right)^{-1}`],note:'上下层电阻率按灵敏度权重混合；特征长度 λ = 1 m。'},
lag:{lines:[S`\Delta t=\frac{L}{v}`,S`\Delta z=\frac{v\,\Delta t_{\mathrm{sample}}}{60}`],note:'推进速度以 m/min、采样间隔以 s 输入；第二式包含秒到分钟的换算。'},
gravel:{lines:[S`\Delta p=\frac{\mu QL}{kA}`],note:'液相黏度取 1 mPa·s，通流面积取 0.01 m²。'},
sanding:{lines:[S`\sigma_1=\sigma_3+\Delta\sigma,\qquad\sigma_{1,\mathrm{crit}}=\mathrm{UCS}+N_\varphi\sigma_3`,S`N_\varphi=\frac{1+\sin\varphi}{1-\sin\varphi}=3,\qquad\varphi=30^\circ`],note:'压缩取正；这里给出三轴强度参照，不是出砂量。'},
damage:{lines:[S`s=\left(\frac{k}{k_s}-1\right)\ln\frac{r_s}{r_w}`,S`Q=\frac{2\pi kh\,\Delta p}{\mu\left[\ln(r_e/r_w)+s\right]}`],note:'井半径 0.1 m，外边界半径 100 m，原状渗透率 100 mD，层厚 10 m，黏度 1 mPa·s。'},
gasmigration:{lines:[S`Q_{\mathrm{out}}=\frac{wh^3(p_{\mathrm{in}}^2-p_{\mathrm{out}}^2)}{24\mu Lp_{\mathrm{out}}}\quad(p_{\mathrm{in}}>p_{\mathrm{out}})`],note:'缝宽方向尺寸 w = 5 mm，流径 L = 0.5 m，气体黏度 18 μPa·s；反向压差时本方向流量置零。'},
leaklocation:{lines:[S`t_{\mathrm{arrival}}=\frac{|z_{\mathrm{receiver}}-z_{\mathrm{source}}|}{v}`],note:'两个接收点深度分别为 800 m 和 1200 m；声源位置为给定输入。'},
multiphasepressure:{lines:[S`\Delta p=\rho_mgL+f\frac{L}{D}\frac{\rho_mv^2}{2}`,S`\rho_m=H_g\rho_g+(1-H_g)\rho_l`],note:'气、液密度分别取 50 和 1000 kg/m³；摩阻系数 0.02，计算长度 100 m。'},
safety:{lines:[S`F=\Delta p\,A,\qquad F>F_0\ \Longrightarrow\ \text{开启}`,S`x=\min\!\left(10\,\mathrm{mm},\max\!\left(0,\frac{F-F_0}{k}\right)\right)`],note:'示例弹簧刚度 k = 1 kN/mm；控制压差须扣除背压。'},
aicd:{lines:[S`G_o=\frac{1-f_w}{\mu_r},\qquad G_w=\frac{f_w}{R_w}`,S`f_{w,\mathrm{out}}=\frac{G_w}{G_o+G_w}`],note:'两相支路共用给定压差；水相阻力倍数是教学设定。'},
hightemp:{lines:[S`\frac{\mathrm{Ca}}{\mathrm{Si}}=\frac{0.65/56.08}{(0.22+r_{\mathrm{Si}})/60.08}`],note:'参照干水泥含 CaO 65%、SiO₂ 22%；r 表示硅质添加质量比。总元素比不等于水化物组成。'},
mismatch:{lines:[S`\varepsilon_c=\alpha_c\Delta T+\eta(\alpha_s-\alpha_c)\Delta T`,S`\sigma_c=E_c(\varepsilon_c-\alpha_c\Delta T)`],note:'η 为界面约束比例；示例水泥模量取 15 GPa。'},
boreholeimage:{lines:[S`z(\theta)=z_0+R\tan\delta\cos(\theta-\theta_0)`],note:'垂直井与平面层界参照；井半径 R = 0.1 m。'},
dispersion:{lines:[S`v(f)=v_0+\Delta v\,\frac{f^2}{f^2+f_c^2}`],note:'教学特征频率取 10 kHz。'},
fracturewave:{lines:[S`|T|=\frac{1}{\sqrt{1+(\omega ZC_n/2)^2}}`],note:'两侧为相同介质，采用正入射、小振幅线性柔度界面参照。'},
porepressure:{lines:[S`P_p=S_v-(S_v-P_n)\left(\frac{\Delta t_n}{\Delta t_{\mathrm{obs}}}\right)^3`],note:'示例上覆应力梯度为 22 MPa/km；正常压实趋势及指数须区域标定。'},
blend:{lines:[S`\frac1{\rho_s}=\frac{1-r}{3150}+\frac{r}{2300}`,S`\rho_{\mathrm{slurry}}=\frac{1+\beta}{1/\rho_s+\beta/1000}`],note:'r 为掺合料质量替代比例；β 为水胶质量比。水泥与掺料密度分别取 3150 和 2300 kg/m³。'},
beds:{lines:[S`C\approx\min\left(1,\frac{h}{w}\right)`],note:'矩形层段与有限响应宽度的平均参照；h 为层厚，w 为响应宽度。'},
gamma:{lines:[S`I_{\mathrm{GR}}=\frac{\mathrm{GR}-\mathrm{GR}_{\mathrm{clean}}}{\mathrm{GR}_{\mathrm{shale}}-\mathrm{GR}_{\mathrm{clean}}}`],note:'线性泥质指示按清洁地层与泥岩端元归一化，再截断到 0—1。'},
archie:{lines:[S`R_t=\frac{aR_w}{\varphi^mS_w^n}`],note:'本例采用 a = 1、m = n = 2；只作清洁、完全水湿地层参照。'},
nmr:{lines:[S`S(u)=\exp\left[-\frac{(u-u_0)^2}{2\sigma^2}\right]`,S`u=\ln(T_2/\mathrm{ms}),\qquad\sigma=0.75`,S`u_0=\ln(T_{2,\mathrm{peak}}/\mathrm{ms})`],note:'在对数弛豫时间轴上构造高斯教学谱，按 T₂ 截止值划分谱面积。'},
sonic:{lines:[S`t=\frac{L}{v},\qquad\lambda=\frac{v}{f}`],note:'分别计算均匀介质中的传播时间和波长。'},
density:{lines:[S`\rho_b=(1-\varphi)\rho_{\mathrm{ma}}+\varphi\left[(1-S_g)\rho_w+S_g\rho_g\right]`],note:'盐水与气体密度分别取 1.00 和 0.15 g/cm³；忽略泥质与井眼效应。'},
signal:{lines:[S`y(t)=b(t)+\delta+\epsilon(t)+\eta(t)`,S`r(t)=y(t)-b(t)`],note:'观测由共同基线、通道偏移、确定性噪声与孤立扰动组成；残差用于检查偏离。'},
invasion:{lines:[],note:'径向分区依次为井眼、侵入带和原状地层；图中只比较几何与端元电性。'},
caliper:{lines:[S`g_{\min}=\frac{D-d}{2}-e`],note:'D 为井径或最小通径，d 为工具外径，e 为偏心距。'},
elastic:{lines:[S`\mu=\rho V_s^2,\qquad\lambda=\rho(V_p^2-2V_s^2)`,S`E=\frac{\mu(3\lambda+2\mu)}{\lambda+\mu},\qquad\gamma=\frac{\tau}{\mu}`],note:'各向同性线弹性动态参照；示例剪应力取 1 MPa。'},
hydrostatic:{lines:[S`P_h=\rho gz,\qquad\mathrm{ECD}=\frac{P_h+\Delta P_f}{gz}`],note:'摩阻为给定输入；密度统一采用 kg/m³ 后代入。'},
darcy:{lines:[S`q_i=G_i\Delta p`],note:'G 为给定层段导流系数；各层使用同一压差。'},
thermal:{lines:[S`T_{\mathrm{mix}}=(1-f)T_1+fT_2`],note:'相同比热、绝热混合参照；f 为第二股流体的质量比例。'},
mixture:{lines:[S`\rho_{\mathrm{mix}}=H_g\rho_g+(1-H_g)\rho_l`,S`j=H_gv_g+(1-H_g)v_l`],note:'按给定气相持率计算混合密度与体积通量。'},
acoustic:{lines:[S`R=\frac{Z_2-Z_1}{Z_2+Z_1}`,S`\overline R=fR_{\mathrm{contact}}+(1-f)R_{\mathrm{fluid}}`],note:'同相面积平均参照；流体声阻抗取 1.5 MRayl。'},
hydration:{lines:[S`t_{\mathrm{eq}}=t\exp\left[\frac{E_a}{R}\left(\frac1{T_{\mathrm{ref}}}-\frac1T\right)\right]`],note:'参照温度为 293.15 K；反应温度代入时使用开尔文。'},
cementmix:{lines:[S`V=\frac{m_s}{\rho_s}+\frac{m_w}{\rho_w},\qquad m_w=\frac wc\,m_s`],note:'采用固、液体积可加的混配参照；w/c 为水灰质量比。'},
settling:{lines:[S`v=\frac{\Delta\rho\,gd^2}{18\mu}`],note:'密度差取 2150 kg/m³；采用 Stokes 低雷诺数沉降参照。'},
filtration:{lines:[S`\frac qA=\frac{k\Delta p}{\mu L}`],note:'液相黏度取 1 mPa·s；此处为稳态多孔介质穿流参照。'},
rheology:{lines:[S`\tau=\tau_0+\mu_p\dot\gamma,\qquad\mu_{\mathrm{app}}=\frac\tau{\dot\gamma}`],note:'采用宾汉流体参照，区分屈服应力、塑性黏度与表观黏度。'},
annular:{lines:[S`u\propto h^2,\qquad\frac{u_{\mathrm{wide}}}{u_{\mathrm{narrow}}}=\left(\frac{h_{\mathrm{wide}}}{h_{\mathrm{narrow}}}\right)^2`],note:'局部平行板层流近似；宽、窄边共用同一压降。'},
barrier:{lines:[S`Q=C_dA\sqrt{\frac{2\Delta p}{\rho}}`],note:'示例流量系数取 0.62；单相、不可压缩孔口参照。'},
thermalstrain:{lines:[S`\Delta L=\alpha L\Delta T,\qquad\sigma=\eta E\alpha\Delta T`],note:'η 为约束比例；热膨胀系数取 12×10⁻⁶/K，模量取 200 GPa。'},
diffusion:{lines:[S`\ell=\sqrt{2Dt}`],note:'扩散特征长度参照，不等同于化学反应前缘。'},
envelope:{lines:[S`T\le160c\,{}^\circ\mathrm C,\qquad P\le80c\,\mathrm{MPa}`],note:'c 为归一化教学覆盖比例；温度与压力同时落入覆盖范围，才标记为域内。'},
axial:{lines:[S`A=\frac\pi4(D^2-d^2),\qquad\sigma=\frac FA`],note:'均匀轴载、环形承载截面参照。'},
buckling:{lines:[S`P_{\mathrm{cr}}=\frac{\pi^2EI}{(KL)^2}`],note:'示例模量取 200 GPa，壁厚取 6 mm；只计算理想杆临界载荷。'},
packer:{lines:[S`(D_{\mathrm{out}}^2-D_{\mathrm{in}}^2)L=\mathrm{const}`],note:'不可压缩、自由膨胀几何参照；固定内径为 70 mm，不代表接触后的真实形态。'},
screen:{lines:[S`\frac{A_{\mathrm{open}}}{A_0}=1-B`],note:'比较筛缝宽度 w 与颗粒直径 d；B 为独立给定的筛面堵塞覆盖比例。'},
erosion:{lines:[S`\dot E=\frac12\dot m v^2,\qquad\dot E_n=\dot E\sin^2\theta`],note:'冲击角相对表面定义；只计算输入动能量级，不换算磨损深度。'},
idealgas:{lines:[S`P_2=P_1\frac{T_2}{T_1}\frac{V_1}{V_2}`],note:'初始温度取 293.15 K；温度全部使用开尔文。'},
fatigue:{lines:[S`N=10^6\left(\frac{100}{\sigma_a}\right)^m,\qquad D=\frac nN`],note:'人为给定的 S–N 教学曲线；不是接头材料的实测参数。'}
};
templates['density-neutron']={lines:[S`\rho_f=(1-S_g)\rho_w+S_g\rho_g`,S`\varphi_N=\varphi[(1-S_g)+0.10S_g]`,S`\varphi_D=\frac{\rho_{\mathrm{ma}}-\rho_b}{\rho_{\mathrm{ma}}-\rho_w}`],note:'盐水密度取 1.00 g/cm³，气体密度取 0.15 g/cm³；中子响应采用给定含氢指数。'};
templates.clearance=templates.caliper;templates.valve=templates.barrier;
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cache=new Map();
function html(kind,fallback=''){if(cache.has(kind))return cache.get(kind);const t=templates[kind];if(!t||!window.katex)return '<p>'+escape(fallback)+'</p>';const result='<div class="formula-title">计算关系</div>'+t.lines.map(tex=>'<div class="math-row">'+window.katex.renderToString(tex,{displayMode:true,throwOnError:true,strict:'ignore',trust:false,output:'htmlAndMathml'})+'</div>').join('')+'<p class="formula-note">'+escape(t.note)+'</p>';cache.set(kind,result);return result;}
function reference(expression){if(!/^[a-z0-9 .+*()\-]+$/.test(expression))throw Error('Unsupported teaching expression');let t=expression.replace(/\(1-a\)\*\*0\.5/g,'\\sqrt{1-a}').replace(/exp\(-3\*a\)/g,'e^{-3a}').replace(/sin\(3\*a\)/g,'\\sin(3a)').replace(/abs\(([abc]-[abc])\)/g,'\\lvert $1\\rvert').replace(/([abc])\*\1/g,'$1^{2}').replace(/\*/g,'\\cdot ');return window.katex.renderToString('g(a,b,c)='+t,{displayMode:false,throwOnError:true,strict:'ignore',trust:false});}
window.BGFormulas={templates,html,reference};
})();
