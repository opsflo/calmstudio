# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-11)

**Core value:** Make architecture diagrams the source of truth — draw visually, get validated CALM code automatically, let AI generate architectures as easily as Mermaid.
**Current focus:** Phase 1 — Foundation & Governance

## Current Position

Phase: 1 of 12 (Foundation & Governance)
Plan: 0 of TBD in current phase
Status: Ready to plan
Last activity: 2026-03-11 — Roadmap created; 79 v1 requirements mapped across 12 phases

Progress: [░░░░░░░░░░] 0%

## Performance Metrics

**Velocity:**
- Total plans completed: 0
- Average duration: -
- Total execution time: -

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| - | - | - | - |

**Recent Trend:**
- Last 5 plans: -
- Trend: -

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Pre-Phase 1]: Use Svelte 5 + @xyflow/svelte — not Excalidraw; typed-node graph editor required
- [Pre-Phase 1]: CALM JSON is the single canonical source of truth; all other representations derived
- [Pre-Phase 1]: calmscript uses two-layer parsing: Lezer for CodeMirror highlighting, Chevrotain for runtime compilation
- [Pre-Phase 1]: Extension pack metadata goes in `.calmstudio.json` sidecar — never embedded in `.calm` JSON
- [Pre-Phase 1]: MCP server uses stdio transport (Claude Code compatible); file-based state sharing with frontend in v1

### Pending Todos

None yet.

### Blockers/Concerns

- [Research]: calmscript grammar specifics for all 5 CALM relationship types and their sub-properties have no prior art — grammar spike recommended before Phase 5 planning
- [Research]: File watch latency for MCP-to-frontend state sharing on Windows needs empirical validation — Tauri IPC channel is the fallback (address before Phase 8)
- [Research]: VS Code extension — audit existing `calm` Marketplace extension before Phase 12 to determine extend vs rebuild

## Session Continuity

Last session: 2026-03-11
Stopped at: Roadmap created — 12 phases, 79/79 requirements mapped
Resume file: None
