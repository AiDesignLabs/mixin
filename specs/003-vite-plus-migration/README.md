# Vite+ 迁移说明（Monorepo）

本仓库已从 `starry/vite + pnpm 命令` 的维护方式，切换为 `Vite+ (vp)` 统一维护。

## 已完成的改造

1. 根脚本切换到 `vp`：
   - `dev` -> `vp run playground#dev`
   - `build` -> `vp run -r build`
   - `lint` / `lint:fix` -> `vp lint`
   - `check` -> `vp check`
2. 子包脚本切换到 `vp dev/build/preview`，移除安装阶段的 `prepare: starry build`。
3. 所有 `vite.config.ts` / `vitest.config.ts` 已统一为 `from 'vite-plus'`。
4. `playground` 增加 monorepo 源码 alias，开发态直接走各包 `src`，避免依赖 `dist` 产物。
5. TypeScript 基础配置切换：
   - `moduleResolution: bundler`
   - `types: ["node", "vite-plus/client"]`
6. 内部包补齐 `exports["."].types`，修复 bundler 解析下的跨包类型丢失。
7. 移除 `starry` 依赖与 `starry.config.mjs`。

## 当前使用方式

1. 安装依赖：`vp install`
2. 开发 playground：`vp run dev`
3. 构建全部包：`vp run build`
4. 运行测试：`vp run -r test`

## 已验证结果

1. `vp --version` 可识别本地 `vite-plus` 与内置工具链。
2. `vp run -r build` 全部通过。
3. `vp run -r test`（runtime 测试）通过。
4. `vp run playground#dev` 可正常启动开发服务器。

## 备注

1. `vp check` 当前会报大量格式化项（历史文件未按新 formatter 规范整理），可按需执行 `vp check --fix` 统一格式。
2. 安装时会看到部分 `vite` peer warning，这是 `vite-plus-core` 别名化带来的已知现象，不影响当前构建与运行。
