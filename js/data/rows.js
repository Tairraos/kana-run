/* 五十音物語 · 行 / 章节 / 冒险关卡定义 */
window.ROWS = (function () {
  'use strict';
  const K = window.KANA;

  const BASE_ROWS = ['a', 'ka', 'sa', 'ta', 'na', 'ha', 'ma', 'ya', 'ra', 'wa'];

  function rowKana(script, row) {
    return K.group(script, 'base').concat(K.group(script, 'daku'), K.group(script, 'you'))
      .filter(x => x.row === row);
  }
  function rowLabel(script, row) {
    const x = rowKana(script, row)[0];
    return x ? x.k + '行' : row;
  }

  const CHAPTERS = [
    {
      id: 'hira', name: '平假名篇', sub: '弯弯的曲线，是最温柔的入门', script: 'hira',
      stages: BASE_ROWS.map((row, i) => ({ id: 'h' + (i + 1), rows: [row] }))
    },
    {
      id: 'kata', name: '片假名篇', sub: '笔直的线条，同样的读音', script: 'kata',
      stages: BASE_ROWS.map((row, i) => ({ id: 'k' + (i + 1), rows: [row] }))
    },
    {
      id: 'daku', name: '浊音篇', sub: '加两点，声音就变了个样', script: 'hira',
      stages: [
        { id: 'd1', rows: ['ga', 'za'] },
        { id: 'd2', rows: ['da'] },
        { id: 'd3', rows: ['ba', 'pa'] },
        { id: 'd4', script: 'kata', rows: ['ga', 'za', 'da'] },
        { id: 'd5', script: 'kata', rows: ['ba', 'pa'] }
      ]
    },
    {
      id: 'you', name: '拗音篇', sub: '小假名的大魔法', script: 'hira',
      stages: [
        { id: 'y1', rows: ['kya', 'sya', 'tya'] },
        { id: 'y2', rows: ['nya', 'hya', 'mya', 'rya'] },
        { id: 'y3', rows: ['gya', 'zya', 'bya', 'pya'] },
        { id: 'y4', script: 'kata', rows: ['kya', 'sya', 'tya'] },
        { id: 'y5', script: 'kata', rows: ['nya', 'hya', 'mya', 'rya'] },
        { id: 'y6', script: 'kata', rows: ['gya', 'zya', 'bya', 'pya'] }
      ]
    }
  ];

  // 展开成完整关卡定义
  const STAGES = [];
  CHAPTERS.forEach(ch => {
    ch.stages.forEach(st => {
      const script = st.script || ch.script;
      const kana = [];
      st.rows.forEach(row => { rowKana(script, row).forEach(x => kana.push(x)); });
      STAGES.push(Object.assign({}, st, {
        ch: ch.id,
        script,
        name: st.rows.map(r => rowLabel(script, r)).join(' · '),
        kana,
        q: kana.length > 8 ? 10 : 8
      }));
    });
  });

  const byId = {};
  STAGES.forEach(s => { byId[s.id] = s; });

  const UNLOCK_RATIO = 0.7; // 前一篇 ≥70% 关卡通过，解锁下一篇

  return { CHAPTERS, STAGES, byId, UNLOCK_RATIO, rowKana, rowLabel, BASE_ROWS };
})();
