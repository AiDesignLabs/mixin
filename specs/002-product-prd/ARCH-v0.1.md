# Mixin ARCH v0.1（Phase 1 技术架构）

## 1. 文档信息

- 版本：v0.1
- 状态：Draft
- 更新时间：2026-03-22
- 作用范围：对应 `PRD v0.1` 的 Phase 1（2D 主 + 3D 增强）

## 2. 架构目标

- 保持 Nuxt/Vue3 开发体验，不引入全新 DSL。
- 提供单 `canvas` 的 3D 渲染能力和稳定的 HTML 叠加能力。
- 将“渲染、交互、路由、过渡”从业务页面中解耦为统一运行时。
- 给后续 Phase 2/3 预留扩展点（相机叙事、3D 主视角导航）。

## 3. 包与职责分层

### 3.1 `@mixin/nuxt`

- 提供 `nuxt module`：
  - 自动注册组件（`MxScene`、`MxWorld`、`MxOverlay`、`MxAnchor`）。
  - 注入 runtime plugin（客户端）。
  - 处理默认配置（性能策略、设备分级阈值、日志开关）。
- 提供用户配置入口：
  - `mixin: { performance, debug, sceneDefaults }`

### 3.2 `@mixin/runtime`

- 核心域模块：
  - `SceneManager`：场景生命周期、渲染循环、按需渲染调度。
  - `CameraController`：相机状态、过渡编排、预设管理。
  - `AnchorProjector`：3D 节点到 2D DOM 坐标映射。
  - `InputArbiter`：滚动/拖拽/点击等输入冲突仲裁。
  - `PerfGovernor`：FPS 采样、降级策略触发。
- 提供 composables：
  - `useMxCamera`
  - `useMxRouteTransition`
  - `useMxPerf`

### 3.3 `@mixin/components`

- Vue 组件壳层：
  - `MxScene`: 顶层上下文容器与 runtime provider。
  - `MxWorld`: 3D 场景挂载容器。
  - `MxOverlay`: 2D 层容器。
  - `MxAnchor`: 锚点绑定组件。
  - `MxModel`: 轻量模型组件（glTF 基础能力）。

### 3.4 `create-mixin`

- 脚手架职责：
  - 初始化 Nuxt 项目 + Mixin 模块配置。
  - 生成模板项目（Landing / Portfolio / Product Showcase）。
  - 提供命令：`create-mixin my-site --template landing`

## 4. 系统上下文

- 宿主：Nuxt 3（Vue 3 + Vite）
- 渲染：Three.js（Phase 1 不引入复杂引擎层）
- UI：Vue SFC + 标准 CSS（保留现有工程体系）
- 资产：glTF/GLB（后续扩展 HDR、压缩纹理）

## 5. 关键运行时流程

## 5.1 场景初始化

1. `MxScene` 挂载并创建 runtime 上下文。
2. `MxWorld` 创建 Three renderer/camera/scene（单 canvas）。
3. `MxOverlay` 绑定 DOM 层，建立 `AnchorProjector`。
4. `SceneManager` 启动渲染循环或按需渲染策略。

## 5.2 锚点投影更新（每帧或按需）

1. `AnchorProjector` 读取目标 3D 节点 world matrix。
2. 使用 camera 将 3D 坐标投影到 viewport。
3. 产出 2D transform，更新 `MxAnchor` 对应 DOM。
4. 根据遮挡/可见性策略控制 `opacity/pointer-events`。

## 5.3 点击聚焦过渡

1. 用户点击 `MxModel`（3D）。
2. `useMxCamera().focusTo(target, options)` 触发。
3. `CameraController` 计算起止位姿 + easing 曲线。
4. 过渡期间广播事件给 `MxOverlay` 控制卡片显隐。
5. 结束后写入路由状态（可选）以支持可分享 URL。

## 5.4 输入仲裁

1. `InputArbiter` 按上下文计算优先级：

- Overlay 表单聚焦时，优先 DOM 交互。
- 3D 拖拽激活时，暂时冻结页面滚动。

2. 仲裁结果同步给 `SceneManager` 与 DOM 层。

## 6. 数据模型（最小集合）

```ts
type CameraPose = {
  position: [number, number, number];
  target: [number, number, number];
  fov?: number;
};

type FocusOptions = {
  duration?: number;
  easing?: string;
  offset?: [number, number, number];
};

type AnchorState = {
  nodeId: string;
  screenX: number;
  screenY: number;
  visible: boolean;
  occluded?: boolean;
};
```

## 7. 性能与降级策略

- 默认预算：
  - 动画场景目标 55+ FPS（中端设备）。
  - 首屏渲染完成时间控制在可接受范围（以真实站点验证）。
- 降级策略：
  - 持续低 FPS：降级后处理和阴影质量。
  - 后台标签页：停止渲染循环，仅保留状态更新。
  - 低性能设备：默认按需渲染 + 降采样。

## 8. 扩展点设计

- `CameraController` 支持新增 transition preset（供 Phase 2 时间轴能力扩展）。
- `AnchorProjector` 保持策略接口，后续可接入遮挡精细检测。
- `SceneManager` 预留多场景切换钩子（Phase 3 3D 主视角需要）。

## 9. 测试策略

- 单元测试：
  - 坐标投影结果稳定性（AnchorProjector）。
  - 相机过渡插值正确性（CameraController）。
  - 输入优先级判定（InputArbiter）。
- 集成测试：
  - 点击模型后卡片出现 + 相机到位。
  - 路由切换后场景状态恢复。
- 视觉回归：
  - 模板页面关键帧截图对比（主要布局、锚点位置）。

## 10. 风险与技术债

- 风险：单 canvas 方案下复杂混排可维护性压力高  
  对策：先收敛组件能力边界，复杂排版交给 Overlay。

- 风险：输入仲裁逻辑在移动端表现不一致  
  对策：早期纳入触摸手势专项用例。

- 技术债：高级材质、光照、后期效果暂不纳入  
  对策：先保证流程闭环，后续通过 preset 扩展。

## 11. 与 PRD 对齐关系

- 对应 PRD 第 9 章（功能范围）与第 11 章（Phase 路线图）。
- 本文档只定义 Phase 1 可交付的技术边界，不覆盖 Phase 2/3 细节设计。
