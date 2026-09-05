/* SRS · Leitner 五盒间隔复习 + 抽样权重 */
window.SRS = (function () {
  'use strict';

  const BOX_MAX = 5;
  // 结果盒 1..5 对应的下次复习间隔（分钟）
  const INTERVALS_MIN = [10, 240, 1440, 4320, 10080, 20160];
  const WRONG_AGAIN_MIN = 2;

  function fresh(now) {
    return { b: 0, due: now + WRONG_AGAIN_MIN * 60000, ok: 0, ng: 0, bad: 0, last: now };
  }

  function update(rec, ok, now) {
    const r = rec || fresh(now);
    r.last = now;
    if (ok) {
      r.ok++; r.bad = 0;
      r.b = Math.min(BOX_MAX, r.b + 1);
      r.due = now + INTERVALS_MIN[r.b] * 60000;
    } else {
      r.ng++; r.bad = (r.bad || 0) + 1;
      r.b = Math.max(0, r.b - 1);
      r.due = now + WRONG_AGAIN_MIN * 60000;
    }
    return r;
  }

  function stars(box) {
    if (box >= BOX_MAX) return 3;
    if (box >= 4) return 2;
    if (box >= 2) return 1;
    return 0;
  }

  function isDue(rec, now) { return !!rec && rec.due != null && rec.due <= now; }

  function weight(entry, rec, now) {
    if (!rec) return 3;                 // 新字优先
    let w = [3, 2.4, 1.8, 1.3, 1.1, 0.6][rec.b] || 1;
    if (isDue(rec, now)) w *= 1.5;      // 到期优先
    if ((rec.bad || 0) >= 2) w *= 1.3;  // 连错加倍关注
    return w;
  }

  return { BOX_MAX, INTERVALS_MIN, fresh, update, stars, isDue, weight };
})();
