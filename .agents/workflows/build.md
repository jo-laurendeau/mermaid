---
description: Build/Compile the Mermaid project using pnpm.
---

// turbo-all
1. **Clean & Build**: Clean the project and run the build script.
   `pnpm run clean && pnpm build > logs/build_output.log 2> logs/build_err.log`
2. **Verify Output**: Check `logs/build_output.log` for success and verify the `dist/` folders in workspace packages.
