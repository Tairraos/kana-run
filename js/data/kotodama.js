/* 五十音物語 · 言灵收集卡（花瓣扭蛋奖品）
 * rarity: c 常见 / r 稀有 / e 史诗（抽取权重 60 / 30 / 10）
 */
window.KOTODAMA = (function () {
  'use strict';
  const LIST = [
    { w: 'はる',     zh: '春',   rarity: 'c', flavor: '万物起始的季节' },
    { w: 'さくら',   zh: '樱',   rarity: 'c', flavor: '五日风里一瞬的满开' },
    { w: 'ねこ',     zh: '猫',   rarity: 'c', flavor: '枕着阳光打盹的哲学家' },
    { w: 'とり',     zh: '鸟',   rarity: 'c', flavor: '把清晨叼来的信使' },
    { w: 'かぜ',     zh: '风',   rarity: 'c', flavor: '看不见，却推着云走' },
    { w: 'はな',     zh: '花',   rarity: 'c', flavor: '开在记忆里的颜色' },
    { w: 'うみ',     zh: '海',   rarity: 'c', flavor: '所有溪流的目的地' },
    { w: 'そら',     zh: '空',   rarity: 'c', flavor: '比任何屏幕都大的画布' },
    { w: 'つき',     zh: '月',   rarity: 'c', flavor: '夜空抛下的银币' },
    { w: 'ほし',     zh: '星',   rarity: 'c', flavor: '遥远的光，落进许愿里' },
    { w: 'とき',     zh: '时',   rarity: 'c', flavor: '不停往前走的旅人' },
    { w: 'なつ',     zh: '夏',   rarity: 'c', flavor: '蝉鸣、汽水与花火' },
    { w: 'あき',     zh: '秋',   rarity: 'r', flavor: '红叶落进书页的那天' },
    { w: 'ふゆ',     zh: '冬',   rarity: 'r', flavor: '呵出白气，握紧暖手' },
    { w: 'ゆき',     zh: '雪',   rarity: 'r', flavor: '把整个世界调成静音' },
    { w: 'ゆめ',     zh: '梦',   rarity: 'r', flavor: '夜里上映的私人电影' },
    { w: 'こころ',   zh: '心',   rarity: 'r', flavor: '装着四季的小房间' },
    { w: 'ちから',   zh: '力量', rarity: 'r', flavor: '从明天借一点给今天用' },
    { w: 'きぼう',   zh: '希望', rarity: 'r', flavor: '藏在口袋里的星星' },
    { w: 'なかま',   zh: '伙伴', rarity: 'r', flavor: '一个人快，一群人远' },
    { w: 'よろこび', zh: '喜悦', rarity: 'r', flavor: '答对那一刻的心情' },
    { w: 'ひかり',   zh: '光',   rarity: 'e', flavor: '穿过指缝也要抓住的东西' },
    { w: 'いのち',   zh: '生命', rarity: 'e', flavor: '一场盛大的燃烧' },
    { w: 'ぼうけん', zh: '冒险', rarity: 'e', flavor: '把未知走成风景' }
  ];
  const WEIGHT = { c: 60, r: 30, e: 10 };
  const byWord = {};
  LIST.forEach(x => { byWord[x.w] = x; });
  return { LIST, WEIGHT, byWord };
})();
