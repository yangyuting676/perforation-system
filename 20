'use strict';
const MIME={html:'text/html; charset=utf-8',js:'application/javascript; charset=utf-8',css:'text/css; charset=utf-8',json:'application/json; charset=utf-8',svg:'image/svg+xml',png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',webp:'image/webp',pdf:'application/pdf',woff:'font/woff',woff2:'font/woff2',ttf:'font/ttf',txt:'text/plain; charset=utf-8'};
self.addEventListener('install',e=>e.waitUntil(self.skipWaiting()));
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
let opened;
function db(){return opened||(opened=new Promise((resolve,reject)=>{const r=indexedDB.open('atlas-portable-cases-v1',1);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)}));}
const bridge=`<script>(function(){let last=0;function report(){const h=Math.max(document.body?.scrollHeight||0,document.documentElement.scrollHeight);if(Math.abs(h-last)>2){last=h;parent.postMessage({__portableHeight:true,height:h},'*')}}addEventListener('message',e=>{if(e.data?.__portableHeight===true){for(const f of document.querySelectorAll('iframe'))if(f.contentWindow===e.source){f.style.height=Math.min(60000,Math.max(300,Number(e.data.height)||300))+'px';report()}}});addEventListener('load',()=>{new ResizeObserver(report).observe(document.body);report()});})();</script>`;
self.addEventListener('fetch',e=>{
  const url=new URL(e.request.url),scope=new URL(self.registration.scope),marker=scope.pathname+'__casepacks/';
  if(url.origin!==scope.origin)return;
  e.respondWith((async()=>{
    let route=url.pathname;
    if(!route.startsWith(marker)&&e.clientId){const client=await self.clients.get(e.clientId);if(client){const c=new URL(client.url);if(c.pathname.startsWith(marker)){const id=c.pathname.slice(marker.length).split('/')[0];if(route.startsWith(scope.pathname+'assets/'))route=marker+id+'/'+route.slice(scope.pathname.length);else if(route.startsWith('/assets/'))route=marker+id+'/'+route.slice(1);}}}
    if(!route.startsWith(marker))return fetch(e.request);
    const parts=route.slice(marker.length).split('/'),id=decodeURIComponent(parts.shift()),name=decodeURIComponent(parts.join('/'));
    if(name.split('/').some(p=>p==='..'))return new Response('Invalid path',{status:400});
    const d=await db();const f=await new Promise((resolve,reject)=>{const r=d.transaction('assets').objectStore('assets').get(id+':'+name);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});
    if(!f)return new Response('Missing packaged resource: '+name,{status:404,headers:{'Content-Type':'text/plain; charset=utf-8'}});
    let body=f.bytes;const ext=name.split('.').pop().toLowerCase();
    if(['html','js','css'].includes(ext)){
      let text=new TextDecoder().decode(body);
      text=text.replace(/(["'`(])\/(assets\/)/g,(_,q,p)=>q+marker+encodeURIComponent(id)+'/'+p);
      if(ext==='html')text=text.replace(/<head[^>]*>/i,m=>m+bridge);
      body=text;
    }
    return new Response(body,{headers:{'Content-Type':MIME[ext]||f.mime||'application/octet-stream','Cache-Control':'no-store','Access-Control-Allow-Origin':'*'}});
  })());
});
