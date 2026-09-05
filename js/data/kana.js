/* 五十音物語 · 假名数据（唯一事实来源）
 * 字段：k=假名 r=罗马音 row=行 m=中文助记 o=字源 sim=形近假名
 * 分组：HIRA/KATA 清音各46；DAKU 浊音·半浊音各25；YOU 拗音各33
 */
window.KANA = (function () {
  'use strict';

  const HIRA = [
    { k:'あ', r:'a',   row:'a',  o:'安', m:'「安」的草书，摘掉宝盖头——安心地「啊」' },
    { k:'い', r:'i',   row:'a',  o:'以', m:'「以」的偏旁，两笔像小滑梯，i～' },
    { k:'う', r:'u',   row:'a',  o:'宇', m:'「宇」的宝盖头，屋檐下呜呜叫 u' },
    { k:'え', r:'e',   row:'a',  o:'衣', m:'「衣」的草书，衣架挂钩，诶一声 e' },
    { k:'お', r:'o',   row:'a',  o:'於', m:'和「あ」是双胞胎，多一条小尾巴，o', sim:['あ'] },
    { k:'か', r:'ka',  row:'ka', o:'加', m:'「加」的草书，像力字加一点，用力咔 ka' },
    { k:'き', r:'ki',  row:'ka', o:'幾', m:'像一把钥匙（key），开门 ki～', sim:['さ'] },
    { k:'く', r:'ku',  row:'ka', o:'久', m:'「久」的半边，张嘴发 ku，也像「<」' },
    { k:'け', r:'ke',  row:'ka', o:'計', m:'「计」的草书，小算盘加竖钩 ke' },
    { k:'こ', r:'ko',  row:'ka', o:'己', m:'「己」的草书，两个小括号 ko', sim:['に'] },
    { k:'さ', r:'sa',  row:'sa', o:'左', m:'「左」的草书，S 加一竖，撒 sa', sim:['き','ち'] },
    { k:'し', r:'shi', row:'sa', o:'之', m:'「之」的草书，弯钩像鱼钩，嘘～ shi', sim:['つ','う'] },
    { k:'す', r:'su',  row:'sa', o:'寿', m:'「寿」的草书，像 5 长尾巴，滑雪冲下去 su～', sim:['せ'] },
    { k:'せ', r:'se',  row:'sa', o:'世', m:'「世」的草书，世界这么大，se', sim:['す'] },
    { k:'そ', r:'so',  row:'sa', o:'曽', m:'「曽」的草书，拉链哗啦拉下来 so' },
    { k:'た', r:'ta',  row:'ta', o:'太', m:'「太」的草书，太简单了 ta' },
    { k:'ち', r:'chi', row:'ta', o:'知', m:'「知」的左半，一口吃成 chi', sim:['さ'] },
    { k:'つ', r:'tsu', row:'ta', o:'川', m:'「川」的草书，海浪卷起来 tsu～', sim:['し','う'] },
    { k:'て', r:'te',  row:'ta', o:'手', m:'「手」的草书，伸出手手 te' },
    { k:'と', r:'to',  row:'ta', o:'止', m:'「止」的草书，钉子托住东西 to' },
    { k:'な', r:'na',  row:'na', o:'奈', m:'「奈」的草书，十字架系彩带 na' },
    { k:'に', r:'ni',  row:'na', o:'仁', m:'「仁」的草书，两个人站一起 ni', sim:['こ'] },
    { k:'ぬ', r:'nu',  row:'na', o:'奴', m:'「奴」的草书，筷子夹面条 nu～', sim:['め','ね'] },
    { k:'ね', r:'ne',  row:'na', o:'祢', m:'「祢」的草书，猫尾巴卷成圈——ねこ（猫）ne', sim:['れ','わ','ぬ'] },
    { k:'の', r:'no',  row:'na', o:'乃', m:'「乃」的草书，最眼熟的「の」，指南针 no' },
    { k:'は', r:'ha',  row:'ha', o:'波', m:'「波」的半边，笑出声哈哈 ha', sim:['ほ'] },
    { k:'ひ', r:'hi',  row:'ha', o:'比', m:'「比」的草书，人咧嘴一笑 hi～' },
    { k:'ふ', r:'fu',  row:'ha', o:'不', m:'「不」的草书，富士山顶飘云 fu～' },
    { k:'へ', r:'he',  row:'ha', o:'部', m:'「部」的草书，小山尖尖，嘿 he' },
    { k:'ほ', r:'ho',  row:'ha', o:'保', m:'「保」的草书，比「は」多一横，ho', sim:['は'] },
    { k:'ま', r:'ma',  row:'ma', o:'末', m:'「末」的草书，两横穿竖，像妈妈缝衣服 ma' },
    { k:'み', r:'mi',  row:'ma', o:'美', m:'「美」的草书，3 加一撇，小猫胡须 mi' },
    { k:'む', r:'mu',  row:'ma', o:'武', m:'「武」的草书，牛头晃来晃去 mu～' },
    { k:'め', r:'me',  row:'ma', o:'女', m:'「女」的草书，两笔交叉像辫子 me', sim:['ぬ','も'] },
    { k:'も', r:'mo',  row:'ma', o:'毛', m:'「毛」的草书，毛毛虫 mo～', sim:['め'] },
    { k:'や', r:'ya',  row:'ya', o:'也', m:'「也」的草书，歪着脑袋呀 ya' },
    { k:'ゆ', r:'yu',  row:'ya', o:'由', m:'「由」的草书，小鱼游啊游 yu～' },
    { k:'よ', r:'yo',  row:'ya', o:'与', m:'「与」的草书，招手喊哟 yo' },
    { k:'ら', r:'ra',  row:'ra', o:'良', m:'「良」的草书，5 长出小辫 ra' },
    { k:'り', r:'ri',  row:'ra', o:'利', m:'「利」的偏旁，两根小竹竿 ri', sim:['い'] },
    { k:'る', r:'ru',  row:'ra', o:'留', m:'「留」的草书，尾巴卷成圈 ru', sim:['ろ'] },
    { k:'れ', r:'re',  row:'ra', o:'礼', m:'「礼」的草书，和「ね」像，但尾巴甩直 re', sim:['ね','わ'] },
    { k:'ろ', r:'ro',  row:'ra', o:'呂', m:'「呂」的草书，和「る」像但尾巴不卷 ro', sim:['る'] },
    { k:'わ', r:'wa',  row:'wa', o:'和', m:'「和」的草书，开口笑 wa', sim:['ね','れ'] },
    { k:'を', r:'wo',  row:'wa', o:'遠', m:'「遠」的草书，助词专用 wo' },
    { k:'ん', r:'n',   row:'wa', o:'无', m:'「无」的草书，两笔写完的鼻音 n～' }
  ];

  const KATA = [
    { k:'ア', r:'a',   row:'a',  o:'阿', m:'「阿」的左耳旁，像「了」加一横 a', sim:['マ'] },
    { k:'イ', r:'i',   row:'a',  o:'伊', m:'「伊」的单人旁，一个人站得笔直 i', sim:['リ'] },
    { k:'ウ', r:'u',   row:'a',  o:'宇', m:'「宇」的宝盖头，和「う」同源 u', sim:['ワ'] },
    { k:'エ', r:'e',   row:'a',  o:'江', m:'「江」的工字旁，三横一竖 e', sim:['モ'] },
    { k:'オ', r:'o',   row:'a',  o:'於', m:'「於」的草书，像汉字「才」o' },
    { k:'カ', r:'ka',  row:'ka', o:'加', m:'「加」的力字旁，和「か」一样像「力」ka' },
    { k:'キ', r:'ki',  row:'ka', o:'幾', m:'「幾」的草书，像「升」字少点，ki', sim:['サ'] },
    { k:'ク', r:'ku',  row:'ka', o:'久', m:'「久」的半边，一笔弯钩 ku', sim:['ケ','フ'] },
    { k:'ケ', r:'ke',  row:'ka', o:'介', m:'「介」的草书，比「ク」多一竖 ke', sim:['ク'] },
    { k:'コ', r:'ko',  row:'ka', o:'己', m:'「己」的方版，像开口的盒子 ko', sim:['ユ'] },
    { k:'サ', r:'sa',  row:'sa', o:'散', m:'「散」的草头，像「广」字少点 sa', sim:['キ'] },
    { k:'シ', r:'shi', row:'sa', o:'之', m:'「之」的草书，三点从左往右上扬——微笑 shi', sim:['ツ'] },
    { k:'ス', r:'su',  row:'sa', o:'須', m:'「須」的右边，像汉字「又」su', sim:['ヌ'] },
    { k:'セ', r:'se',  row:'sa', o:'世', m:'「世」的方版，像「せ」的简化 se' },
    { k:'ソ', r:'so',  row:'sa', o:'曽', m:'「曽」的点，两点从上往下掉——伤心 so', sim:['ン'] },
    { k:'タ', r:'ta',  row:'ta', o:'多', m:'「多」的一半，像汉字「夕」ta', sim:['ク'] },
    { k:'チ', r:'chi', row:'ta', o:'千', m:'「千」的草书，一千个 chi', sim:['テ'] },
    { k:'ツ', r:'tsu', row:'ta', o:'川', m:'「川」的方版，三点像浪头冲下来 tsu', sim:['シ'] },
    { k:'テ', r:'te',  row:'ta', o:'天', m:'「天」的草书少一撇，伸出手 te', sim:['チ'] },
    { k:'ト', r:'to',  row:'ta', o:'止', m:'「止」的草书，像汉字「卜」to' },
    { k:'ナ', r:'na',  row:'na', o:'奈', m:'「奈」的草书，像「才」字少一点 na' },
    { k:'ニ', r:'ni',  row:'na', o:'仁', m:'「仁」的简写，两横就是「二」ni', sim:['エ'] },
    { k:'ヌ', r:'nu',  row:'na', o:'奴', m:'「奴」的右边「又」加一点 nu', sim:['ス','メ'] },
    { k:'ネ', r:'ne',  row:'na', o:'祢', m:'「祢」的示字旁，屋顶下挂十字 ne' },
    { k:'ノ', r:'no',  row:'na', o:'乃', m:'「乃」的一撇，一笔写完 no' },
    { k:'ハ', r:'ha',  row:'ha', o:'八', m:'汉字「八」直接借来，八字胡 ha' },
    { k:'ヒ', r:'hi',  row:'ha', o:'比', m:'「比」的半边，像匕首 hi' },
    { k:'フ', r:'fu',  row:'ha', o:'不', m:'「不」的半边，一笔横折 fu', sim:['ク'] },
    { k:'ヘ', r:'he',  row:'ha', o:'部', m:'「部」的草书，和「へ」一模一样 he' },
    { k:'ホ', r:'ho',  row:'ha', o:'保', m:'「保」的木字底，像汉字「木」ho' },
    { k:'マ', r:'ma',  row:'ma', o:'末', m:'「末」的草书，像「才」字缺撇 ma', sim:['ア'] },
    { k:'ミ', r:'mi',  row:'ma', o:'三', m:'「三」的草书，三根猫胡须 mi', sim:['シ','ツ'] },
    { k:'ム', r:'mu',  row:'ma', o:'牟', m:'「牟」的上半，三角形 mu' },
    { k:'メ', r:'me',  row:'ma', o:'女', m:'「女」的草书，一个叉号 me', sim:['ヌ'] },
    { k:'モ', r:'mo',  row:'ma', o:'毛', m:'「毛」的方版，两横加竖钩 mo', sim:['エ'] },
    { k:'ヤ', r:'ya',  row:'ya', o:'也', m:'「也」的方版，像 7 加一竖 ya' },
    { k:'ユ', r:'yu',  row:'ya', o:'由', m:'「由」的方版转个圈，像开口的手枪 yu', sim:['コ','ヨ'] },
    { k:'ヨ', r:'yo',  row:'ya', o:'与', m:'「与」的方版，像反向的 E yo', sim:['ユ'] },
    { k:'ラ', r:'ra',  row:'ra', o:'良', m:'「良」的草书，像「了」加一横 ra', sim:['フ'] },
    { k:'リ', r:'ri',  row:'ra', o:'利', m:'「利」的立刀旁，两根竹竿一短一长 ri', sim:['イ'] },
    { k:'ル', r:'ru',  row:'ra', o:'留', m:'「留」的草书，小人迈开腿 ru' },
    { k:'レ', r:'re',  row:'ra', o:'礼', m:'「礼」的草书，一个折角 re' },
    { k:'ロ', r:'ro',  row:'ra', o:'呂', m:'「呂」的口，方框就是 ro', sim:['ワ','コ'] },
    { k:'ワ', r:'wa',  row:'wa', o:'和', m:'「和」的草书，像「ロ」开了个口 wa', sim:['ロ','ウ'] },
    { k:'ヲ', r:'wo',  row:'wa', o:'遠', m:'「遠」的方版，像「を」的简化 wo' },
    { k:'ン', r:'n',   row:'wa', o:'爾', m:'「爾」的草书，一点加一挑，短促 n', sim:['ソ','ノ'] }
  ];

  // ---- 浊音 / 半浊音：显式对照（避免组合字符渲染问题）----
  const DAKU_TABLE = {
    ga: { base:['か','き','く','け','こ'],   r:['ga','gi','gu','ge','go'], chars:['が','ぎ','ぐ','げ','ご'] },
    za: { base:['さ','し','す','せ','そ'],   r:['za','ji','zu','ze','zo'], chars:['ざ','じ','ず','ぜ','ぞ'] },
    da: { base:['た','ち','つ','て','と'],   r:['da','ji','zu','de','do'], chars:['だ','ぢ','づ','で','ど'] },
    ba: { base:['は','ひ','ふ','へ','ほ'],   r:['ba','bi','bu','be','bo'], chars:['ば','び','ぶ','べ','ぼ'] },
    pa: { base:['は','ひ','ふ','へ','ほ'],   r:['pa','pi','pu','pe','po'], chars:['ぱ','ぴ','ぷ','ぺ','ぽ'], hand:true }
  };
  const DAKU_TABLE_KATA = {
    ga: { base:['カ','キ','ク','ケ','コ'],   r:['ga','gi','gu','ge','go'], chars:['ガ','ギ','グ','ゲ','ゴ'] },
    za: { base:['サ','シ','ス','セ','ソ'],   r:['za','ji','zu','ze','zo'], chars:['ザ','ジ','ズ','ゼ','ゾ'] },
    da: { base:['タ','チ','ツ','テ','ト'],   r:['da','ji','zu','de','do'], chars:['ダ','ヂ','ヅ','デ','ド'] },
    ba: { base:['ハ','ヒ','フ','ヘ','ホ'],   r:['ba','bi','bu','be','bo'], chars:['バ','ビ','ブ','ベ','ボ'] },
    pa: { base:['ハ','ヒ','フ','ヘ','ホ'],   r:['pa','pi','pu','pe','po'], chars:['パ','ピ','プ','ペ','ポ'], hand:true }
  };
  function dakulist(script) {
    const T = script === 'hira' ? DAKU_TABLE : DAKU_TABLE_KATA;
    const out = [];
    Object.keys(T).forEach(row => {
      const t = T[row];
      t.chars.forEach((ch, i) => {
        out.push({
          k: ch, r: t.r[i], row,
          m: `「${t.base[i]}」加${t.hand ? '小圈' : '两点'}${t.hand ? '半浊' : '浊'}化 → ${t.r[i]}`,
          sim: [t.base[i]],
          daku: true, hand: !!t.hand, kind: t.hand ? '半浊音' : '浊音'
        });
      });
    });
    // 半浊音额外提示与对应浊音形近
    out.forEach(x => { if (x.hand) x.sim.push(script === 'hira' ? 'ば' : 'バ'); });
    return out;
  }

  // ---- 拗音：清/浊音 + 小や ゆ よ 相拼 ----
  const YOU_TABLE = [
    { row:'kya', baseRow:'ka', r:['kya','kyu','kyo'] },
    { row:'sya', baseRow:'sa', r:['sha','shu','sho'] },
    { row:'tya', baseRow:'ta', r:['cha','chu','cho'] },
    { row:'nya', baseRow:'na', r:['nya','nyu','nyo'] },
    { row:'hya', baseRow:'ha', r:['hya','hyu','hyo'] },
    { row:'mya', baseRow:'ma', r:['mya','myu','myo'] },
    { row:'rya', baseRow:'ra', r:['rya','ryu','ryo'] },
    { row:'gya', baseRow:'ga', r:['gya','gyu','gyo'] },
    { row:'zya', baseRow:'za', r:['ja','ju','jo'] },
    { row:'bya', baseRow:'ba', r:['bya','byu','byo'] },
    { row:'pya', baseRow:'pa', r:['pya','pyu','pyo'] }
  ];
  const SMALL_HIRA = ['ゃ', 'ゅ', 'ょ'];
  const SMALL_KATA = ['ャ', 'ュ', 'ョ'];
  function youlist(script) {
    const basePool = (script === 'hira' ? HIRA : KATA).concat(dakulist(script));
    const byRow = {};
    basePool.forEach(x => { (byRow[x.row] = byRow[x.row] || []).push(x); });
    const smalls = script === 'hira' ? SMALL_HIRA : SMALL_KATA;
    const smallNames = script === 'hira' ? ['や', 'ゆ', 'よ'] : ['ヤ', 'ユ', 'ヨ'];
    const out = [];
    YOU_TABLE.forEach(t => {
      const b = byRow[t.baseRow][1]; // 拗音取该行第二个假名（き し ち に…）
      t.r.forEach((r, i) => {
        const siblings = t.r.filter(x => x !== r);
        out.push({
          k: b.k + smalls[i], r, row: t.row,
          m: `「${b.k}（${b.r}）」＋ 小${smallNames[i]} 相拼 → ${r}`,
          sim: siblings.map(s => b.k + smalls[t.r.indexOf(s)]),
          you: true, kind: '拗音'
        });
      });
    });
    return out;
  }

  const DAKU = { hira: dakulist('hira'), kata: dakulist('kata') };
  const YOU = { hira: youlist('hira'), kata: youlist('kata') };

  // 所有引用处（包括原始数组）都带 s 字段，避免边界处形状不一致
  HIRA.forEach(x => { x.s = 'hira'; });
  KATA.forEach(x => { x.s = 'kata'; });
  DAKU.hira.forEach(x => { x.s = 'hira'; });
  DAKU.kata.forEach(x => { x.s = 'kata'; });
  YOU.hira.forEach(x => { x.s = 'hira'; });
  YOU.kata.forEach(x => { x.s = 'kata'; });

  function tag(list, s) { return list.map(x => Object.assign({ s }, x)); }
  const ALL = []
    .concat(tag(HIRA, 'hira'), tag(KATA, 'kata'))
    .concat(tag(DAKU.hira, 'hira'), tag(DAKU.kata, 'kata'))
    .concat(tag(YOU.hira, 'hira'), tag(YOU.kata, 'kata'));

  const byKey = {};  // "hira:あ" -> entry
  const byChar = {}; // "あ" -> entry（清音不重复，浊拗假名均唯一）
  ALL.forEach(x => {
    const key = x.s + ':' + x.k;
    if (byKey[key] || byChar[x.k]) throw new Error('kana key/char 重复: ' + key);
    byKey[key] = x; byChar[x.k] = x;
  });

  function group(script, kind) {
    return ALL.filter(x => x.s === script && (kind === 'base' ? !x.daku && !x.you
      : kind === 'daku' ? x.daku : x.you));
  }

  function assert() {
    const counts = {
      hiraBase: group('hira', 'base').length, kataBase: group('kata', 'base').length,
      hiraDaku: group('hira', 'daku').length, kataDaku: group('kata', 'daku').length,
      hiraYou: group('hira', 'you').length, kataYou: group('kata', 'you').length
    };
    const expect = { hiraBase: 46, kataBase: 46, hiraDaku: 25, kataDaku: 25, hiraYou: 33, kataYou: 33 };
    Object.keys(expect).forEach(k => {
      if (counts[k] !== expect[k]) throw new Error(`假名数量不符 ${k}: ${counts[k]} != ${expect[k]}`);
    });
    ALL.forEach(x => {
      if (!/^[a-z]+$/.test(x.r)) throw new Error('罗马音非法: ' + x.k + ' -> ' + x.r);
      if (!x.m) throw new Error('缺少助记: ' + x.k);
      (x.sim || []).forEach(s => { if (!byChar[s]) throw new Error('sim 指向不存在的假名: ' + x.k + ' -> ' + s); });
    });
    return counts;
  }

  return {
    HIRA, KATA, DAKU, YOU, ALL, byKey, byChar, group, assert,
    key: (s, k) => s + ':' + k
  };
})();
