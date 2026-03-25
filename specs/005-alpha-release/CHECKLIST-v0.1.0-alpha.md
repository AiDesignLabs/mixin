# v0.1.0-alpha 发布前检查清单

更新时间：2026-03-25

## 1. 分支与变更检查

1. 当前分支仅包含本次 alpha 相关变更。
2. 无未预期的本地脏改动（`git status` 可解释）。
3. PR 已通过 review（至少 1 位）。

## 2. 质量门禁

1. `vp check` 通过。
2. `vp run -r build` 通过。
3. `vp run -r test` 通过。
4. `vp run ci` 通过。

## 3. 文档与脚手架

1. API 冻结文档已更新：
   - `specs/004-phase1-api/API-v1.md`
2. 使用手册已更新：
   - `specs/004-phase1-api/PLAYBOOK-v1.md`
3. 脚手架模板可生成：
   - `create-mixin demo --template=embed-2d`
   - `create-mixin demo --template=world-3d`

## 4. 版本与标签策略

1. 当前基线版本为 `0.0.0`。
2. alpha 推荐 bump 方式：`prerelease + preid=alpha`。
3. 本地可执行：
   - `vp run release:alpha`
4. CI 发布可执行：
   - push 到 `main/master` 自动触发 `Release Alpha` workflow。
   - 如需手动兜底，可 `workflow_dispatch` 触发同一 workflow。

## 5. 发布后核对

1. Git 标签创建成功（如 `v0.0.1-alpha.0`）。
2. GitHub prerelease 已创建且正文完整。
3. Release notes 至少包含：
   - 交互 Demo 升级
   - API 冻结范围
   - 脚手架模板更新
   - 已知限制（如 chunk size warning）

## 6. 回滚预案

1. 若发布后出现阻塞问题，立即标记 release 为 draft / add warning。
2. 在主分支追加 hotfix，生成下一个 alpha 标签。
