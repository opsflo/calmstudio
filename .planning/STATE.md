---
gsd_state_version: 1.0
milestone: v1.1
milestone_name: Distribution & Developer Experience
status: executing
stopped_at: Completed Phase 11 — Tauri 2 desktop app with native file I/O, menu, sidecar, CI
last_updated: "2026-03-15T12:00:00.000Z"
last_activity: "2026-03-15 — completed Phase 11: Tauri desktop app, all 3 plans done, checkpoint approved"
progress:
  total_phases: 4
  completed_phases: 2
  total_plans: 6
  completed_plans: 6
  percent: 50
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-15)

**Core value:** Make architecture diagrams the source of truth — draw visually, get validated CALM code automatically, let AI generate architectures via MCP.
**Current focus:** Phase 12 — Developer Tooling (next)

## Current Position

Phase: 11 of 13 (Desktop App) — COMPLETE
Plan: 03 completed (CI workflow + checkpoint approved)
Status: Phase 11 complete — all 3 plans done, Tauri dev build verified
Last activity: 2026-03-15 — completed Phase 11: Tauri desktop app with native file I/O, menu, sidecar, CI

Progress: [█████░░░░░] 50%

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.

- [v1.1 roadmap]: Phase 12 splits user's "Ecosystem" group into Developer Tooling (VS Code + GitHub Action) and Embedding & Visualization (Web Component + Flow Viz) for cleaner delivery boundaries at fine granularity
- [10-01]: AJV is external (not bundled in dist) — consumers install it via package.json dependencies; tsup marks it external
- [10-01]: test-fixtures export removed from calm-core public API — internal-only, not for npm consumers
- [10-01]: release.yml unchanged — pnpm -r run build already covers calm-core now that build script runs tsup
- [Phase 10-docs-package-publish]: Docusaurus docs site scaffolded: typedoc 0.28.x for TS5.9 compat; out: docs/api for correct sidebar IDs; sidebars.ts loads typedoc-sidebar.cjs dynamically
- [10-03]: MADR 4.0 format adopted for ADRs — status/date/decision-makers frontmatter, 3 options, Good/Neutral/Bad consequences
- [10-03]: Contributing guide links to root governance files rather than duplicating content
- [Phase 11-desktop-app]: Tauri shell co-located in apps/studio/src-tauri/ (not separate apps/desktop/)
- [Phase 11-01]: fileHandle type widened to FileSystemFileHandle | string | null for backward compat with Tauri path-as-handle pattern
- [Phase 11-01]: readTextFile mockIPC must return byte array (Array.from Uint8Array), not raw strings — Tauri returns binary bytes
- [Phase 11-02]: MenuHandlers.openFromPath separate from open: dialog-based open and path-based recent file open are different flows
- [Phase 11-02]: plugin-store load() requires defaults field in StoreOptions alongside autoSave — missing defaults causes TypeScript error
- [Phase 11-03]: tauri-plugin-store and tauri-plugin-updater use Builder pattern, not init() — API mismatch from other Tauri plugins
- [Phase 11-03]: Tauri 2.10 requires explicit use tauri::{Emitter, Manager} trait imports for emit() and get_webview_window()
- [Phase 11-03]: externalBin validated at compile time — placeholder sidecar binary needed for local dev builds

### Blockers/Concerns

- [Research]: VS Code extension — audit existing `calm` Marketplace extension before building to determine extend vs rebuild
- [Research]: File watch latency for MCP-to-frontend state sharing on Windows needs empirical validation — Tauri IPC channel is the fallback

### Pending Todos

None yet.

## Session Continuity

Last session: 2026-03-15T12:00:00.000Z
Stopped at: Completed Phase 11 — Tauri 2 desktop app with native file I/O, menu, sidecar, CI
Resume file: None
