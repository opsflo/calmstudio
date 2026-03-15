# Requirements: CalmStudio

**Defined:** 2026-03-15
**Core Value:** Make architecture diagrams the source of truth — draw visually, get validated architecture-as-code automatically, and let AI tools generate architectures via MCP.

## v1.1 Requirements

Requirements for v1.1 Distribution & Developer Experience milestone.

### Documentation & Publish

- [ ] **DOCS-01**: Docusaurus site with getting started guide, architecture overview, and API reference
- [ ] **DOCS-02**: Architecture Decision Records (ADRs) for key v1.0 decisions
- [ ] **DOCS-03**: Extension pack development guide (create custom packs)
- [ ] **DOCS-04**: MCP server usage guide for AI tool integration
- [ ] **DOCS-05**: Contributor guide (setup, testing, PR workflow, DCO)
- [ ] **CORE-01**: `@calmstudio/calm-core` published to npm with README, API docs, and independent versioning

### Desktop App

- [ ] **DESK-01**: Tauri 2 app builds and runs on macOS, Windows, and Linux
- [ ] **DESK-02**: Native file open/save dialogs for .calm.json files
- [ ] **DESK-03**: App works fully offline with no network requests for core functionality

### VS Code Extension

- [ ] **VSCE-01**: Live read-only CALM architecture diagram preview in VS Code webview panel
- [ ] **VSCE-02**: Preview auto-updates when .calm.json file is saved
- [ ] **VSCE-03**: Auto-registers @calmstudio/mcp server for Copilot/Claude Code in VS Code
- [ ] **VSCE-04**: "Open in CalmStudio" button launches desktop app or web URL with current file
- [ ] **VSCE-05**: Extension installable from VS Code Marketplace

### GitHub Action

- [ ] **GHAC-01**: GitHub Action renders CALM architecture diagrams as SVG images in PR comments

### Web Component

- [ ] **WEBC-01**: `<calm-diagram>` web component renders any CALM JSON with a single HTML tag
- [ ] **WEBC-02**: Web component installable via npm and usable in any framework

### Flow Visualization

- [ ] **FLOW-01**: Flow visualization shows data flows as stepped overlays on architecture edges

## Deferred

- **calmscript DSL** — MCP server solves AI generation more reliably; evaluate need after real-world MCP usage
- **Pattern library** — templates partially address this (6 FluxNova templates shipped in v1.0)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Full canvas editing in VS Code | CalmStudio is the design surface; VS Code is preview + MCP bridge |
| Real-time multi-user collaboration | v2+ |
| Community extension pack marketplace | v2+ |
| Mobile app | Web + desktop sufficient for v1.1 |
| CalmScript syntax highlighting in VS Code | DSL deferred; VS Code extension previews CALM JSON not calmscript |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| DOCS-01 | Phase 10 | Pending |
| DOCS-02 | Phase 10 | Pending |
| DOCS-03 | Phase 10 | Pending |
| DOCS-04 | Phase 10 | Pending |
| DOCS-05 | Phase 10 | Pending |
| CORE-01 | Phase 10 | Pending |
| DESK-01 | Phase 11 | Pending |
| DESK-02 | Phase 11 | Pending |
| DESK-03 | Phase 11 | Pending |
| VSCE-01 | Phase 12 | Pending |
| VSCE-02 | Phase 12 | Pending |
| VSCE-03 | Phase 12 | Pending |
| VSCE-04 | Phase 12 | Pending |
| VSCE-05 | Phase 12 | Pending |
| GHAC-01 | Phase 12 | Pending |
| WEBC-01 | Phase 13 | Pending |
| WEBC-02 | Phase 13 | Pending |
| FLOW-01 | Phase 13 | Pending |

**Coverage:**
- v1.1 requirements: 18 total
- Mapped to phases: 18
- Unmapped: 0

---
*Requirements defined: 2026-03-15*
