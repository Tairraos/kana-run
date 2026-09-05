/* 五十音物語 · 成就（判子印章）定义
 * check(s) 接收统计快照，见 store.js 的 snapshotStats()
 */
window.ACHV = (function () {
  'use strict';
  const LIST = [
    { id: 'first_correct',  icon: '🌱', name: '初阵',       desc: '答对第一题' },
    { id: 'first_stage',    icon: '🚩', name: '启程',       desc: '通过第一个冒险关卡' },
    { id: 'perfect_stage',  icon: '💎', name: '完美主义',   desc: '一关零失误拿下 3★' },
    { id: 'combo10',        icon: '🔥', name: '连击·十连',  desc: '达成 10 连击' },
    { id: 'combo20',        icon: '⚡', name: '连击·鬼神',  desc: '达成 20 连击' },
    { id: 'swift30',        icon: '🌪', name: '速记员',     desc: '极速挑战 60 秒答对 30 题' },
    { id: 'swift_master',   icon: '🎯', name: '心眼',       desc: '极速挑战单局得分 ≥ 600' },
    { id: 'match_perfect',  icon: '👁', name: '好眼力',     desc: '配对消除 8 对 ≤ 12 步通关' },
    { id: 'night_owl',      icon: '🌙', name: '夜行侠',     desc: '在凌晨 0 点至 5 点之间游玩' },
    { id: 'streak7',        icon: '🌸', name: '七日不辍',   desc: '连续 7 天完成每日目标' },
    { id: 'streak30',       icon: '🏆', name: '月下练习生', desc: '连续 30 天完成每日目标' },
    { id: 'hira_all',       icon: '🏷', name: '收藏家·平',  desc: '遇见全部 46 个平假名' },
    { id: 'kata_all',       icon: '🔖', name: '收藏家·片',  desc: '遇见全部 46 个片假名' },
    { id: 'hira_master',    icon: '🖌', name: '平假名大师', desc: '全部平假名达到 3★' },
    { id: 'kata_master',    icon: '👑', name: '片假名大师', desc: '全部片假名达到 3★' },
    { id: 'q500',           icon: '🐎', name: '荒马',       desc: '累计作答 500 题' },
    { id: 'lvl5',           icon: '🎆', name: '花火大会',   desc: '达到 5 级' },
    { id: 'lvl10',         icon: '⛩',  name: '传说伊始',   desc: '达到 10 级' }
  ];
  const byId = {};
  LIST.forEach(a => { byId[a.id] = a; });
  return { LIST, byId };
})();
