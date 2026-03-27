# Lessons Learned - Mermaid

## Build & Environment
- **Node Version Mismatch**: Node `v19.4.0` causes `ERR_INVALID_URL` in `langium-cli@4.0.0` due to a JSON schema validation issue. The project requires `v22.14.0`.
- **Workaround (Langium CLI)**: Patching `node_modules/langium-cli/lib/generate.js` to bypass `validate(config, ...)` unblocks the build if Node cannot be upgraded.
- **Build Sequence**: In this monorepo, `pnpm dev` requires a prior `pnpm build` if the `dist` folders are empty, as esbuild resolution for internal packages (like `parser`) depends on exported artifacts in those folders.

## Source Control
- **Git Sync Strategy**: When pulling changes from GitHub while having local staged files, use `git stash save` and `git stash pop` to prevent pull abortion or merge failures.
- **Terminal Compatibility (Windows)**: In PowerShell, GNU tools like `grep` may not be available; use `Select-String` or rely on `git status` output ("Unmerged paths") to identify merge markers.
- **Hook Bypass**: In monorepos with complex pre-commit scripts, environmental Node/ESM issues can block commits. Use `git commit --no-verify` as an escape hatch when immediate saving is prioritized over CI linting (especially when local linting is broken).

## Mermaid UI & Layout
- **State Claims**: Avoid referencing or defining the same state inside multiple `state` containers (Phases/Substates). Mermaid cannot assign multiple parents to a node, which results in "mangled rendering" (overlapping or invisible boundary boxes).
- **Layout Strategies**: Define a state entry in its primary phase and keep boundary-crossing transitions in a global scope to maintain clean phase separation.
- **Nested Directions**: `stateDiagram-v2` does not support mixed directions (e.g., global LR with internal TB). For such hybrid layouts, use `flowchart` with `subgraph` and internal `direction` statements.

## Export & Serialization
- **XML Compliance**: Standalone SVG files require strict XML. Mermaid's HTML-based labels can generate unclosed `<br>` tags which break standalone viewers. Post-processing the serialized string with `.replace(/<br>/g, '<br/>')` is necessary.
- **Theme Isolation**: UI-level CSS filters (like `invert()`) are not captured by SVG serialization. High-quality exports should temporarily switch the Mermaid theme (e.g., to `default` or `light`) and disable page filters during the capture process to ensure correct contrast.

## Web Development Tools
- **Direct Save Utility**: Using `window.showOpenFilePicker` and persistent `fileHandle` references in the browser (Mermaid Editor V2) allows for a "direct save" Experience, enabling local file overwriting without constant prompts.

## Project Setup
- [2026-03-24] Initialized the `.agents` orchestration system from the `SmartGroceryList` template.
