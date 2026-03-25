---
description: Quality agent responsible for linting, verification, and regression testing in Mermaid.
---

// turbo-all
1. **Verification**: Run `pnpm lint` and `pnpm test` on the modified packages.
2. **Visual Regression**: If UI changes are involved, check for Cypress test results or run `pnpm cypress`.
3. **Report**: Document verification results in `task.md`.
4. **Handoff**: If verification fails, return to the Developer. If successful, sign off for the Lead Dev.
