/* 通用工具 */
window.U = (function () {
  'use strict';

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  function el(html) {
    const t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }

  const rand = n => Math.floor(Math.random() * n);
  const randItem = arr => arr[rand(arr.length)];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = rand(i + 1);
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function sampleN(arr, n) { return shuffle(arr).slice(0, n); }

  function weightedPick(items) {
    // items: [{w, ...}]
    let total = 0;
    items.forEach(it => { total += Math.max(0, it.w); });
    if (total <= 0) return randItem(items);
    let r = Math.random() * total;
    for (const it of items) {
      r -= Math.max(0, it.w);
      if (r <= 0) return it;
    }
    return items[items.length - 1];
  }

  function todayKey(d) {
    const t = d || new Date();
    const p = n => String(n).padStart(2, '0');
    return t.getFullYear() + '-' + p(t.getMonth() + 1) + '-' + p(t.getDate());
  }
  function dateKeyOffset(offset) {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return todayKey(d);
  }

  function fmtTime(sec) {
    const s = Math.max(0, Math.round(sec));
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  }

  let saveTimer = null;
  function debounce(fn, ms) {
    let t = null;
    return function () {
      const args = arguments, self = this;
      clearTimeout(t);
      t = setTimeout(() => fn.apply(self, args), ms);
    };
  }

  const REDUCED = window.matchMedia
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return { $, $$, el, rand, randItem, clamp, shuffle, sampleN, weightedPick, todayKey, dateKeyOffset, fmtTime, debounce, REDUCED };
})();
