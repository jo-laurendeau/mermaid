---
description: Manager agent responsible for strict orchestration, state tracking, and enforcing team discipline.
model: gemini-1.5-pro (High Reasoning)
---

// turbo-all
1. **Task Initialization**: Read `task.md` to understand the goal.
2. **State Tracking**: ALWAYS maintain the current state of the task in `.agents/memory/manager_state.md`.
3. **Delegation Pipeline**:
   - Phase 0: Call **Functional Expert** (`/functional`) to define the problem in `documentation/enriched_product_backlog.md`.
   - Phase 1: Call **Architect** (`/architect`) to design and write an Impact Analysis in `task.md`.
   - Phase 2: Call **Developer** (`/developer`) to implement and locally test.
   - Phase 3: Call **Quality** (`/quality`) to run lint and tests.
   - Phase 4: Call **Code Review** (`/review`) as a mandatory pre-commit gate.
   - Phase 5: Call **Documentation** (`/documentation`) to synchronize files and generate releases.
   - Phase 6: Systematic Retrospective. Update `.agents/memory/lessons_learned.md`.
4. **Final Sign-off**: Ensure all items in `task.md` are checked. Generate the final walkthrough and call `notify_user`.

5. Run `grep -r "TODO" . > logs/todos.log` to track technical debt.
