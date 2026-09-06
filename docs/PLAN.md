# PLAN.md — 执行计划与进度日志（一等公民文档）

> **当前状态：已上线 🌸 <https://kana-monogatari.vercel.app>**（Vercel 托管；更新方式：`vercel deploy --prod --yes`）

> 方法：借鉴 OpenAI《Harness Engineering》——人类掌舵、智能体执行；仓库即记录系统；
> 计划/进度/决策日志随代码提交；短回路验证（不变量脚本 + 真机浏览器截图）。

## 里程碑

- [x] M0 调研：OpenAI Harness Engineering 方法论 + 五十音游戏化设计调研（Tofugu / SRS 论文 / kawaiiDungeon / Duolingo / 日系视觉）
- [x] M1 骨架：git init、AGENTS.md（地图）、DESIGN.md（设计定案）、本文件
- [x] M2 数据层：kana.js（208 项假名 + 中文助记 + 字源 + 形近）、rows.js（4 篇 31 关）、achievements.js、kotodama.js
- [x] M3 核心层：util / store（状态+经济+成就）/ srs（Leitner）/ quiz（出题+干扰项）/ audio（WebAudio 合成+语音）/ fx（樱花烟花纸屑星光）
- [x] M4 UI 层：router / home / quest（闯关）/ swift（速答）/ match（配对）/ learn（图鉴）/ collection（收藏+成就+言灵）/ omikuji（御神签）/ settings（主题+自由解锁）
- [x] M5 视觉：夜樱霓虹主题 + 4 套可解锁主题 + 字体体系 + 全部关键帧动画
- [x] M6 验证：tools/validate.js 全绿 + 浏览器逐屏实测（截图）+ 控制台零报错
- [x] M7 README + 最终审计
- [x] M8 用户反馈轮：读音气泡+朗读迁移 / 存档码导出导入 / 存储探测警告 / 默认轻柔 BGM / UI 崩溃护栏（validate 1095 断言 + 实况标签页复测）
- [x] M9 上线：发布至 Vercel → <https://kana-monogatari.vercel.app>（静态站 vercel.json + 线上验收 200/零报错/闯关冒烟）

## 后备候选（未排期，按需取用）

- GitHub 连接实现 push 自动部署（当前为 CLI 手动发布）
- 听音辨字题型在无日语语音设备上的合成音替代方案
- 拗音打字/手写输入题型、词句模式（用已学会的假名拼单词）
- 数据导出为 Anki 卡组

## 进度日志

- 2026-09-06 M1 完成：仓库与地图文档就绪。决策：经典 script 而非 ES modules（file:// 双击可玩是硬需求）。
- 2026-09-06 M2 完成：假名数据 208 项校验通过（46/46/25/25/33/33）；助记为手写中文（清音平片各 46 条），浊/拗由部件自动生成说明。设计修正：浊音篇/拗音篇补充片假名关卡（26→31 关），保证"每个假名恰属一关"不变量。
- 2026-09-06 M3 完成：出题引擎强制"同题罗马音唯一"不变量（お/を、じ/ぢ、ず/づ 及跨脚本 き/キ 场景已测）；SRS 1000 次模拟 box 有界；存储往返一致；XP 单调。验证揪出真 bug：扭蛋把言灵字段 w 与权重 w 撞名；原始假名数组缺 s 字段导致跨脚本同音漏排。
- 2026-09-06 M4+M5 完成：全部屏幕与主题；Fx 单画布粒子引擎（樱花 26 上限、烟花、纸屑、星光）；reduced-motion 降级；花瓣颜色随主题联动。
- 2026-09-06 M6 完成：`node tools/validate.js` 1087 断言全绿 ×3；浏览器自动化逐屏实测（首页/地图/学习卡/答题/结算/极速/配对/收藏/扭蛋/御神签/设置/图鉴/移动端/彩蛋），控制台零报错，刷新存档持久化验证通过。实测修复 4 处：地图误用未展开的关卡定义；k2r 题选项渲染分支标记不一致；设置切主题弹窗堆叠；首日到访天数为 0。
- 2026-09-06 M7 完成：README、审计、提交。
- 2026-09-06 M8（用户反馈轮）：
  - #1 读音——根因是早期测试遗留的 voice=false 存档；做一次性迁移（m201）恢复朗读默认开；🔊点击现在必弹"读音气泡"（无日语语音也能看到读音）；答题页题目下加朗读键，判题后自动读正确答案；设置新增语音诊断行。
  - #2 进冒险闯关退回——无法在最新构建复现（用户存档显示已正常进入 か行学习卡，判断为旧缓存 JS 命中当日早些时候已修的地图崩溃，或误触顶栏主页键）；加固：UI.show 增加崩溃护栏，任何屏幕渲染失败都会显示错误信息 + 回主页按钮，不再神秘消失。
  - #3 刷新进度——实测其存档完好；真正风险是「双击文件」与「本地服务」属于不同存档位，以及隐私窗口无法写存储。修复：存储探测 + 明确警告；设置新增存档码导出/导入（KQ1.+base64，跨方式/跨设备搬运）；load 合并逻辑补齐缺失字段（validate 抓到的真 bug）；main.js 对 localStorage 的裸访问加防护；README 说明。
  - #4 背景音乐——默认开启（迁移覆盖旧档）；编曲改轻柔版：8 秒小节、长音垫底、稀疏五声拨弦带留白、偶尔风铃高音。
  - 验证：validate 1095 断言 ×2 全绿（新增存储探测/存档码往返/迁移用例）；在用户实况标签页完成迁移与全流程复测（进度无损、读音气泡、闯关流程、导出码），控制台零报错。
- 2026-09-06 M9（上线）：发布到 Vercel。旧 CLI 令牌过期 → 设备码登录（注：经本地代理的长轮询会超时中断，需绕过代理环境变量直连）；`vercel link --project kana-monogatari` + 静态站 `vercel.json`（cleanUrls、静态资源缓存头、安全头）；生产部署 → https://kana-monogatari.vercel.app 。线上验收：index/js/css 200、208 假名加载、闯关答题冒烟（✔ あ=a、花瓣+1）、控制台零报错。`.vercel/` 已入 .gitignore。

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
