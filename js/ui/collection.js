/* 收藏室：概况 + 言灵图鉴（花瓣扭蛋）+ 成就判子墙 */
window.CollectionScreen = (function () {
  'use strict';
  const U = window.U, STORE = window.STORE, UI = window.UI, FX = window.FX, SFX = window.SFX;
  const KT = window.KOTODAMA, A = window.ACHV;

  const RARITY = { c: { name: '常见', cls: 'r-c' }, r: { name: '稀有', cls: 'r-r' }, e: { name: '史诗', cls: 'r-e' } };

  function mount(root) {
    const st = STORE.state;
    const p = STORE.levelProgress();

    root.innerHTML = `
      <div class="screen-head">
        <h1 class="screen-title">收藏室</h1>
        <p class="screen-sub">一路拾起的，都是证据</p>
      </div>

      <section class="col-sec">
        <h2>旅人手账</h2>
        <div class="stat-grid">
          <div class="stat-cell"><b>Lv.${p.level}</b><span>${p.title}</span></div>
          <div class="stat-cell"><b>${st.totals.answered}</b><span>累计作答</span></div>
          <div class="stat-cell"><b>${Math.round(st.totals.answered ? st.totals.correct / st.totals.answered * 100 : 0)}%</b><span>总正确率</span></div>
          <div class="stat-cell"><b>${st.totals.maxCombo}</b><span>最高连击</span></div>
          <div class="stat-cell"><b>🔥${st.streak.count}</b><span>连击天数</span></div>
          <div class="stat-cell"><b>${st.totals.playDays}</b><span>到访天数</span></div>
          <div class="stat-cell"><b>🌸${st.petals}</b><span>花瓣</span></div>
          <div class="stat-cell"><b>${st.swift.best}</b><span>极速最高分</span></div>
        </div>
      </section>

      <section class="col-sec">
        <div class="col-sec-head">
          <h2>言灵图鉴 <small>${STORE.kotodamaCount()}/${KT.LIST.length}</small></h2>
          <button class="btn btn-primary gacha-btn" id="btn-gacha" ${st.petals < STORE.GACHA_COST ? 'disabled' : ''}>
            🌸 花瓣祈愿 · ${STORE.GACHA_COST}/抽
          </button>
        </div>
        <p class="col-tip">用答对攒下的花瓣抽取言灵卡；重复的言灵会化作 6 枚花瓣回到你手里。</p>
        <div class="kt-grid" id="kt-grid"></div>
      </section>

      <section class="col-sec">
        <h2>成就判子 <small>${Object.keys(st.achv).length}/${A.LIST.length}</small></h2>
        <div class="achv-grid" id="achv-grid"></div>
      </section>
    `;

    // 言灵格
    const ktg = document.getElementById('kt-grid');
    KT.LIST.forEach(x => {
      const owned = st.kotodama[x.w];
      const r = RARITY[x.rarity];
      ktg.appendChild(U.el(`
        <div class="kt-card ${owned ? r.cls : 'unknown'} ${owned && owned > 1 ? 'dupe' : ''}">
          <span class="kt-word">${owned ? x.w : '？'}</span>
          <span class="kt-zh">${owned ? x.zh : '未抽到'}</span>
          <span class="kt-rarity">${owned ? r.name + (owned > 1 ? ` ×${owned}` : '') : '···'}</span>
          <span class="kt-flavor">${owned ? x.flavor : ''}</span>
        </div>`));
    });

    // 成就墙
    const ag = document.getElementById('achv-grid');
    A.LIST.forEach(a => {
      const got = !!st.achv[a.id];
      ag.appendChild(U.el(`
        <div class="achv-cell ${got ? 'got' : ''}">
          <span class="achv-stamp">${got ? a.icon : '印'}</span>
          <b>${a.name}</b>
          <small>${a.desc}</small>
        </div>`));
    });

    document.getElementById('btn-gacha').addEventListener('click', () => doGacha(root));
  }

  function doGacha(root) {
    const res = STORE.pull();
    if (!res) { UI.toast('花瓣不够啦，去答题赚花瓣吧', '🌸'); return; }
    SFX.gacha();
    const x = res.item;
    const r = RARITY[x.rarity];
    const body = U.el(`
      <div class="gacha">
        <div class="gacha-card ${r.cls} pop-in">
          <span class="gacha-rarity">${r.name} · 言灵</span>
          <span class="gacha-word">${x.w}</span>
          <span class="gacha-zh">「${x.zh}」</span>
          <span class="gacha-flavor">${x.flavor}</span>
        </div>
        <p class="col-tip">${res.dup ? `是熟悉的言灵，化作 🌸×${res.refund} 回到你手里` : '新的言灵加入了图鉴！'}</p>
        <div class="modal-actions"><button class="btn btn-primary" id="g-ok">收下</button></div>
      </div>`);
    const m = UI.modal({ title: '言灵祈愿', body, onClose: null });
    body.querySelector('#g-ok').addEventListener('click', () => { m.close(); mount(root); });
    if (x.rarity === 'e') { FX.fireworksShow(5); SFX.fanfare(); }
    UI.syncTopbar();
  }

  UI.register('collection', { mount });
  return {};
})();
