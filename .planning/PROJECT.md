# CalmStudio

## What This Is

CalmStudio is a visual-first architecture diagramming tool that generates CALM (Common Architecture Language Model) code. Built with Svelte 5 and Svelte Flow, it combines an intuitive drag-and-drop canvas with a Mermaid-like DSL called calmscript, an MCP server for AI integration, and extension packs for cloud providers (AWS, GCP, Azure), Kubernetes, AI/Agentic systems, and more. It targets everyone who designs software architecture — from startup engineers to enterprise architects at Netflix, Walmart, or Visa scale.

## Core Value

Make architecture diagrams the source of truth: draw visually, get validated architecture-as-code automatically, and let AI tools generate architectures as easily as they generate Mermaid today.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Visual architecture editor built on Svelte Flow with CALM-typed nodes and edges
- [ ] Extension pack system for cloud providers (AWS, GCP, Azure), Kubernetes, AI/Agentic, and custom domains
- [ ] Bidirectional sync between visual diagram and CALM JSON code
- [ ] calmscript DSL — a Mermaid-like text format that compiles losslessly to CALM JSON
- [ ] MCP server enabling Claude Code and other AI tools to create/modify/validate/render architectures
- [ ] Real-time CALM schema validation
- [ ] Desktop app via Tauri 2 with native file system access
- [ ] CALM JSON import with auto-layout (ELK.js) and export
- [ ] Pattern library with templates for common architectures (microservices on K8s, serverless API, RAG pipeline, etc.)
- [ ] Properties panel for editing CALM metadata (interfaces, controls, flows) per node/edge
- [ ] Web component `<calm-diagram>` for universal embedding
- [ ] VS Code extension with live calmscript preview
- [ ] GitHub Action for rendering calmscript in PRs and validating CALM in CI

### Out of Scope

- Excalidraw-based implementation — wrong abstraction for structured architecture diagrams (freehand whiteboard, no typed nodes/edges/containment)
- Real-time multi-user collaboration — deferred to v2+ (Phase 5)
- C4 / ArchiMate import/export — deferred to v2+ (Phase 5)
- Terraform/Pulumi IaC generation — deferred to v2+ (Phase 5)
- Community extension pack marketplace — deferred to v2+ (Phase 5)

## Context

- FINOS maintains CALM (Common Architecture Language Model) — a JSON Schema-based spec for architecture-as-code
- The `architecture-as-code` repo has CLI tools (`calm validate`, `calm generate`, `calm template`, `calm docify`), CALM Hub (Java Quarkus backend), CALM AI (Copilot/Kiro prompts), and a VS Code extension
- CALM supports 9 built-in node types (actor, system, service, database, network, webclient, ecosystem, ldap, data-asset) plus custom types (any string)
- CALM supports 5 relationship types: connects, interacts, deployed-in, composed-of, options
- CALM supports interfaces (URL, host-port, container-image, etc.), controls (security, compliance, performance), flows, and metadata
- CALM JSON is verbose (462 lines for 5 nodes) — too heavy for AI inline generation; calmscript solves this
- Existing `calm-widgets` already generate Mermaid from CALM models, proving the rendering bridge works
- `calm-models/src/types/core-types.ts` and `calm-widgets/src/widgets/block-architecture/core/vm-builder.ts` provide reference implementations for CALM-to-graph conversion
- Mermaid dominates AI-generated diagrams because of simplicity — calmscript must match that simplicity while adding architecture semantics
- Svelte Flow (@xyflow/svelte) provides native Svelte 5 node-graph editing with custom nodes, typed handles, sub-flows (containment), and ELK layout — exactly what CALM needs

## Constraints

- **Framework**: Svelte 5 + SvelteKit — chosen for performance, DX, and Svelte Flow compatibility
- **Canvas**: @xyflow/svelte (Svelte Flow) — node-graph editor, NOT freehand drawing
- **Desktop**: Tauri 2 — lighter than Electron, Rust backend, cross-platform
- **Data format**: CALM JSON as canonical source of truth (FINOS standard)
- **CALM compatibility**: All output must validate against `calm validate` — extension packs use custom node types, not schema modifications
- **AI integration**: MCP server for Claude Code; calmscript format must be AI-generatable in ~20 lines for typical architectures

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Drop Excalidraw, use Svelte Flow | Excalidraw is a freehand whiteboard; CALM needs typed nodes, containment, handles, typed edges — all native in Svelte Flow | — Pending |
| Svelte 5 over React | Not locked to Excalidraw's React; Svelte 5 is lighter, faster, better DX for this use case | — Pending |
| Create calmscript DSL | CALM JSON too verbose for AI; need Mermaid-competitive text format (~20 lines vs 462) | — Pending |
| Extension packs for cloud/K8s/AI | CALM's 9 built-in types insufficient for universal adoption; packs add AWS/GCP/Azure/K8s/AI vocabulary without changing CALM spec | — Pending |
| MCP server as primary AI integration | Makes CalmStudio the native architecture tool for Claude Code and other AI assistants | — Pending |
| Tauri 2 for desktop | Smaller bundle than Electron, Rust backend, native file system, cross-platform | — Pending |
| ELK.js for auto-layout | Hierarchical layout with orthogonal routing — standard for architecture diagrams | — Pending |

---
*Last updated: 2026-03-11 after initialization*
