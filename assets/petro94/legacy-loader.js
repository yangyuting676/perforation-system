(function(){
 const bridge=window.PerfAdvancedBridge;if(!bridge)return;
 const host=document.querySelector('#ai-app');const button=document.createElement('button');button.textContent='展开算法内部可视化';button.className='advanced-launch';button.style.cssText='margin:16px 0;padding:10px 17px;background:#176b7a;color:white;border:0;border-radius:8px';host.append(button);
 parent.postMessage({type:'perf-ai-height',case:bridge.case.id,height:Math.ceil(host.getBoundingClientRect().height)},location.origin==='null'?'*':location.origin);
 let loaded=false;button.onclick=function(){const existing=host.querySelector('.petro-advanced');if(existing){existing.hidden=!existing.hidden;button.textContent=existing.hidden?'展开算法内部可视化':'收起算法内部可视化';if(!existing.hidden)window.dispatchEvent(new Event('petro-advanced-open'));parent.postMessage({type:'perf-ai-height',case:bridge.case.id,height:Math.ceil(host.getBoundingClientRect().height)},location.origin==='null'?'*':location.origin);return;}
 const panel=document.createElement('section');panel.className='petro-advanced';panel.innerHTML='<h2>算法内部与计算依据</h2><p>按当前实际模型展示结构、状态与专属计算过程；原模型、原输入与原结果保持。</p><div class="view-menu"></div><p class="advanced-status" role="status">正在载入本地可视化库…</p><div class="plot"></div>';host.append(panel);button.textContent='收起算法内部可视化';
 const link=document.createElement('link');link.rel='stylesheet';link.href='../petro94/legacy.css';document.head.append(link);
 if(!loaded){loaded=true;const script=document.createElement('script');script.src='../petro94/legacy.js?v=cnmath-20261104';script.onerror=()=>{panel.querySelector('.advanced-status').textContent='本地可视化库加载失败，请刷新重试。';loaded=false;};document.body.append(script);}
 parent.postMessage({type:'perf-ai-height',case:bridge.case.id,height:Math.ceil(host.getBoundingClientRect().height)},location.origin==='null'?'*':location.origin);
 };
})();
