# Multi-Agent Network Orchestration - Mermaid

The Mermaid project uses a collaborative network of specialized AI agents. This document describes how they work together to ensure high-quality, documented, and architecturally sound development in this JS/TS monorepo.

## Agent Roles

| Agent | Responsibility | Key Artifacts |
| :--- | :--- | :--- |
| **Lead Dev** | Orchestration, task breakdown, prioritization. | `task.md`, `walkthrough.md` |
| **Manager** | Strict orchestration, state tracking, and discipline. | `.agents/memory/manager_state.md` |
| **Functional**| Problem definition, acceptance criteria, backlog. | `documentation/enriched_product_backlog.md` |
| **Architect** | High-level design, architectural consistency. | `ARCHITECTURE.md`, Design Patterns |
| **Developer** | Feature implementation, unit testing, bug fixes. | `packages/mermaid/src/`, `packages/mermaid/src/tests/` |
| **Quality** | Static analysis, linting, regression testing. | `pnpm lint`, Vitest results, Cypress reports |
| **Review** | Mandatory code quality and consistency gate. | `git diff`, Technical Debt logs |
| **Documentation**| Knowledge management, user-facing docs, releases. | `docs/`, `documentation/releases/`, CHANGELOG |

## Performance & LLM Routing

To maximize efficiency and reduce costs, the network utilizes strict model delegation:
- **High Reasoning (e.g., Gemini 3 Pro)**: Reserved for `Lead Dev` (breakdown), `Architect` (design), and `Developer` (complex new features).
- **Fast Execution (e.g., Gemini 3 Flash)**: Used for `Quality` (linting/pattern matching), `Documentation` (text-gen), and `Developer` (trivial bugfixes).
- **Context Limiting**: Agents are instructed to strictly limit `view_file` calls to the exact files mentioned in `task.md` by the Lead Dev. Avoid full-project scans unless using a targeted `grep_search`.

## Task Lifecycle (Orchestration Flow)

1. **Ingestion**: The user provides a request.
2. **Skill Discovery (Global Skills)**:
    - Agents check `.agents/skills/` for relevant knowledge domains.
    - Relevant `SKILL.md` files are loaded to guide the planning and execution.
3. **Planning (Lead Dev & Architect)**: 
    - Lead Dev breaks down the task in `task.md`.
    - Architect reviews the proposed changes for consistency.
    - An `implementation_plan.md` is shared with the user for approval.
4. **Execution (Developer)**:
    - Code is written and unit tests are implemented, applying the guidelines from discovered Skills.
5. **Verification (Quality)**:
    - Code is checked for linting and regression using `pnpm lint` and `pnpm test`.
6. **Documentation (Documentation Agent)**:
    - Relevant `.md` files and KIs are updated.
7. **Closing (Lead Dev)**:
    - Final verification and communication to the user via `notify_user`.

## Interaction Principles

- **Single Truth**: `task.md` is the shared source of truth for current progress.
- **Asynchronous Collaboration**: Agents communicate via project artifacts and shared summaries.
- **Human-in-the-Loop**: Major decisions and plans require explicit user approval.
- **Autonomous Execution**: 
    - The user has authorized autonomous execution for non-destructive commands.
    - Agents MUST use `SafeToAutoRun: true` and `// turbo-all` for whitelisted commands defined in `.agents/skills/safe-commands/SKILL.md`.
