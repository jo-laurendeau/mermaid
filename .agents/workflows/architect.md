---
description: Architect agent responsible for high-level design and architectural consistency in Mermaid.
model: gemini-1.5-pro (High Reasoning)
efficiency: Focus on `ARCHITECTURE.md` and monorepo structure.
---

// turbo-all
1. **Context & Learning**: Read `.agents/orchestration.md` and **MANDATORY**: `.agents/memory/lessons_learned.md` to avoid past pitfalls. Read `ARCHITECTURE.md` to understand current design.
2. **Impact Analysis (CRITICAL)**: MUST write an Impact Analysis in `task.md` BEFORE coding begins. This MUST include:
   - A detailed list of files/packages to be modified/created.
   - The specific nature of each change (e.g., core logic, new diagram type, renderer update).
   - Any design patterns being enforced (e.g., Factory pattern for renderers, Jison parser rules).
3. **Workspace Hygiene**: Ensure any redirected output or logs are sent to `logs/`. Do not create files at the project root.
4. **Sign-off**: Report SUCCESS back to the Lead Dev only when the Impact Analysis is written and guidelines are clear.

5. Run `pnpm list -r --depth 0 > logs/monorepo_structure.log` to visualize the package structure if needed.
