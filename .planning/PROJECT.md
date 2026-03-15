# CalmStudio

## What This Is

CalmStudio is a visual-first CALM architecture editor. Built with Svelte 5 and Svelte Flow, it provides a drag-and-drop canvas with typed nodes and edges, bidirectional CALM JSON sync, 7 extension packs (AWS, GCP, Azure, K8s, AI/Agentic, FluxNova, Core), an MCP server for AI-assisted architecture generation, AIGF governance scoring, and C4 view mode. It targets architects designing software systems at any scale — from startups to enterprise.

## Core Value

Make architecture diagrams the source of truth: draw visually, get validated architecture-as-code automatically, and let AI tools generate architectures via MCP.

## Requirements

### Validated

- ✓ Visual architecture editor with CALM-typed nodes and edges — v1.0
- ✓ Extension pack system (AWS, GCP, Azure, K8s, AI/Agentic, FluxNova) — v1.0
- ✓ Bidirectional sync between visual diagram and CALM JSON code — v1.0
- ✓ MCP server (21 tools) for AI-assisted architecture generation — v1.0
- ✓ Real-time CALM schema validation with severity panel — v1.0
- ✓ CALM JSON import with ELK.js auto-layout and export (JSON, SVG, PNG) — v1.0
- ✓ Properties panel for editing CALM metadata, interfaces, controls per node/edge — v1.0
- ✓ C4 view mode (Context, Container, Component zoom levels) — v1.0
- ✓ FluxNova templates (6) with controls and data classification — v1.0
- ✓ AIGF governance: 23 risks, 23 mitigations, live scoring, 10 validation rules — v1.0
- ✓ London School TDD with 387 tests (unit, integration, component, E2E) — v1.0
- ✓ FINOS governance (Apache 2.0, DCO, CONTRIBUTING, CODE_OF_CONDUCT, SECURITY) — v1.0
- ✓ CI pipeline (build, lint, test, DCO, license scan, commitlint) — v1.0
- ✓ CALM spec-aligned domain-oriented control keys with AIR-ID mapping — v1.0

## Current Milestone: v1.1 Distribution & Developer Experience

**Goal:** Reach developers where they are — documentation, desktop app, IDE, CI, and web embedding.

**Target features:**
- Documentation site (Docusaurus) with ADRs, guides, and API reference
- `@calmstudio/calm-core` published as standalone npm package
- Desktop app (Tauri 2) for macOS, Windows, Linux with native file dialogs
- VS Code extension with CALM architecture preview
- GitHub Action for rendering CALM diagrams in PRs
- `<calm-diagram>` web component for universal embedding
- Flow visualization as stepped overlays on architecture edges

### Active

- [ ] Docusaurus documentation site (architecture docs, ADRs, API reference, contributor guides)
- [ ] `@calmstudio/calm-core` published as standalone npm package for CalmGuard and community
- [ ] Desktop app via Tauri 2 with native file system access (macOS, Windows, Linux)
- [ ] VS Code extension with CALM architecture preview
- [ ] GitHub Action for rendering CALM architecture diagrams in PRs
- [ ] `<calm-diagram>` web component for universal embedding
- [ ] Flow visualization as stepped overlays on architecture edges

### Deferred

- calmscript DSL — MCP server solves AI generation more reliably; evaluate need after real-world MCP usage
- Pattern library — templates partially address this (6 FluxNova templates shipped in v1.0)

### Out of Scope

- Excalidraw-based implementation — wrong abstraction for structured architecture diagrams
- Real-time multi-user collaboration — v2+
- C4 / ArchiMate import/export — v2+
- Terraform/Pulumi IaC generation — CalmGuard's responsibility
- Community extension pack marketplace — v2+

## Context

- **Shipped v1.0** on 2026-03-15: 30K LOC TypeScript/Svelte, 220 commits, 10 phases
- **Tech stack**: SvelteKit, Svelte Flow, CodeMirror, ELK.js, vitest, Playwright
- **Monorepo**: packages/calm-core, packages/extensions, packages/mcp-server, packages/calmscript (stub), apps/studio
- **FINOS CALM**: https://calm.finos.org/release/1.2/ — JSON Schema-based architecture-as-code
- **FINOS AIGF**: https://air-governance-framework.finos.org/ — AI governance framework
- **Reference impl**: https://github.com/karlmoll/codegen_sandbox/pull/7 — CALM spec maintainer's control alignment
- Control keys follow domain-oriented naming per CALM spec (not framework-prefixed)

## Constraints

- **Framework**: Svelte 5 + SvelteKit
- **Canvas**: @xyflow/svelte (Svelte Flow)
- **Desktop**: Tauri 2
- **Data format**: CALM JSON as canonical source of truth
- **License**: Apache 2.0 with SPDX headers, DCO sign-off
- **Dependencies**: All OSS-compatible with Apache 2.0
- **Testing**: London School TDD, vitest + Playwright
- **Controls**: Domain-oriented keys, no `aigf-*` prefix. Framework IDs in `config-url` only.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Drop Excalidraw, use Svelte Flow | Freehand whiteboard vs typed graph editor | ✓ Good — native containment, handles, typed edges |
| Svelte 5 over React | Lighter, faster, better DX | ✓ Good — runes + Svelte Flow work well |
| Extension packs for cloud/K8s/AI | 9 built-in types insufficient | ✓ Good — 7 packs, 60+ node types |
| MCP server as primary AI integration | Native Claude Code integration | ✓ Good — 21 tools, validated working |
| ELK.js for auto-layout | Hierarchical layout standard | ✓ Good — LR/TB/hierarchical presets |
| Domain-oriented control keys | CALM spec maintainer guidance | ✓ Good — aligned with upstream |
| Defer calmscript DSL | MCP solves AI generation | ⚠️ Revisit — evaluate after MCP usage |
| Tauri 2 for desktop | Lighter than Electron | — Pending (v1.1) |
| Docusaurus for docs | FINOS ecosystem standard | — Pending (v1.1) |

---
*Last updated: 2026-03-15 after v1.1 milestone start*
