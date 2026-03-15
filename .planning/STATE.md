---
gsd_state_version: 1.0
milestone: v1.1
milestone_name: Distribution & Developer Experience
status: in_progress
stopped_at: Completed 10-01-PLAN.md (calm-core npm package configuration)
last_updated: "2026-03-15"
last_activity: 2026-03-15 — completed 10-01 (calm-core tsup dual build + npm publish config)
progress:
  total_phases: 4
  completed_phases: 0
  total_plans: 1
  completed_plans: 1
  percent: 5
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-15)

**Core value:** Make architecture diagrams the source of truth — draw visually, get validated CALM code automatically, let AI generate architectures via MCP.
**Current focus:** Phase 10 — Docs & Package Publish

## Current Position

Phase: 10 of 13 (Docs & Package Publish)
Plan: 01 completed (calm-core npm package configuration)
Status: In progress — plan 10-01 complete
Last activity: 2026-03-15 — completed 10-01: calm-core tsup dual ESM+CJS build, package.json updated for npm publish

Progress: [█░░░░░░░░░] 5%

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.

- [v1.1 roadmap]: Phase 12 splits user's "Ecosystem" group into Developer Tooling (VS Code + GitHub Action) and Embedding & Visualization (Web Component + Flow Viz) for cleaner delivery boundaries at fine granularity
- [10-01]: AJV is external (not bundled in dist) — consumers install it via package.json dependencies; tsup marks it external
- [10-01]: test-fixtures export removed from calm-core public API — internal-only, not for npm consumers
- [10-01]: release.yml unchanged — pnpm -r run build already covers calm-core now that build script runs tsup

### Blockers/Concerns

- [Research]: VS Code extension — audit existing `calm` Marketplace extension before building to determine extend vs rebuild
- [Research]: File watch latency for MCP-to-frontend state sharing on Windows needs empirical validation — Tauri IPC channel is the fallback

### Pending Todos

None yet.

## Session Continuity

Last session: 2026-03-15
Stopped at: Completed 10-01-PLAN.md — calm-core configured for npm publishing
Resume file: None
