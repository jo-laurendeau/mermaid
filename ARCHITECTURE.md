# Architecture Overview - Mermaid

Mermaid is a monorepo containing various packages for generating diagrams from text.

## Core Structure
- `packages/mermaid`: The main core package.
- `packages/mermaid-zensum`: Zensum parser.
- `demos/`: Interactive demos for testing.
- `docs/`: Project documentation.

## Key Technologies
- **Language**: TypeScript/JavaScript (ESM).
- **Bundler**: Vite / esbuild.
- **Testing**: Vitest (unit), Cypress (e2e).
- **Parser**: Jison (for many diagram types).

## Design Patterns
- **Monorepo**: Managed via `pnpm` workspaces.
- **Plugin Architecture**: Different diagram types (flowchart, sequence, etc.) are implemented as separate modules.
