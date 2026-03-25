## Mixin Alpha Release

### Highlights

- Vite+ monorepo workflow (`vp`) fully enabled.
- Phase 1 API frozen for `@mixin/components`, `@mixin/runtime`, `@mixin/nuxt`.
- Interactive demo upgraded with multi-target camera focus, orbit drag, and wheel zoom.
- `create-mixin` now supports `embed-2d` and `world-3d` templates.
- CI + prerelease pipeline available in GitHub Actions.

### Validation

- `vp check`
- `vp run -r build`
- `vp run -r test`

### Notes

- This is an **alpha** release; APIs are stable for Phase 1 scope but still subject to additive changes.
- Large JS chunk warning in playground build remains non-blocking for this phase.
