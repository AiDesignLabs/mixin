# Mixin PRD v0.1（2D/3D 混合 Web 框架）

## 1. 文档信息

- 版本：v0.1
- 状态：Draft
- 更新时间：2026-03-22
- 产出目的：将“2D + 3D 混合网页开发范式”从讨论整理为可执行产品方案

## 2. 背景与机会

当前 Web 设计趋势更强调沉浸感与空间感，但实际落地存在两类断层：

- 纯 3D 方案开发门槛高，难接入传统 HTML 页面内容（文章、表单、SEO 内容）。
- 传统前端栈虽然成熟，但难快速实现高质量 3D 交互体验。

现有生态（Three.js / React Three Fiber / Tres）解决了“3D 能渲染”，但没有系统解决“3D 与 2D 页面结构协同、交互协同、过渡协同”。

## 3. 产品定位

一句话定位：

> 基于 Nuxt + Vue3 的 2D/3D 混合应用框架，让前端开发者用熟悉语法快速构建具有空间感的网站体验。

核心原则：

- 不发明新 DSL，优先沿用 Vue3/Nuxt 语法与工程习惯。
- 先做 2D 主视角增强，再逐步扩展到 3D 主视角应用。
- 先解决工程可落地，再追求风格多样化。

## 4. 目标用户

- A 类：营销官网/品牌站开发者（需要“有质感的 3D 互动”，但不能牺牲开发效率）
- B 类：创意开发者/独立开发者（个人作品集、博客、Demo 展示）
- C 类：前端团队（希望在现有 Nuxt 项目上增量接入 3D 能力）

## 5. 问题定义

用户痛点：

- 3D 场景与 HTML 内容难无缝混排，通常靠大量绝对定位硬拼。
- 相机控制、状态同步、输入冲突（滚动/拖拽/点击）处理复杂。
- 大量 demo 偏炫技，缺少可复用、可维护的业务接入范式。
- AI 生成 UI 视觉质量不稳定，团队缺乏“可复用体验框架”来兜底。

## 6. 产品目标与非目标

### 6.1 目标（v0.1）

- 提供一套可上线的“2D 主 + 3D 增强”开发方案。
- 实现单 canvas 的混合渲染与稳定交互桥接。
- 提供可复用 API 与脚手架，支持从模板快速起站。

### 6.2 非目标（v0.1）

- 不做通用 3D 编辑器。
- 不做全行业游戏引擎能力。
- 不承诺复杂 CAD/BIM 级场景。

## 7. 核心场景

- 场景 1：品牌官网首屏，HTML 文案 + 可交互 3D 产品模型
- 场景 2：内容页中插入 3D 模块，点击聚焦后展示 2D 信息面板
- 场景 3：案例/作品集，支持滚动驱动的相机过渡与章节切换

## 8. 方案概述

产品形态由四部分组成：

- `@mixin/nuxt`：Nuxt 模块（约定、构建、运行时注入）
- `@mixin/runtime`：2D/3D 场景调度与交互桥
- `@mixin/components`：高频 UI/3D 组合组件
- `create-mixin`：脚手架与官方模板

## 9. 功能范围（MVP）

### 9.1 开发者接口

- 页面级容器：`<MxScene>`
- 3D 区域：`<MxWorld>`
- 2D 覆层：`<MxOverlay>`
- 锚点绑定：`<MxAnchor target="nodeId">...</MxAnchor>`
- 相机预设与过渡：`useMxCamera().focusTo(...)`
- 路由联动：`useMxRouteTransition()`

### 9.2 运行时能力

- 单 canvas 统一渲染（避免多 canvas 合成复杂度）
- HTML 与 3D 节点坐标映射
- 输入事件仲裁（滚动/拖拽/点击优先级）
- 视角过渡（Orbit/Fixed/Section-based）
- 性能保护（降级策略、静态帧回退、按需渲染）

### 9.3 工程能力

- Nuxt 即插即用初始化
- 模型资源加载管线（glTF 基础能力）
- 内置模板：Landing、Portfolio、Product Showcase
- 基础埋点：FPS、LCP、交互耗时

## 10. API 草案（示例）

```vue
<template>
  <MxScene>
    <MxWorld :camera="camera">
      <MxModel id="shoe" src="/models/shoe.glb" @click="focusShoe" />
    </MxWorld>

    <MxOverlay>
      <MxAnchor target="shoe">
        <ProductCard v-if="showCard" />
      </MxAnchor>
    </MxOverlay>
  </MxScene>
</template>

<script setup lang="ts">
const { focusTo } = useMxCamera();
const showCard = ref(false);

function focusShoe() {
  focusTo("shoe", { duration: 900, easing: "easeInOutCubic" });
  showCard.value = true;
}
</script>
```

## 11. 分阶段路线图

### Phase 1（MVP）

- 目标：2D 主视角 + 3D 插入增强
- 交付：Nuxt 模块、核心组件、3 个官方模板、文档站

### Phase 2

- 目标：更稳定的章节式相机叙事与滚动驱动动画
- 交付：时间轴系统、状态机、更多过渡预设

### Phase 3

- 目标：3D 主视角 + 2D 信息层切换
- 交付：场景导航、兴趣点系统、复杂交互示例

## 12. 成功指标（首个版本）

- 体验指标：中端设备关键页面稳定 55+ FPS
- 效率指标：从脚手架到可展示 demo ≤ 1 天
- 采用指标：首批 3 个真实案例站点落地
- 质量指标：核心 API 文档覆盖率 100%

## 13. 风险与应对

- 风险：视觉审美不足导致 demo 说服力不够  
  应对：模板先行 + 邀请 UI/动效合作者共建展示案例

- 风险：性能不稳定影响体验  
  应对：预设性能预算、设备分级策略、默认降级开关

- 风险：API 过重导致学习成本高  
  应对：先收敛到最小原语，复杂能力通过组合扩展

## 14. 当前决策结论（来自讨论）

- 先做方向 1，再做方向 2。
- 技术路线：Nuxt + Vue3 + three.js（可复用 Tres 生态经验）。
- 不做新语法，采用 Vue3 超集思路（宏/指令只做增强）。
- 首要价值是“让 2D 与 3D 混合开发简单且稳定”。

## 15. 下一步执行清单

- 明确仓库包结构：`@mixin/nuxt`、`@mixin/runtime`、`@mixin/components`
- 输出最小可运行 demo（Landing 场景）
- 定义首批 API 的类型与示例
- 建立文档站与示例站联动发布流程
