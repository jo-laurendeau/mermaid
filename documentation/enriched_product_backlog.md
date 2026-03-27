## Visual WYSIWYG Upgrade
- **Problem**: The initial prototype lacks bi-directional sync, advanced link handling, and professional export options.
- **Expected Results**: A full-featured visual editor that feels like a professional diagramming tool.
- **Functional Requirements**:
  - [ ] Anchored links (move with nodes, detachable).
  - [ ] Edge labels (text on links).
  - [ ] Prevent global text selection on drag.
  - [ ] Bi-directional sync (Code <-> Visual).
  - [ ] Automatic link routing.
  - [ ] Multi-theme support with high readability.
  - [ ] Exports: Image (PNG/SVG) and `.md` file.
- **Indicators**:
  - 🔴 **Complexité** : 9 (Bi-directional sync is difficult with Mermaid).
  - ⚠️ **Risque / Impact Structurel** : 2 (Major UI update).
  - ⭐ **Intérêt Utilisateur** : 10 (Critical for usability).

## Radical Engine Compaction (Phase 3)
- **Problem**: Default layouts (Dagre) use excessive whitespace, preventing large state diagrams from fitting A4 landscape without collisions. Hardcoded engine constants (padding, ranksep increments) neutralize configuration-level tweaks.
- **Expected Results**: A "zero-waste" layout engine that packs elements tightly for landscape rendering.
- **Functional Requirements**:
  - [ ] Correct 'Unified V4.1' template mapping in Editor V2 (must point to source file).
  - [ ] Eliminate hardcoded 8px margins/padding in core renderer.
  - [ ] Remove cluster `ranksep` recursive increments (+10px).
  - [ ] Set aggressive default spacing (5px rank/node spacing) for `stateDiagram-v2`.
- **Indicators**:
  - 🟠 **Complexité** : 6 (Requires deep engine level changes).
  - 🔴 **Risque / Impact Structurel** : 8 (Affects global layout logic).
  - ⭐ **Intérêt Utilisateur** : 10 (Critical for business process visualization).
