# Mixin Phase 1 API（冻结版）

更新时间：2026-03-25  
范围：`@mixin/components` / `@mixin/runtime` / `@mixin/nuxt`  
目标：作为 `v0.1.0-alpha` 的稳定接口基线，新增能力只能向后兼容。

## 组件 API

### `MxScene`

| 项                 | 类型                                         | 默认值               | 说明                              |
| ------------------ | -------------------------------------------- | -------------------- | --------------------------------- |
| `initialCamera`    | `Partial<CameraState>`                       | `defaultCameraState` | 初始相机状态                      |
| `slot.focusTo`     | `(target, options?) => Promise<CameraState>` | -                    | 触发相机过渡                      |
| `slot.cameraState` | `CameraState`                                | -                    | 当前相机状态快照                  |
| `slot.controller`  | `CameraController`                           | -                    | 低层控制器（`setState/getState`） |

### `MxWorld`

| 项             | 类型                         | 默认值    | 说明                     |
| -------------- | ---------------------------- | --------- | ------------------------ |
| `background`   | `string`                     | `#0a1020` | 场景背景色               |
| `autoRotate`   | `boolean`                    | `true`    | 是否自动旋转 demo 立方体 |
| `showDemoCube` | `boolean`                    | `false`   | 是否显示内置可交互立方体 |
| `@model-click` | `(targetId: string) => void` | -         | 模型点击事件             |

### `MxModel`

| 项               | 类型                      | 默认值      | 说明                                           |
| ---------------- | ------------------------- | ----------- | ---------------------------------------------- |
| `id`             | `string`                  | -           | 目标 ID（用于 `focusTo` 与 `MxAnchor target`） |
| `src`            | `string`                  | -           | GLTF/GLB URL                                   |
| `position`       | `Vec3`                    | `[0,0,0]`   | 模型位置                                       |
| `rotation`       | `Vec3`                    | `[0,0,0]`   | 欧拉角旋转（弧度）                             |
| `scale`          | `number \| Vec3`          | `1`         | 模型缩放                                       |
| `focusOffset`    | `Vec3`                    | `[0,0,2.4]` | 聚焦相机偏移                                   |
| `focusFov`       | `number`                  | `35`        | 聚焦时 FOV                                     |
| `interactive`    | `boolean`                 | `true`      | 是否参与射线交互                               |
| `visible`        | `boolean`                 | `true`      | 是否可见                                       |
| `@status-change` | `(status) => void`        | -           | `idle/loading/ready/error`                     |
| `@load-start`    | `(id) => void`            | -           | 加载开始                                       |
| `@load`          | `(id) => void`            | -           | 加载成功                                       |
| `@error`         | `({ id, error }) => void` | -           | 加载失败                                       |
| `@click`         | `(id) => void`            | -           | 模型点击                                       |

### `MxOverlay`

| 项           | 类型    | 默认值 | 说明      |
| ------------ | ------- | ------ | --------- |
| default slot | `VNode` | -      | 2D HUD 层 |

### `MxAnchor`

| 项                | 类型      | 默认值 | 说明                 |
| ----------------- | --------- | ------ | -------------------- |
| `target`          | `string`  | -      | 跟随目标 ID          |
| `offsetX`         | `number`  | `0`    | 屏幕 X 偏移          |
| `offsetY`         | `number`  | `0`    | 屏幕 Y 偏移          |
| `hideWhenMissing` | `boolean` | `true` | 找不到目标时是否隐藏 |

## Composables API

### `useMxCamera`

返回：

- `focusTo`
- `controller`

### `useMxRouteTransition(options)`

参数：

- `transitions: Record<string, FocusTarget>`
- `viewKey?: string`（默认 `view`）
- `defaultView?: string`
- `focusOptions?: FocusOptions`

返回：

- `setView(view: string, replace?: boolean)`
- `syncView(view, focusOptions?)`

## Runtime API

### `CameraController`

核心方法：

- `getState()`
- `setState(partialState)`
- `focusTo(target, options?)`
- `subscribe(listener)`
- `dispose()`

### 其他

- `InputArbiter`
- `RouteTransitionManager`
- `projectToScreen`
- 类型：`Vec3` / `CameraState` / `FocusTarget` / `FocusOptions`

## Nuxt API

模块：`@mixin/nuxt`

- `nuxt.config.ts` 中 `modules: ['@mixin/nuxt']`
- 自动注册组件插件
- 自动导入：`useMxCamera` / `useMxRouteTransition`
- 配置辅助：`defineMixinNuxtOptions`

## 兼容策略

1. `v0.1.x` 仅增加可选参数，不移除/重命名现有字段。
2. 事件语义不变，新增事件只能追加。
3. 组件名与 composable 名不变。
