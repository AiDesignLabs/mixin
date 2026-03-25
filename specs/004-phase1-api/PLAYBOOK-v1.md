# Mixin 使用手册（Phase 1）

## 从 0 跑起来

1. 安装依赖：`vp install`
2. 启动 demo：`vp run dev`
3. 构建全部：`vp run build`
4. 运行测试：`vp run -r test`

## 相机过渡（focus）

```ts
await focusTo("hero", {
  duration: 900,
  easing: "easeInOutCubic",
});
```

支持：

- 直接传目标 ID
- 直接传 `FocusTarget` 对象

## 3D 锚点 + 2D DOM

```vue
<MxAnchor target="hero" :offset-y="-90">
  <div class="card">跟随 3D 目标</div>
</MxAnchor>
```

`MxAnchor` 实际渲染为普通 DOM，适合承载文本、按钮、表单。

## 常见坑

1. 高度问题  
   `MxScene` 需要可计算高度，外层容器不要只有 `height: 100%`，至少设置 `min-height`。

2. 层级问题  
   默认层级：`MxWorld` 在下层，`MxOverlay`/`MxAnchor` 在上层。不要把覆盖层容器设成低 `z-index`。

3. 交互冲突  
   `MxOverlay` 默认 `pointer-events: none`，仅可交互区域需要 `pointer-events: auto`。

4. 资源加载失败  
   远程 GLB 失败时，可先启用 `showDemoCube` 作为可交互回退目标。

5. 自动导入冲突  
   不要同时启用多套同名 auto-import 规则，优先保持单一入口，避免重复导入告警。

## 推荐交互基线（Phase 1）

1. 至少两个可点击 3D 目标（支持视角跳转）
2. 至少一个 2D 锚点卡片（跟随 3D）
3. 支持拖拽环绕 + 滚轮缩放
4. 有状态面板（当前视角、模型加载状态、相机参数）
