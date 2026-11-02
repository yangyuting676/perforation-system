self.window=self;
importScripts('evidence-kernels.js','evidence-core.js');
let model=null;
self.onmessage=e=>{const d=e.data;try{if(d.model)model=d.model;if(!model)throw Error('模型尚未载入');const result=PerfEvidenceCore.compute(d.key,model,d.values,d.state,d.options);self.postMessage({id:d.id,result})}catch(error){self.postMessage({id:d.id,error:error.message})}};
