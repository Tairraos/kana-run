# AGENTS.md — 项目地图

五十音物語（KANA MONOGATARI）——纯 Web 单页小游戏，帮助用户背诵日语五十音图。
零构建、零依赖、零外部资源：双击 `index.html` 即可离线游玩（字体与在线服务为渐进增强）。

## 这是什么 / 地图（先读这里，再按图索骥）

| 路径 | 职责 | 关键约定 |
| --- | --- | --- |
| `index.html` | 唯一入口；按依赖顺序以经典 `<script>` 引入各模块 | 顺序不可乱；禁止 ES modules（保证 file:// 可用） |
| `js/data/kana.js` | 全部假名数据（平/片/浊/拗，共 208 项）：假名、罗马音、行、中文助记、形近字、字源 | 唯一假名事实来源；其他文件只引用不硬编码 |
| `js/data/rows.js` | 行与章节（篇）、冒险关卡（stage）定义 | 关卡由行 id 组合而成 |
| `js/data/achievements.js` | 成就定义（id、名称、条件描述、检测函数用到的统计键） | 检测逻辑在 `store.js`，此处只有声明 |
| `js/data/kotodama.js` | 言灵收集卡（扭蛋奖品）词表 | |
| `js/core/util.js` | 通用工具（$、shuffle、rand、clamp、日期键等） | 挂在 `window.U` |
| `js/core/store.js` | 全局状态 + localStorage 持久化 + XP/等级/花瓣/连击天/成就检测/事件总线 | 唯一写盘点；`Store.save()` 幂等 |
| `js/core/srs.js` | 间隔复习（Leitner 盒）+ 掌握度星级 + 抽样权重 | 只管记忆模型，不管 UI |
| `js/core/quiz.js` | 出题引擎：题型、干扰项选取（同行/形近优先）、罗马音唯一性不变量 | 见下方“不变量” |
| `js/core/audio.js` | WebAudio 合成音效 + 可选五声音阶 BGM + ja-JP 语音朗读 | 无音频文件；首次用户手势后初始化 |
| `js/core/fx.js` | 全屏 canvas 特效：樱花、烟花、纸屑、星光；屏幕震动 | 单例画布；respect prefers-reduced-motion |
| `js/ui/*.js` | 各屏幕与弹窗：router/home/quest/swift/match/learn/collection/omikuji/settings | 每个 UI 模块只经 `UI.show(name)` 被路由 |
| `css/*.css` | base(主题变量/组件) screens(屏幕布局) animations(关键帧) | 主题 = `body[data-theme=…]` 覆盖 CSS 变量 |
| `tools/validate.js` | 数据与逻辑不变量自检（node 直接运行） | 提交前必跑：`node tools/validate.js` 或 `npm test` |
| `package.json` | 元信息 + 脚本入口（test / validate / serve） | 仅挂脚本，**零依赖**：不要引入任何 dependency |
| `LICENSE` | MIT 许可证 | 再分发需保留版权声明 |
| `docs/DESIGN.md` | 游戏设计定案（调研结论 → 决策） | 设计变更先改这里 |
| `docs/PLAN.md` | 执行计划 + 进度日志 + 决策记录 | 每完成一个里程碑更新日志 |
| `README.md` | 玩法说明与运行方式 | 面向玩家 |

## 不变量（机械强制，改动前先跑 validate）

1. 假名数据：清音平/片各 46，浊音半浊音平/片各 25，拗音平/片各 33；字符全局唯一；罗马音非空。
2. 出题：选项互斥且必含正确项；同一题内不允许出现两个罗马音相同的假名（お/を、じ/ぢ、ず/づ…）。
3. 状态：`Store.save()` 后 `load()` 必须还原（版本号不匹配走迁移或重置）。
4. XP/等级单调不减；星级 ∈ {0,1,2,3}；SRS box ∈ [0,5]。

## 反馈回路（本项目的验证方式）

- `node tools/validate.js` —— 数据/逻辑不变量（CI 意义上的守门员）。
- 浏览器实测：`python3 -m http.server 8377` 后用自动化逐屏点击、截图核对；控制台必须零报错。
- 修复 bug 的顺序：最小复现 → 修复 → 上述两条回路重跑 → 在 `docs/PLAN.md` 记一笔。

## 约定

- 纯 vanilla JS（无框架、无构建、无 npm）；所有模块以 IIFE 挂 `window` 命名空间（`U / KANA / ROWS / ACHV / KOTODAMA / SRS / QUIZ / SFX / FX / STORE / UI`）。
- 文案默认简体中文，日语词汇标注读音；玩家可及处不出现开发者行话。
- 数据形状在边界处校验：`kana.js` 末尾有 `KANA.assert()`，加载即失败可见。
- 提交信息用中文短句；里程碑一提交。
