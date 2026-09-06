/* 设置：声音 / 主题 / 自由解锁 / 重置 */
window.Settings = (function () {
  'use strict';
  const U = window.U, STORE = window.STORE, UI = window.UI, FX = window.FX, SFX = window.SFX;

  function open() {
    const s = STORE.state.settings;
    const body = U.el(`<div class="settings"></div>`);

    function toggleRow(key, label, desc) {
      return `
        <label class="set-row">
          <span><b>${label}</b><small>${desc}</small></span>
          <input type="checkbox" data-set="${key}" ${s[key] ? 'checked' : ''}>
          <i class="set-switch"></i>
        </label>`;
    }

    body.innerHTML = `
      <h4 class="set-h">声音</h4>
      ${toggleRow('sfx', '音效', '合成音效：答对、连击、烟花……')}
      ${toggleRow('voice', '假名朗读', '用日语语音朗读假名（需要系统语音）')}
      ${toggleRow('bgm', '背景音乐', '轻轻淡淡的五声音阶，像远处的风')}
      <div class="set-note" id="voice-note"></div>

      <h4 class="set-h">主题</h4>
      <div class="theme-list" id="theme-list"></div>

      <h4 class="set-h">存档</h4>
      <div class="set-note" id="save-note"></div>
      <textarea class="save-code" id="save-code" rows="3" placeholder="存档码会显示在这里；导入时把它粘贴到这里"></textarea>
      <div class="modal-actions" style="margin-top:8px">
        <button class="btn btn-ghost" id="save-export">导出存档码</button>
        <button class="btn" id="save-import">导入并覆盖</button>
      </div>

      <h4 class="set-h">其他</h4>
      ${toggleRow('freeUnlock', '自由解锁', '全部章节与主题直接开放（适合体验）')}

      <div class="set-danger">
        <button class="btn btn-ghost btn-danger" id="set-reset">重置全部进度</button>
      </div>
      <p class="set-credit">五十音物語 · KANA MONOGATARI —— 纯前端离线小游戏，进度保存在本机浏览器。</p>
    `;

    const m = UI.modal({ title: '设置', body, onClose: null });

    // 语音诊断
    body.querySelector('#voice-note').textContent = window.SFX.hasJapaneseVoice()
      ? '🎤 日语语音：已就绪，点 🔊 即可听到朗读'
      : '🔇 未检测到日语语音：朗读暂不可用，但读音（罗马音）仍会显示';

    // 存档状态
    body.querySelector('#save-note').textContent = STORE.storageOk
      ? '✓ 进度自动保存在本浏览器。注意：用「双击文件」和「本地服务」打开是两个独立存档位，换方式打开时用存档码搬运进度。'
      : '⚠️ 当前环境无法保存进度（常见于隐私窗口）。建议换正常窗口，或用下面的存档码备份。';

    body.querySelector('#save-export').addEventListener('click', () => {
      const code = STORE.exportCode();
      if (!code) { UI.toast('导出失败', '⚠️'); return; }
      const ta = body.querySelector('#save-code');
      ta.value = code;
      ta.focus(); ta.select();
      const done = () => UI.toast('存档码已复制，粘贴收好或发给另一台设备', '📦');
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code).then(done, () => document.execCommand && document.execCommand('copy'));
      } else if (document.execCommand) {
        document.execCommand('copy');
      }
    });
    body.querySelector('#save-import').addEventListener('click', () => {
      const code = body.querySelector('#save-code').value;
      if (STORE.importCode(code)) {
        UI.toast('存档导入成功，马上刷新', '✅');
        setTimeout(() => location.reload(), 900);
      } else {
        UI.toast('存档码无效，请检查是否完整', '⚠️');
      }
    });

    body.querySelectorAll('[data-set]').forEach(inp => {
      inp.addEventListener('change', () => {
        const key = inp.dataset.set;
        STORE.setSetting(key, inp.checked);
        if (key === 'bgm') { inp.checked ? SFX.startBgm() : SFX.stopBgm(); }
        if (key === 'freeUnlock') UI.toast(inp.checked ? '自由解锁已开启' : '自由解锁已关闭', '🗝');
      });
    });

    const tl = body.querySelector('#theme-list');
    STORE.THEMES.forEach(t => {
      const unlocked = STORE.themeUnlocked(t);
      const active = s.theme === t.id;
      const b = U.el(`
        <button class="theme-opt theme-${t.id} ${active ? 'on' : ''} ${unlocked ? '' : 'locked'}" ${unlocked ? '' : 'disabled'}>
          <span class="theme-swatch"></span>
          <span>${t.name}</span>
          <small>${unlocked ? (active ? '使用中' : '点击使用') : `Lv.${t.lv} 解锁`}</small>
        </button>`);
      if (unlocked) {
        b.addEventListener('click', () => {
          STORE.setSetting('theme', t.id);
          window.applyTheme(t.id);
          SFX.click();
          m.close();
          setTimeout(open, 60);
        });
      }
      tl.appendChild(b);
    });

    body.querySelector('#set-reset').addEventListener('click', () => {
      if (body.querySelector('#set-reset').dataset.armed) {
        STORE.reset();
        window.applyTheme('neon');
        m.close();
        UI.show('home');
        UI.toast('旅程重新开始了', '🌅');
      } else {
        const btn = body.querySelector('#set-reset');
        btn.dataset.armed = '1';
        btn.textContent = '再点一次，确认清空一切';
        UI.toast('这将删除全部进度，请慎重', '⚠️');
      }
    });
  }

  return { open };
})();
