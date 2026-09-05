# PLAN.md — 执行计划与进度日志（一等公民文档）

> 方法：借鉴 OpenAI《Harness Engineering》——人类掌舵、智能体执行；仓库即记录系统；
> 计划/进度/决策日志随代码提交；短回路验证（不变量脚本 + 真机浏览器截图）。

## 里程碑

- [x] M0 调研：OpenAI Harness Engineering 方法论 + 五十音游戏化设计调研（Tofugu / SRS 论文 / kawaiiDungeon / Duolingo / 日系视觉）
- [x] M1 骨架：git init、AGENTS.md（地图）、DESIGN.md（设计定案）、本文件
- [x] M2 数据层：kana.js（208 项假名 + 中文助记 + 字源 + 形近）、rows.js（4 篇 24 关）、achievements.js、kotodama.js
- [x] M3 核心层：util / store（状态+经济+成就）/ srs（Leitner）/ quiz（出题+干扰项）/ audio（WebAudio 合成+语音）/ fx（樱花烟花纸屑星光）
- [x] M4 UI 层：router / home / quest（闯关）/ swift（速答）/ match（配对）/ learn（图鉴）/ collection（收藏+成就+言灵）/ omikuji（御神签）/ settings（主题+自由解锁）
- [x] M5 视觉：夜樱霓虹主题 + 4 套可解锁主题 + 字体体系 + 全部关键帧动画
- [x] M6 验证：tools/validate.js 全绿 + 浏览器逐屏实测（截图）+ 控制台零报错
- [x] M7 README + 最终审计

## 进度日志

- 2026-09-06 M1 完成：仓库与地图文档就绪。决策：经典 script 而非 ES modules（file:// 双击可玩是硬需求）。
- 2026-09-06 M2 完成：假名数据 208 项校验通过（46/46/25/25/33/33）；助记为手写中文（清音平片各 46 条），浊/拗由部件自动生成说明。
- 2026-09-06 M3 完成：出题引擎强制"同题罗马音唯一"不变量（お/を、じ/ぢ、ず/づ 场景已测）；SRS 1000 次模拟 box 有界；存储往返一致；XP 单调。
- 2026-09-06 M4+M5 完成：全部屏幕与主题；Fx 单画布粒子引擎（樱花 60 上限、烟花、纸屑、星光）；reduced-motion 降级。
- 2026-09-06 M6 完成：`node tools/validate.js` 全绿（52 项断言组）；http.server + 自动化浏览器逐屏实测通过，控制台零报错，存档往返验证。
- 2026-09-06 M7 完成：README、审计、提交。

## 决策记录

| # | 决策 | 备选 | 理由 |
| --- | --- | --- | --- |
| 1 | 纯 vanilla + 经典 script | React/Vite、单文件 HTML | "枯燥技术"最稳；双击即玩；结构仍清晰可导航 |
| 2 | Leitner 5 盒而非完整 SM-2 | Anakama 式 SM-2 | 游戏场景粒度足够；参数可解释、可测 |
| 3 | 浊/拗助记自动生成 | 全部手写 208 条 | 部件组合式记忆本身就是规律，手写反而冗余 |
| 4 | WebAudio 合成音频 | 外置音频文件 | 零资源、离线可用、体积为 0 |
| 5 | 御神签+言灵扭蛋作为"惊喜层" | 纯成就墙 | 每日仪式感 + 收集欲，调研中元成长层最有效的两味 |
| 6 | 星级=box 阈值映射 | 独立计算 | 一份事实来源，图鉴与 SRS 永不冲突 |

## 调研来源链接

- https://openai.com/zh-Hans-CN/index/harness-engineering （方法论）
- https://www.tofugu.com/japanese/learn-hiragana/ ＆ https://kana-quiz.tofugu.com/
- https://www.researchgate.net/publication/268130455 （SRS 学习游戏）
- https://ics-gmt.science.uu.nl/sites/default/files/2025-05/A%20Turn-Based%20Serious%20Game%20for%20Learning%20Kanji%20for%20L2%20Learners%20of%20Japanese.pdf
- https://play.google.com/store/apps/details?id=de.mardukcorp.kawaiinihongo （kawaiiNihongo / kawaiiDungeon）
- https://apps.apple.com/sg/app/the-hiraganas-king/id1637657106
- https://cotoacademy.com/japanese-learning-game-wagotabi/
- https://japanwebdesign.com/ ＆ https://dribbble.com/search/sakura （视觉基调）
