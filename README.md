# monorepo template

这是一个 monorepo 模板，用于快速创建一个 monorepo 项目。当前使用 Vite+（`vp`）统一维护开发、构建、测试与依赖管理。

# 主要解决的痛点：

- 用 alias 解决在开发模式启动 playground 时，不会自动编译 packages 的问题。
- 用 typescript config 的 paths、reference、include、baseUrl 等解决子包之间互相依赖

# 常用命令

- `vp install`：安装依赖
- `vp run dev`：启动 playground 开发环境
- `vp run build`：构建所有包
- `vp run check`：执行项目检查

# 产品文档

- [Mixin PRD v0.1](./specs/002-product-prd/PRD-v0.1.md)
- [Mixin ARCH v0.1](./specs/002-product-prd/ARCH-v0.1.md)
- [Mixin Phase 1 执行清单 v0.1](./specs/002-product-prd/PHASE1-TASKS-v0.1.md)
- [Vite+ 迁移说明](./specs/003-vite-plus-migration/README.md)
- [Phase 1 API 冻结文档](./specs/004-phase1-api/API-v1.md)
- [Phase 1 使用手册](./specs/004-phase1-api/PLAYBOOK-v1.md)
- [v0.1.0-alpha 发布检查清单](./specs/005-alpha-release/CHECKLIST-v0.1.0-alpha.md)
