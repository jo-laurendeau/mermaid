---
description: Assistant for maintaining project documentation and Knowledge Items (KIs).
---

// turbo-all
1. **Context Verification**: Run `git diff HEAD` or `git status` to see exactly what files changed.
2. **Sync Docs**:
   - Update `ARCHITECTURE.md` for structural changes.
   - Update `documentation/product_description.md` for new features.
   - **Backlog Management**: Update `documentation/enriched_product_backlog.md`.
3. **Dated Release Note**: At each major update, generate a dated summary in `documentation/releases/release_YYYY_MM_DD.md`.
4. **Sign-off**: Report SUCCESS back to the `/manager`.
