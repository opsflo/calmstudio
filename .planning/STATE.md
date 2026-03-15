---
gsd_state_version: 1.0
milestone: v1.1
milestone_name: Distribution & Developer Experience
status: executing
stopped_at: Completed 10-03-PLAN.md — authored documentation content and 10 ADRs
last_updated: "2026-03-15T07:03:08.693Z"
last_activity: "2026-03-15 — completed 10-03: 5 guide pages + 10 MADR ADRs, Docusaurus build verified"
progress:
  total_phases: 4
  completed_phases: 1
  total_plans: 3
  completed_plans: 3
  percent: 8
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-15)

**Core value:** Make architecture diagrams the source of truth — draw visually, get validated CALM code automatically, let AI generate architectures via MCP.
**Current focus:** Phase 10 — Docs & Package Publish

## Current Position

Phase: 10 of 13 (Docs & Package Publish)
Plan: 03 completed (authored documentation content and 10 ADRs)
Status: In progress — plans 10-01, 10-02, 10-03 complete
Last activity: 2026-03-15 — completed 10-03: 5 guide pages + 10 MADR ADRs, Docusaurus build verified

Progress: [█░░░░░░░░░] 8%

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

### Blockers/Concerns

- [Research]: VS Code extension — audit existing `calm` Marketplace extension before building to determine extend vs rebuild
- [Research]: File watch latency for MCP-to-frontend state sharing on Windows needs empirical validation — Tauri IPC channel is the fallback

### Pending Todos

None yet.

## Session Continuity

Last session: 2026-03-15T07:35:00.000Z
Stopped at: Completed 10-03-PLAN.md — authored documentation content and 10 ADRs
Resume file: None
