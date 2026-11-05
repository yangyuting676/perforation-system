/* Pure front-end storage and resource mounting for portable case ZIPs. */
(async function () {
  'use strict';
  const base = new URL('../../', document.currentScript.src);
  const db = await new Promise((resolve, reject) => {
    const r = indexedDB.open('atlas-portable-cases-v1', 1);
    r.onupgradeneeded = () => { r.result.createObjectStore('records'); r.result.createObjectStore('assets'); };
    r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error);
  });
  const transact = (store, mode, action) => new Promise((resolve, reject) => {
    const tx = db.transaction(store, mode); const r = action(tx.objectStore(store));
    tx.oncomplete = () => resolve(r && r.result); tx.onerror = () => reject(tx.error); tx.onabort = () => reject(tx.error);
  });
  let records = await transact('records', 'readonly', s => s.get('all'));
  if (!records) {
    try { records = JSON.parse(localStorage.getItem('atlas.casepack.v2') || '[]'); } catch { records = []; }
    if (!Array.isArray(records)) records = [];
    await transact('records', 'readwrite', s => s.put(records, 'all'));
  }
  let pending = Promise.resolve();
  const prefix = id => new URL('__casepacks/' + encodeURIComponent(id) + '/', base).href;
  const patch = (pkg, id) => JSON.parse(JSON.stringify(pkg).replaceAll('casepack://', prefix(id)));
  window.PortableCases = {
    records,
    write(list) {
      const removed=this.records.filter(r=>!list.some(n=>n.meta.id===r.meta.id)).map(r=>r.meta.id);
      this.records = list;
      pending = pending.then(() => transact('records', 'readwrite', s => s.put(list, 'all'))).then(async()=>{
        for(const id of removed)await new Promise((resolve,reject)=>{const tx=db.transaction('assets','readwrite');const r=tx.objectStore('assets').openCursor(IDBKeyRange.bound(id+':',id+':\uffff'));r.onsuccess=()=>{const c=r.result;if(c){c.delete();c.continue()}};tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)});
      });
      return true;
    },
    async flush() { await pending; },
    async store(rec) {
      if (!rec.pkg.portable) return rec;
      await new Promise((resolve, reject) => {
        const tx = db.transaction('assets', 'readwrite'), s = tx.objectStore('assets');
        for (const f of rec.files) {
          let bytes;
          if (f.enc === 'dataurl') { const raw = atob(f.data.split(',')[1]); bytes = Uint8Array.from(raw, c => c.charCodeAt(0)); }
          else bytes = new TextEncoder().encode(f.data);
          s.put({ bytes, mime: f.mime, name: f.name }, rec.meta.id + ':' + f.name);
        }
        tx.oncomplete = resolve; tx.onerror = () => reject(tx.error); tx.onabort = () => reject(tx.error);
      });
      return { ...rec, pkg: patch(rec.pkg, rec.meta.id), files: [], portable: true };
    }
  };
  if (!('serviceWorker' in navigator)) throw Error('完整案例资源需要使用 localhost 或 HTTPS 打开模板');
  await navigator.serviceWorker.register(new URL('casepacks-sw.js', base), { scope: base.pathname });
  await navigator.serviceWorker.ready;
  if (!navigator.serviceWorker.controller) await new Promise(resolve => navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true }));
  window.addEventListener('message', e => {
    if (!e.data || e.data.__portableHeight !== true) return;
    for (const f of document.querySelectorAll('iframe')) if (f.contentWindow === e.source) f.style.height = Math.min(60000, Math.max(300, Number(e.data.height) || 300)) + 'px';
  });
  window.PortableCasesReady = true;
  document.dispatchEvent(new Event('portable-cases-ready'));
})().catch(e => {
  document.getElementById('view').textContent = '案例资源初始化失败：' + e.message;
  console.error(e);
});
