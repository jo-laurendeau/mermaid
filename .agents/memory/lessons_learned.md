# Lessons Learned - Mermaid

## Build & Environment
- **Node Version Mismatch**: Node `v19.4.0` causes `ERR_INVALID_URL` in `langium-cli@4.0.0` due to a JSON schema validation issue. The project requires `v22.14.0`.
- **Workaround (Langium CLI)**: Patching `node_modules/langium-cli/lib/generate.js` to bypass `validate(config, ...)` unblocks the build if Node cannot be upgraded.
- **Build Sequence**: In this monorepo, `pnpm dev` requires a prior `pnpm build` if the `dist` folders are empty, as esbuild resolution for internal packages (like `parser`) depends on exported artifacts in those folders.

## Project Setup
- [2026-03-24] Initialized the `.agents` orchestration system from the `SmartGroceryList` template.
