# Mixin Phase 1 执行清单 v0.1

## 1. 文档信息

- 版本：v0.1
- 状态：Draft
- 更新时间：2026-03-22
- 目标：把 PRD/ARCH 转为可执行研发 backlog

## 2. 里程碑定义

### M1 - Foundation（第 1-2 周）

- 完成 runtime 最小骨架与 Nuxt 模块接入
- 跑通最小 demo（模型加载 + 锚点 + 相机聚焦）

### M2 - Productization（第 3-4 周）

- 完成组件层 API 稳定化与输入仲裁
- 提供 Landing 模板达到“可展示”质量

### M3 - Launch Readiness（第 5-6 周）

- 完成 3 个模板、文档站、基础性能与回归测试
- 输出可对外演示版本（alpha）

## 3. Backlog（按包拆分）

优先级说明：

- P0：阻塞主链路，必须进入 Phase 1
- P1：建议进入 Phase 1，影响体验/可用性
- P2：可延期到 Phase 2

### 3.1 `@mixin/runtime`

1. P0 - 建立 `SceneManager` 最小可运行循环  
   验收标准：支持初始化 renderer/camera/scene，能渲染基础模型，支持销毁回收。

2. P0 - 实现 `CameraController.focusTo`  
   验收标准：支持位置/目标点平滑过渡，参数含 `duration/easing`，完成事件回调。

3. P0 - 实现 `AnchorProjector`  
   验收标准：目标节点可投影到 2D 层，滚动和 resize 后位置正确更新。

4. P0 - 实现 `InputArbiter` 基础策略  
   验收标准：Overlay 输入聚焦时不误触 3D；3D 拖拽时可阻止页面滚动。

5. P1 - `PerfGovernor` 采样与降级  
   验收标准：采样 FPS 并在持续低帧触发降级标志。

6. P1 - 路由状态桥接（`useMxRouteTransition`）  
   验收标准：页面路由变更可触发预设相机状态切换。

### 3.2 `@mixin/components`

1. P0 - `MxScene/MxWorld/MxOverlay` 组件骨架  
   验收标准：SFC 内可组合使用，且 runtime 上下文正确注入。

2. P0 - `MxAnchor`  
   验收标准：可通过 `target=nodeId` 绑定锚点；失效节点不报错、可降级隐藏。

3. P0 - `MxModel`（GLB 基础加载）  
   验收标准：支持模型路径、点击事件、加载失败 fallback。

4. P1 - 组件 props 类型与文档注释完善  
   验收标准：TS 提示完整，错误配置给出清晰告警。

### 3.3 `@mixin/nuxt`

1. P0 - Nuxt Module 初始化  
   验收标准：启用模块后自动注册组件与 plugin，无手动样板代码。

2. P0 - 默认配置合并逻辑  
   验收标准：`nuxt.config.ts` 中 `mixin` 配置可覆盖默认值。

3. P1 - 调试开关（debug overlay）  
   验收标准：开启后可查看 anchor 坐标与性能状态。

### 3.4 `create-mixin`

1. P0 - 初始化命令与模板选择  
   验收标准：`create-mixin` 一条命令完成项目创建并可启动。

2. P0 - Landing 模板  
   验收标准：包含 3D 模块 + 2D 内容混排，能体现主能力链路。

3. P1 - Portfolio 与 Product Showcase 模板  
   验收标准：模板可直接运行，具备清晰的复用价值。

### 3.5 文档与示例

1. P0 - 快速上手文档  
   验收标准：30 分钟内可跑通 first scene。

2. P0 - API 文档（核心组件 + composables）  
   验收标准：与实现一致，示例代码可运行。

3. P1 - 最佳实践与性能指南  
   验收标准：覆盖模型大小、贴图策略、交互设计建议。

### 3.6 测试与质量

1. P0 - runtime 关键单测  
   验收标准：相机插值、锚点投影、输入仲裁具备基础测试覆盖。

2. P1 - 模板视觉回归  
   验收标准：关键页面截图比对稳定，允许阈值可配置。

3. P1 - E2E 主链路测试  
   验收标准：点击模型 -> 相机过渡 -> 2D 卡片显示，全链路通过。

## 4. 关键依赖关系

- `SceneManager` 是 `components` 与 `nuxt module` 的前置依赖。
- `AnchorProjector` 和 `MxAnchor` 必须同步设计，避免重复状态。
- `create-mixin` 模板依赖组件 API 稳定后再冻结。
- 文档示例应基于模板分支自动验证，避免文档漂移。

## 5. Phase 1 Definition of Done

满足以下全部条件才可进入 alpha 演示：

1. Landing 模板在桌面端稳定运行，包含可交互 3D 模块与 2D 内容混排。
2. `focusTo`、`MxAnchor`、`InputArbiter` 的基础行为在 demo 中可验证。
3. 至少 1 套自动化测试覆盖主交互链路。
4. 核心 API 文档可直接复制运行，无明显失真。
5. 性能监控可输出基础 FPS 统计并支持降级开关。

## 6. 风险前置验证（建议在第 1 周完成）

1. PoC-A：复杂滚动页面中锚点抖动验证  
   通过标准：快速滚动 + resize 下锚点偏差可控。

2. PoC-B：移动端输入冲突验证  
   通过标准：触摸拖拽/滚动可控，不出现明显误触。

3. PoC-C：中端设备性能基线  
   通过标准：目标场景达到 55+ FPS 或可平滑降级。

## 7. 角色分工建议

- Runtime Owner：负责 `@mixin/runtime` 核心链路
- Framework Owner：负责 `@mixin/nuxt` 和脚手架集成
- DX/Docs Owner：负责模板、文档、示例可运行性
- QA Owner：负责测试基线和回归机制

## 8. 下一步动作（立即执行）

1. 在仓库创建四个包目录草案与基础 `package.json`。
2. 先实现 `MxScene + MxWorld + focusTo` 最短路径 demo。
3. 用该 demo 反向校准 API，冻结 v0.1 接口。
