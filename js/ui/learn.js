/* 五十音图鉴：全表浏览 + 假名详情（助记/字源/朗读/掌握度） */
window.LearnScreen = (function () {
  'use strict';
  const U = window.U, K = window.KANA, STORE = window.STORE, UI = window.UI, SFX = window.SFX, SRS = window.SRS;

  const TABS = [
    { id: 'hira', name: '平假名', get: () => K.group('hira', 'base') },
    { id: 'kata', name: '片假名', get: () => K.group('kata', 'base') },
    { id: 'daku', name: '浊音·半浊音', get: () => K.group('hira', 'daku').concat(K.group('kata', 'daku')) },
    { id: 'you', name: '拗音', get: () => K.group('hira', 'you').concat(K.group('kata', 'you')) }
  ];
  let tab = 0;

  function mount(root) {
    if (tab >= TABS.length) tab = 0;
    const t = TABS[tab];
    const list = t.get();

    root.innerHTML = `
      <div class="screen-head">
        <h1 class="screen-title">五十音图鉴</h1>
        <p class="screen-sub">点亮一张脸，就永远认识一张脸</p>
      </div>
      <div class="ch-tabs" id="ln-tabs"></div>
      <div class="kana-grid" id="ln-grid"></div>
    `;

    const tabs = document.getElementById('ln-tabs');
    TABS.forEach((x, i) => {
      const b = U.el(`<button class="ch-tab ${i === tab ? 'on' : ''}"><span>${x.name}</span></button>`);
      b.addEventListener('click', () => { tab = i; SFX.click(); mount(root); });
      tabs.appendChild(b);
    });

    const grid = document.getElementById('ln-grid');
    list.forEach(x => {
      const rec = STORE.state.srs[K.key(x.s, x.k)];
      const stars = rec ? SRS.stars(rec.b) : -1;
      const card = U.el(`
        <button class="kana-card ${stars < 0 ? 'new' : ''}" data-k="${x.k}">
          <span class="kana-card-char">${x.k}</span>
          <span class="kana-card-romaji">${x.r}</span>
          <span class="kana-card-stars">${stars < 0 ? '新' : '★'.repeat(stars) || '·'}</span>
        </button>`);
      card.addEventListener('click', () => openDetail(t.get(), x));
      grid.appendChild(card);
    });
  }

  function openDetail(list, x) {
    SFX.speak(x.k);
    let idx = list.indexOf(x);
    const body = U.el(`<div class="kdetail"></div>`);
    const m = UI.modal({ title: '假名详情', body, onClose: null });

    function render() {
      const cur = list[idx];
      const rec = STORE.state.srs[K.key(cur.s, cur.k)];
      const stars = rec ? SRS.stars(rec.b) : -1;
      body.innerHTML = `
        <div class="kdetail-head">
          <button class="knav" id="kd-prev" aria-label="上一个">‹</button>
          <div class="kdetail-kana-wrap">
            <span class="kdetail-kana">${cur.k}</span>
            ${UI.speakerBtn(cur.k)}
          </div>
          <button class="knav" id="kd-next" aria-label="下一个">›</button>
        </div>
        <div class="kdetail-romaji">${cur.r} <span class="kdetail-script">${cur.s === 'hira' ? '平假名' : '片假名'} · ${cur.kind || '清音'} · ${cur.row}行</span></div>
        ${cur.o ? `<div class="kdetail-origin">字源「${cur.o}」</div>` : ''}
        <p class="kdetail-memo">${cur.m}</p>
        <div class="kdetail-meta">
          掌握度：${stars < 0 ? '<b>尚未遇见</b>（去冒险关卡遇见它）' : `${UI.starRow(stars)} ${['', '脸熟了', '记得挺牢', '刻进记忆'][stars]}`}
        </div>
        <div class="kdetail-sim ${(cur.sim || []).length ? '' : 'hide'}">
          形近易混：<span>${(cur.sim || []).join('　')}</span>
        </div>
      `;
      body.querySelector('#kd-prev').addEventListener('click', () => { idx = (idx - 1 + list.length) % list.length; render(); });
      body.querySelector('#kd-next').addEventListener('click', () => { idx = (idx + 1) % list.length; render(); });
    }
    render();
  }

  UI.register('learn', { mount });
  return {};
})();
