# Requirements: CalmStudio

**Defined:** 2026-03-11
**Core Value:** Make architecture diagrams the source of truth — draw visually, get validated CALM code automatically, let AI generate architectures as easily as Mermaid.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Canvas Core

- [x] **CANV-01**: User can drag CALM-typed nodes from a palette onto a canvas
- [ ] **CANV-02**: User can draw typed edges between nodes (connects, interacts, deployed-in, composed-of)
- [ ] **CANV-03**: User can select, multi-select, move, resize, and delete nodes and edges
- [ ] **CANV-04**: User can zoom, pan, and navigate the canvas with trackpad/mouse
- [x] **CANV-05**: User can undo/redo any canvas or code action (unlimited history)
- [x] **CANV-06**: User can use keyboard shortcuts for common actions (Cmd+Z, Cmd+S, Delete, spacebar-pan)
- [x] **CANV-07**: User can copy/paste nodes with new unique-ids auto-generated
- [x] **CANV-08**: User can search/filter nodes by name, type, or ID
- [x] **CANV-09**: User can toggle dark mode and light mode (system preference detection)

### CALM Nodes & Relationships

- [x] **CALM-01**: All 9 CALM node types rendered as distinct custom Svelte components (actor, system, service, database, network, webclient, ecosystem, ldap, data-asset)
- [x] **CALM-02**: Custom node types supported (any string) rendered via GenericNode component
- [x] **CALM-03**: All 5 CALM relationship types rendered as distinct edge styles (connects, interacts, deployed-in, composed-of, options)
- [x] **CALM-04**: CALM interfaces rendered as typed handles on node edges
- [x] **CALM-05**: Containment relationships (deployed-in, composed-of) rendered as Svelte Flow sub-flows with parent-child constraints
- [x] **CALM-06**: Protocol labels displayed on connects edges (HTTPS, JDBC, mTLS, etc.)

### Properties & Metadata

- [x] **PROP-01**: User can edit CALM metadata for selected node (unique-id, name, description, node-type)
- [x] **PROP-02**: User can add/edit/remove interfaces on a node (URL, host-port, container-image, port, etc.)
- [x] **PROP-03**: User can add/edit/remove CALM controls on nodes and edges (security, compliance, performance)
- [x] **PROP-04**: User can add custom metadata key-value pairs to any node or edge
- [x] **PROP-05**: User can edit relationship properties (type, protocol, description, source/destination interfaces)

### Bidirectional Sync

- [x] **SYNC-01**: Diagram changes automatically update CALM JSON in real-time (forward sync)
- [x] **SYNC-02**: CALM JSON edits in code panel automatically update the diagram (reverse sync)
- [x] **SYNC-03**: Sync engine prevents infinite loops via direction mutex
- [x] **SYNC-04**: CALM JSON is the single canonical source of truth; visual state is derived

### Code Editor

- [x] **CODE-01**: User can view and edit CALM JSON in a CodeMirror panel alongside the canvas
- [x] **CODE-02**: User can toggle between CALM JSON and calmscript views
- [x] **CODE-03**: Code panel has syntax highlighting, line numbers, and error indicators

### calmscript DSL

- [ ] **CSPT-01**: calmscript text format compiles losslessly to CALM JSON
- [ ] **CSPT-02**: CALM JSON serializes losslessly to calmscript (round-trip guaranteed)
- [ ] **CSPT-03**: calmscript supports all CALM concepts (nodes, relationships, interfaces, controls, flows, metadata)
- [ ] **CSPT-04**: calmscript supports extension pack imports (`@use aws, kubernetes`)
- [ ] **CSPT-05**: calmscript syntax highlighting in CodeMirror with error reporting
- [ ] **CSPT-06**: Typical 5-node architecture expressible in ~20 lines of calmscript

### Validation

- [ ] **VALD-01**: Real-time CALM schema validation with inline error indicators on offending nodes/edges
- [ ] **VALD-02**: Validation results displayed in dedicated panel with severity (error, warning, info)
- [ ] **VALD-03**: Validation runs on debounced changes (not blocking the UI)

### Import & Export

- [x] **IOEX-01**: User can import existing CALM JSON files and auto-layout the diagram (ELK.js)
- [ ] **IOEX-02**: User can export diagram as CALM JSON
- [ ] **IOEX-03**: User can export diagram as calmscript
- [ ] **IOEX-04**: User can export diagram as SVG (vector, crisp)
- [ ] **IOEX-05**: User can export diagram as PNG
- [x] **IOEX-06**: User can save/load diagrams via native file system (Tauri 2)

### Layout

- [x] **LAYT-01**: User can auto-layout the diagram using ELK.js hierarchical layout
- [x] **LAYT-02**: Auto-layout preserves manual position overrides for pinned nodes
- [x] **LAYT-03**: Layout presets available (hierarchical, left-to-right, top-to-bottom)

### Extension Packs

- [ ] **EXTK-01**: Extension pack system loads node types, icons, colors, and default handles dynamically
- [ ] **EXTK-02**: Core pack ships with all 9 CALM node types
- [ ] **EXTK-03**: AWS pack ships with top 20 AWS service types (Lambda, S3, DynamoDB, ECS, EKS, SQS, API Gateway, RDS, etc.)
- [ ] **EXTK-04**: Kubernetes pack ships with core K8s resources (Pod, Deployment, Service, Ingress, ConfigMap, etc.)
- [ ] **EXTK-05**: AI/Agentic pack ships with AI architecture types (LLM, Agent, Orchestrator, Vector Store, Tool, Memory, Guardrail)
- [ ] **EXTK-06**: GCP pack ships with top 15 GCP service types
- [ ] **EXTK-07**: Azure pack ships with top 15 Azure service types
- [ ] **EXTK-08**: Node palette organizes types by extension pack with search/filter

### MCP Server

- [ ] **MCPS-01**: MCP server exposes `create_architecture` tool (description -> calmscript + CALM JSON)
- [ ] **MCPS-02**: MCP server exposes `add_node` and `add_relationship` tools
- [ ] **MCPS-03**: MCP server exposes `validate_architecture` tool
- [ ] **MCPS-04**: MCP server exposes `render_diagram` tool (-> SVG)
- [ ] **MCPS-05**: MCP server exposes `export_calm` and `import_calm` tools
- [ ] **MCPS-06**: MCP server installable via `npm install -g @calmstudio/mcp`
- [ ] **MCPS-07**: MCP server works with Claude Code and any MCP-compatible AI assistant

### Desktop App

- [ ] **DESK-01**: Desktop app built with Tauri 2, runs on macOS, Windows, Linux
- [ ] **DESK-02**: Native file open/save dialogs for .calm and .calmscript files
- [ ] **DESK-03**: Desktop app works fully offline

### Pattern Library

- [ ] **PATN-01**: User can browse architecture patterns organized by category
- [ ] **PATN-02**: User can instantiate a pattern as an editable diagram with auto-layout
- [ ] **PATN-03**: Bundled patterns include: aws/microservices-eks, aws/serverless-api, kubernetes/standard-deployment, ai/rag-pipeline, ai/multi-agent

### FINOS Governance

- [ ] **GOVN-01**: Apache 2.0 license with SPDX headers on all source files
- [ ] **GOVN-02**: DCO (Developer Certificate of Origin) sign-off on every commit, enforced by CI
- [ ] **GOVN-03**: CONTRIBUTING.md with DCO process, conventional commits guide, and contributor workflow
- [ ] **GOVN-04**: CODE_OF_CONDUCT.md referencing FINOS community standard
- [ ] **GOVN-05**: SECURITY.md with vulnerability disclosure policy
- [ ] **GOVN-06**: NOTICE file with third-party attribution
- [ ] **GOVN-07**: MAINTAINERS.md with project governance
- [ ] **GOVN-08**: All dependencies OSS-compatible with Apache 2.0

### Testing

- [ ] **TEST-01**: London School TDD — outside-in test development for all features
- [ ] **TEST-02**: Unit tests for sync engine, CALM model, calmscript parser, validation (vitest)
- [ ] **TEST-03**: Integration tests for bidirectional sync, MCP server tools, extension pack loading
- [ ] **TEST-04**: E2E tests for full user workflows (Playwright) — create diagram, edit code, export, import
- [ ] **TEST-05**: Component tests for all custom Svelte node/edge components (@testing-library/svelte)

### CI/CD Pipeline

- [x] **CICD-01**: GitHub Actions: build, lint, test on every PR
- [x] **CICD-02**: DCO verification check on all PRs
- [x] **CICD-03**: License scanning for Apache 2.0 compatibility
- [x] **CICD-04**: CVE scanning with OWASP Dependency-Check
- [ ] **CICD-05**: Conventional commits enforcement (commitlint + husky)
- [x] **CICD-06**: Semantic release for automated versioning and changelog

### Documentation

- [ ] **DOCS-01**: Docusaurus site with architecture overview, getting started guide, API reference
- [ ] **DOCS-02**: Architecture Decision Records (ADRs) tracked in docs/ and .planning/
- [ ] **DOCS-03**: calmscript language reference with examples
- [ ] **DOCS-04**: Extension pack development guide
- [ ] **DOCS-05**: MCP server usage guide for AI tool integration
- [ ] **DOCS-06**: Contributor guide (setup, testing, PR workflow, DCO)

### Ecosystem (v1 stretch)

- [ ] **ECOS-01**: VS Code extension with calmscript syntax highlighting and live preview
- [ ] **ECOS-02**: GitHub Action to validate CALM and render calmscript diagrams on PRs
- [ ] **ECOS-03**: `<calm-diagram>` web component for embedding in any web page
- [ ] **ECOS-04**: Flow visualization as stepped/animated overlays on architecture diagram

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Collaboration

- **COLB-01**: Real-time multi-user collaboration via WebSocket/CRDT
- **COLB-02**: Presence indicators showing who is editing what

### Interoperability

- **INTR-01**: C4 model import/export
- **INTR-02**: ArchiMate import
- **INTR-03**: Terraform/Pulumi IaC generation from CALM

### Ecosystem v2

- **ECO2-01**: Community extension pack marketplace (publish/install packs)
- **ECO2-02**: Multi-view support (context, container, component diagrams from same CALM)
- **ECO2-03**: Timeline/evolution view (CALM timeline support)
- **ECO2-04**: Git-aware architecture diffing (visual diff between commits)
- **ECO2-05**: CALM Hub integration (browse/publish to architecture repository)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Freehand drawing / whiteboard mode | Destroys typed-node guarantee; corrupts CALM model |
| UML/ArchiMate/C4 import (v1) | Lossy translation; each notation has different metamodel |
| Terraform/Pulumi generation (v1) | Diagrammatic intent != IaC specifics; dangerous if incorrect |
| AI autocomplete for every action | Breaks flow; most suggestions wrong for specific context |
| Infinite shape customization (CSS per node) | Non-portable diagrams; breaks extension pack icon sets |
| Diagram versioning inside CalmStudio | Reinventing git; CALM JSON lives in VCS natively |
| Excalidraw-based implementation | Wrong abstraction — freehand whiteboard, not structured graph editor |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| GOVN-01 | Phase 1 | Pending |
| GOVN-02 | Phase 1 | Pending |
| GOVN-03 | Phase 1 | Pending |
| GOVN-04 | Phase 1 | Pending |
| GOVN-05 | Phase 1 | Pending |
| GOVN-06 | Phase 1 | Pending |
| GOVN-07 | Phase 1 | Pending |
| GOVN-08 | Phase 1 | Pending |
| CICD-01 | Phase 1 | Complete |
| CICD-02 | Phase 1 | Complete |
| CICD-03 | Phase 1 | Complete |
| CICD-04 | Phase 1 | Complete |
| CICD-05 | Phase 1 | Pending |
| CICD-06 | Phase 1 | Complete |
| CANV-01 | Phase 2 | Complete |
| CANV-02 | Phase 2 | Pending |
| CANV-03 | Phase 2 | Pending |
| CANV-04 | Phase 2 | Pending |
| CANV-05 | Phase 2 | Complete |
| CANV-06 | Phase 2 | Complete |
| CANV-07 | Phase 2 | Complete |
| CANV-08 | Phase 2 | Complete |
| CANV-09 | Phase 2 | Complete |
| CALM-01 | Phase 2 | Complete |
| CALM-02 | Phase 2 | Complete |
| CALM-03 | Phase 2 | Complete |
| CALM-04 | Phase 2 | Complete |
| CALM-05 | Phase 2 | Complete |
| CALM-06 | Phase 2 | Complete |
| PROP-01 | Phase 3 | Complete |
| PROP-02 | Phase 3 | Complete |
| PROP-03 | Phase 3 | Complete |
| PROP-04 | Phase 3 | Complete |
| PROP-05 | Phase 3 | Complete |
| SYNC-01 | Phase 3 | Complete |
| SYNC-02 | Phase 3 | Complete |
| SYNC-03 | Phase 3 | Complete |
| SYNC-04 | Phase 3 | Complete |
| CODE-01 | Phase 3 | Complete |
| CODE-02 | Phase 3 | Complete |
| CODE-03 | Phase 3 | Complete |
| IOEX-01 | Phase 4 | Complete |
| IOEX-02 | Phase 4 | Pending |
| IOEX-03 | Phase 4 | Pending |
| IOEX-04 | Phase 4 | Pending |
| IOEX-05 | Phase 4 | Pending |
| IOEX-06 | Phase 4 | Complete |
| LAYT-01 | Phase 4 | Complete |
| LAYT-02 | Phase 4 | Complete |
| LAYT-03 | Phase 4 | Complete |
| CSPT-01 | Phase 5 | Pending |
| CSPT-02 | Phase 5 | Pending |
| CSPT-03 | Phase 5 | Pending |
| CSPT-04 | Phase 5 | Pending |
| CSPT-05 | Phase 5 | Pending |
| CSPT-06 | Phase 5 | Pending |
| VALD-01 | Phase 6 | Pending |
| VALD-02 | Phase 6 | Pending |
| VALD-03 | Phase 6 | Pending |
| EXTK-01 | Phase 7 | Pending |
| EXTK-02 | Phase 7 | Pending |
| EXTK-03 | Phase 7 | Pending |
| EXTK-04 | Phase 7 | Pending |
| EXTK-05 | Phase 7 | Pending |
| EXTK-06 | Phase 7 | Pending |
| EXTK-07 | Phase 7 | Pending |
| EXTK-08 | Phase 7 | Pending |
| MCPS-01 | Phase 8 | Pending |
| MCPS-02 | Phase 8 | Pending |
| MCPS-03 | Phase 8 | Pending |
| MCPS-04 | Phase 8 | Pending |
| MCPS-05 | Phase 8 | Pending |
| MCPS-06 | Phase 8 | Pending |
| MCPS-07 | Phase 8 | Pending |
| DESK-01 | Phase 9 | Pending |
| DESK-02 | Phase 9 | Pending |
| DESK-03 | Phase 9 | Pending |
| PATN-01 | Phase 10 | Pending |
| PATN-02 | Phase 10 | Pending |
| PATN-03 | Phase 10 | Pending |
| DOCS-01 | Phase 10 | Pending |
| DOCS-02 | Phase 10 | Pending |
| DOCS-03 | Phase 10 | Pending |
| DOCS-04 | Phase 10 | Pending |
| DOCS-05 | Phase 10 | Pending |
| DOCS-06 | Phase 10 | Pending |
| TEST-01 | Phase 11 | Pending |
| TEST-02 | Phase 11 | Pending |
| TEST-03 | Phase 11 | Pending |
| TEST-04 | Phase 11 | Pending |
| TEST-05 | Phase 11 | Pending |
| ECOS-01 | Phase 12 | Pending |
| ECOS-02 | Phase 12 | Pending |
| ECOS-03 | Phase 12 | Pending |
| ECOS-04 | Phase 12 | Pending |

**Coverage:**
- v1 requirements: 79 total
- Mapped to phases: 79
- Unmapped: 0

---
*Requirements defined: 2026-03-11*
*Last updated: 2026-03-11 after roadmap creation — 79/79 requirements mapped across 12 phases*
