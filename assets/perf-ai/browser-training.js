/* Offline worker training. No service calls, test-set gradients, or log replay. */
(()=>{'use strict';
const K=globalThis.PerfAIKernels,wait=()=>new Promise(r=>setTimeout(r,0));
const median=a=>K.quantile(a,.5),flat=x=>Array.isArray(x)?x.flat(Infinity):[x];
function shape(x){const s=[];while(Array.isArray(x)){s.push(x.length);x=x[0]}return s}
function shuffle(a,random){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function summary(y,p){return K.stats(y,p)}
function classification(y,p,t){const b=K.binary(y,p,t);let pairs=0,good=0;for(let i=0;i<y.length;i++)if(y[i])for(let j=0;j<y.length;j++)if(!y[j]){pairs++;good+=p[i]>p[j]?1:p[i]===p[j]?.5:0}return {F1:b.F1,AUC:pairs?good/pairs:null,confusion:[[b.tn,b.fp],[b.fn,b.tp]]}}
async function boosted(key,m,c,report){
 const isX=key==='geometry',X=m.X,y=isX?m.y:m.y.map((v,i)=>v-X[i][0]),ids=isX?m.train:Array.from({length:m.train_end},(_,i)=>i),random=K.rng(c.seed),base=isX?K.mean(ids.map(i=>y[i])):median(ids.map(i=>y[i])),pred=Array(X.length).fill(base),importance=Array(X[0].length).fill(0),trees=[],loss=[];
 for(let round=0;round<c.rounds;round++){
  const sample=isX?shuffle(ids,random).slice(0,Math.ceil(ids.length*.9)):ids,grad=pred.map((v,i)=>isX?v-y[i]:Math.sign(v-y[i]));let nodeid=0;
  function node(indices,depth){const G=K.sum(indices.map(i=>grad[i])),H=indices.length;return {indices,depth,id:nodeid++,leaf:isX?-G/(H+1)*c.lr:median(indices.map(i=>y[i]-pred[i]))*c.lr}}
  function split(n){if(n.depth>=3)return null;let best=null;const parent=K.sum(n.indices.map(i=>grad[i]))**2/(n.indices.length+1),min=isX?1:30;
   for(let f=0;f<X[0].length;f++){
    const sorted=n.indices.slice().sort((i,j)=>X[i][f]-X[j][f]);let left=0,total=K.sum(sorted.map(i=>grad[i]));
    for(let j=0;j<sorted.length-1;j++){left+=grad[sorted[j]];const count=j+1;if(count<min||sorted.length-count<min||X[sorted[j]][f]===X[sorted[j+1]][f])continue;
     const gain=left*left/(count+1)+(total-left)**2/(sorted.length-count+1)-parent;
     if(gain>1e-12&&(!best||gain>best.gain))best={f,gain,threshold:(X[sorted[j]][f]+X[sorted[j+1]][f])/2,left:sorted.slice(0,count),right:sorted.slice(count)};
    }
   }return best;
  }
  const root=node(sample,0),leaves=[root];root.candidate=split(root);
  while(leaves.length<(isX?8:7)){
   const candidates=leaves.filter(n=>n.candidate).sort((a,b)=>b.candidate.gain-a.candidate.gain);if(!candidates.length)break;
   const n=candidates[0],s=n.candidate;n.f=s.f;n.threshold=s.threshold;n.gain=s.gain;importance[s.f]+=s.gain;n.left=node(s.left,n.depth+1);n.right=node(s.right,n.depth+1);n.left.candidate=split(n.left);n.right.candidate=split(n.right);leaves.splice(leaves.indexOf(n),1,n.left,n.right);
  }
  function query(n,x){while(n.left)n=(isX?x[n.f]<n.threshold:x[n.f]<=n.threshold)?n.left:n.right;return n.leaf}
  for(let i=0;i<X.length;i++)pred[i]+=query(root,X[i]);
  function exportNode(n){if(!n.left)return isX?{nodeid:n.id,leaf:n.leaf}:{leaf_value:n.leaf};return isX?{nodeid:n.id,split:'f'+n.f,split_condition:n.threshold,yes:n.left.id,no:n.right.id,children:[exportNode(n.left),exportNode(n.right)]}:{split_feature:n.f,threshold:n.threshold,split_gain:n.gain,left_child:exportNode(n.left),right_child:exportNode(n.right)}}
  trees.push(exportNode(root));const trainLoss=isX?Math.sqrt(K.mean(ids.map(i=>(pred[i]-y[i])**2))):K.mean(ids.map(i=>Math.abs(pred[i]-y[i]))),validation=isX?null:K.mean(y.slice(m.train_end,m.val_end).map((v,j)=>Math.abs(v-pred[j+m.train_end])));loss.push(trainLoss);report(round+1,c.rounds,trainLoss,validation);await wait();
 }
 m.loss=loss;m.importance=importance.map(x=>x/(K.sum(importance)||1));
 if(isX){m.base=base;m.trees=trees;m.prediction=m.test.map(i=>K.xgb(m,X[i]));m.metrics=summary(m.test.map(i=>m.y[i]),m.prediction)}
 else{m.model={tree_info:[{tree_structure:{leaf_value:base}},...trees.map(tree_structure=>({tree_structure}))]};m.prediction=X.slice(m.val_end).map(x=>K.lgb(m,x));m.metrics=summary(m.y.slice(m.val_end),m.prediction)}
 m.training_implementation=isX?'JavaScript regularized second-order depth-3 boosting, squared error, lambda=1, subsample=0.9; not native XGBoost binary':'JavaScript leaf-wise gradient boosting, L1 objective, 7 leaves, depth<=3, min leaf=30; not native LightGBM binary';return m;
}
function windowCNN(m,id){return Array.from({length:9},(_,j)=>m.rows[id+j-4].x.map((v,k)=>((k===3?Math.log10(v):v)-m.mean[k])/m.scale[k]))}
async function neural(key,m,c,extra,report){
 await tf.setBackend('cpu');await tf.ready();const random=K.rng(c.seed),vars={},shapes={};
 for(const [name,old]of Object.entries(m.weights)){const s=shape(old),fan=s.length===3?s[1]*s[2]:s.length===2?s[1]:(shape(m.weights[name.replace(/bias$/,'weight')]).slice(1).reduce((a,b)=>a*b,1)),bound=1/Math.sqrt(fan||1);shapes[name]=s;vars[name]=tf.variable(tf.tensor(Array.from({length:flat(old).length},()=> (2*random()-1)*bound),s));}
 const V=Object.values(vars),optimizer=tf.train.adam(c.lr),dispose=()=>{optimizer.dispose();V.forEach(v=>v.dispose())};
 function conv(x,name,d=1,causal=true,direct=false){const w=vars[name+(direct?'.weight':'.conv.weight')],b=vars[name+(direct?'.bias':'.conv.bias')],B=x.shape[0],T=x.shape[1],I=x.shape[2],O=w.shape[0],k=w.shape[2],left=causal?(k-1)*d:Math.floor((k-1)*d/2),right=(k-1)*d-left,padded=tf.pad(x,[[0,0],[left,right],[0,0]]),parts=[];
  for(let j=0;j<k;j++){const z=padded.slice([0,j*d,0],[B,T,I]).reshape([B*T,I]),wj=w.slice([0,0,j],[O,I,1]).squeeze([2]).transpose();parts.push(tf.matMul(z,wj).reshape([B,T,O]))}return tf.addN(parts).add(b);
 }
 function linear(x,name){return tf.matMul(x,vars[name+'.weight'].transpose()).add(vars[name+'.bias'])}
 function forward(x){if(key==='network'){let z=x;for(const n of [0,2,4]){z=linear(z,'net.'+n);if(n<4)z=tf.tanh(z)}return tf.softplus(z)}
  if(key==='lithology')return linear(tf.relu(conv(tf.relu(conv(x,'c1',1,false)),'c2',1,false)).mean(1),'out').squeeze([1]);
  if(key==='productivity'){let z=x;for(let n=1;n<=3;n++)z=tf.relu(conv(z,'c'+n,2**(n-1)));return linear(z.slice([0,z.shape[1]-1,0],[-1,1,-1]).squeeze([1]),'out').squeeze([1]).add(x.slice([0,x.shape[1]-1,0],[-1,1,1]).reshape([-1]))}
  return conv(tf.relu(conv(tf.tanh(conv(tf.relu(conv(x,'enc1')),'enc2',2)),'dec1',2)),'out',1,true,true);
 }
 let A=[],Y=[],train=[],val=[],batch=128,posWeight=1;
 if(key==='lithology'){A=m.window_ids.map(i=>windowCNN(m,i));Y=m.window_ids.map(i=>m.rows[i].y);for(let j=0;j<A.length;j++){const s=m.rows[m.window_ids[j]].split;if(s==='train')train.push(j);if(s==='val'||s==='validation')val.push(j)}const positive=K.sum(train.map(i=>Y[i]));posWeight=(train.length-positive)/Math.max(1,positive);batch=192}
 if(key==='productivity'){A=m.ids.map(i=>m.q.slice(i-32,i).map(q=>[(Math.log1p(q)-m.mean)/m.scale]));Y=m.ids.map(i=>(Math.log1p(m.q[i])-m.mean)/m.scale);m.ids.forEach((id,i)=>{if(id<m.train_end)train.push(i);else if(id<m.val_end)val.push(i)})}
 if(key==='cleanup'){A=extra.train;train=A.map((_,i)=>i);batch=96}
 if(key==='network'){const dataRandom=K.rng(334);A=Array.from({length:900},()=>[.4+1.3*dataRandom(),.65+.85*dataRandom()]);train=A.map((_,i)=>i);batch=900}
 function loss(x,y,validation=false){const p=forward(x);let z;
  if(key==='lithology'){const w=validation?1:posWeight;z=tf.scalar(1).sub(y).mul(tf.softplus(p)).add(y.mul(w).mul(tf.softplus(p.neg()))).mean();if(!validation)z=z.add(tf.addN(V.map(v=>v.square().sum())).mul(.0005));return z}
  if(key==='cleanup')return p.sub(x).square().mean();
  if(key==='network'){const q=p.slice([0,0],[-1,6]),press=p.slice([0,6],[-1,1]),diam=x.slice([0,1],[-1,1]),mult=tf.concat([tf.ones([x.shape[0],2]),diam,tf.ones([x.shape[0],3])],1),pr=press.sub(tf.tensor1d(m.back)).sub(q.square().mul(tf.tensor1d(m.R)).div(mult.pow(4))),mass=q.sum(1).sub(x.slice([0,0],[-1,1]).reshape([-1]));return pr.square().mean().add(mass.square().mean())}
  return p.sub(y).square().mean();
 }
 const losses=[],validation=[],physicalHistory=[];let best=null,bestloss=Infinity;
 try{
  for(let epoch=0;epoch<c.rounds;epoch++){const order=shuffle(train,random);let total=0;
   for(let start=0;start<order.length;start+=batch){const ids=order.slice(start,start+batch),value=tf.tidy(()=>{const x=tf.tensor(ids.map(i=>A[i])),y=Y.length?tf.tensor1d(ids.map(i=>Y[i])):null;return optimizer.minimize(()=>loss(x,y),true,V).dataSync()[0]});if(!Number.isFinite(value))throw Error('训练出现非有限损失，请降低学习率');total+=value*ids.length;await wait()}
   losses.push(total/train.length);const vl=val.length?tf.tidy(()=>loss(tf.tensor(val.map(i=>A[i])),tf.tensor1d(val.map(i=>Y[i])),true).dataSync()[0]):null;validation.push(vl);
   if(key==='network')physicalHistory.push(tf.tidy(()=>{const x=tf.tensor(A),p=forward(x),q=p.slice([0,0],[-1,6]),press=p.slice([0,6],[-1,1]),mult=tf.concat([tf.ones([A.length,2]),x.slice([0,1],[-1,1]),tf.ones([A.length,3])],1),lp=press.sub(tf.tensor1d(m.back)).sub(q.square().mul(tf.tensor1d(m.R)).div(mult.pow(4))).square().mean().dataSync()[0],lm=q.sum(1).sub(x.slice([0,0],[-1,1]).reshape([-1])).square().mean().dataSync()[0];return [epoch,lp+lm,lp,lm]}));
   if(key==='productivity'&&vl<bestloss){bestloss=vl;best=Object.fromEntries(Object.entries(vars).map(([n,v])=>[n,Array.from(v.dataSync())]))}
   if(key!=='network'||epoch%20===0||epoch===c.rounds-1)report(epoch+1,c.rounds,losses.at(-1),vl);await wait();
  }
  if(best)for(const[n,values]of Object.entries(best))tf.tidy(()=>vars[n].assign(tf.tensor(values,shapes[n])));
  m.weights=Object.fromEntries(Object.entries(vars).map(([n,v])=>[n,v.arraySync()]));m.loss=losses;m.val_loss=validation;
  let exportError=0;for(const id of [0,Math.floor(A.length/2),A.length-1]){const raw=tf.tidy(()=>forward(tf.tensor([A[id]])).arraySync()),got=flat(raw);let expected;
   if(key==='lithology'){got[0]=1/(1+Math.exp(-got[0]));expected=[K.cnn(m,A[id][0].map((_,j)=>A[id].map(row=>row[j])))]}
   else if(key==='productivity'){got[0]=(Math.log1p(Math.max(0,Math.expm1(got[0]*m.scale+m.mean)))-m.mean)/m.scale;const q=K.tcn(m,m.q.slice(m.ids[id]-32,m.ids[id]));expected=[(Math.log1p(q)-m.mean)/m.scale]}
   else if(key==='cleanup'){const out=K.ae(m,A[id][0].map((_,j)=>A[id].map(row=>row[j])));expected=A[id].flatMap((row,t)=>row.map((_,j)=>out[j][t]))}
   else{const p=K.pinn(m,A[id]);expected=[...p.q,p.p]}
   exportError=Math.max(exportError,...got.map((v,j)=>Math.abs(v-expected[j])));
  }m.browser_export_check={samples:3,max_abs_difference:exportError};if(exportError>1e-4)throw Error('导出权重的一致性检查未通过');
  if(key==='lithology'){m.scores=m.window_ids.map(i=>K.cnn(m,windowCNN(m,i).reduce((cols,row)=>row.map((v,j)=>[...(cols[j]||[]),v]),[])));let th=.15,bestF=-1;for(let j=0;j<29;j++){const t=.15+j*.025,b=K.binary(val.map(i=>Y[i]),val.map(i=>m.scores[i]),t);if(b.F1>bestF){bestF=b.F1;th=t}}m.threshold=th;const t=m.window_ids.map((id,i)=>m.rows[id].split==='test'?i:-1).filter(i=>i>=0);m.metrics=classification(t.map(i=>Y[i]),t.map(i=>m.scores[i]),th)}
  if(key==='productivity'){m.prediction=m.test_ids.map(i=>K.tcn(m,m.q.slice(i-32,i)));m.metrics=summary(m.test_ids.map(i=>m.q[i]),m.prediction)}
  if(key==='cleanup'){function rec(A){return A.map(a=>{const x=a[0].map((_,c)=>a.map(row=>row[c]));return {x,r:K.ae(m,x)}})}m.calibration_scores=rec(extra.calibration).map(({x,r})=>K.mean(flat(x).map((v,j)=>(v-flat(r)[j])**2)));m.threshold=K.quantile(m.calibration_scores,.99);extra.test.forEach((A,j)=>{const all=rec(A);m.events[j].score=all.map(({x,r})=>K.mean(flat(x).map((v,i)=>(v-flat(r)[i])**2)));m.events[j].reconstruction=all.map(({r})=>r.map((ch,c)=>ch.at(-1)*m.scale[c]+m.mean[c]))});m.metrics=classification(m.events[0].label,m.events[0].score,m.threshold);m.external_metrics=classification(m.events[1].label,m.events[1].score,m.threshold)}
  if(key==='network'){m.history=physicalHistory;const grid=Array.from({length:200},()=>[.4+1.3*random(),.65+.85*random()]),errors=[],mass=[],pressure=[];for(const x of grid){const p=K.pinn(m,x),ref=K.exactFlow(m,...x);errors.push(...p.q.map((q,i)=>(q-ref.q[i])**2));mass.push(Math.abs(K.sum(p.q)-x[0]));pressure.push(...p.q.map((q,i)=>Math.abs(p.p-m.back[i]-m.R[i]*q*q/(i===2?x[1]**4:1))))}m.metrics={flow_RMSE:Math.sqrt(K.mean(errors)),mass_residual:K.mean(mass),pressure_residual:K.mean(pressure)}}
  return m;
 }finally{dispose()}
}
globalThis.PerfBrowserTraining={async fit(key,m,settings,extra,report=()=>{}){
 const started=performance.now(),c={seed:334,...settings},history=[];if(!Number.isInteger(c.seed)||c.seed<0||c.seed>999999)throw Error('随机种子超出允许范围');
 if(key==='damage'){if(!(c.length>=.1&&c.length<=3&&c.noise>=.001&&c.noise<=.5))throw Error('核参数超出允许范围')}
 else if(!Number.isInteger(c.rounds)||c.rounds<1||c.rounds>(key==='network'?3000:300)||!(c.lr>=.00001&&c.lr<=.3))throw Error('训练轮数或学习率超出允许范围');
 const log=(step,total,loss,validation=null)=>{const item={step,total,loss,validation};history.push(item);report({state:'training',history:history.slice(),elapsed:(performance.now()-started)/1000})};
 if(key==='geometry'||key==='evaluation')m=await boosted(key,m,c,log);
 else if(key==='damage'){Object.assign(m,K.gpFit(m.X,m.y,c.length,c.noise),{noise:c.noise});const p=m.test.map(i=>K.gpQuery(m,m.features.map(f=>m.rows[i][f])));m.prediction=p.map(x=>x.mean);m.std=p.map(x=>x.std);m.metrics=summary(m.test.map(i=>m.rows[i].skin),m.prediction);m.coverage=K.mean(m.test.map((id,i)=>Math.abs(m.rows[id].skin-m.prediction[i])<=1.96*m.std[i]?1:0));log(1,1,null)}
 else m=await neural(key,m,c,extra,log);
 const elapsed=(performance.now()-started)/1000;m.seed=c.seed;m.training={settings:c,history,mode:'browser-worker-fresh-fit',implementation:m.training_implementation||'TensorFlow.js CPU / Adam; fixed-kernel Cholesky for GPR',job:'browser-'+Date.now(),elapsed_seconds:elapsed};return m;
}};
})();
