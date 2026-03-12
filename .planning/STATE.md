---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: executing
stopped_at: Completed 05-mcp-server-01-PLAN.md
last_updated: "2026-03-12T09:18:45Z"
last_activity: 2026-03-12 — Phase 5 Plan 01 complete; 14 tool handlers implemented with passing tests
progress:
  total_phases: 12
  completed_phases: 3
  total_plans: 22
  completed_plans: 19
  percent: 27
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-11)

**Core value:** Make architecture diagrams the source of truth — draw visually, get validated CALM code automatically, let AI generate architectures as easily as Mermaid.
**Current focus:** Phase 1 — Foundation & Governance

## Current Position

Phase: 5 of 12 (MCP Server)
Plan: 1 of 3 in current phase (1 complete)
Status: Phase 5 in progress — Plan 01 complete
Last activity: 2026-03-12 — Phase 5 Plan 01 complete; 14 MCP tool handlers with passing tests

Progress: [███░░░░░░░] 27%

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
| Phase 01-foundation-governance P02 | 5m | 2 tasks | 11 files |
| Phase 02-calm-canvas-core P00 | 15 | 2 tasks | 9 files |
| Phase 02-calm-canvas-core P01 | 3min | 2 tasks | 12 files |
| Phase 02-calm-canvas-core P03 | 5 | 2 tasks | 7 files |
| Phase 02-calm-canvas-core P02 | 3min | 2 tasks | 12 files |
| Phase 02-calm-canvas-core P04 | 4min | 2 tasks | 6 files |
| Phase 02-calm-canvas-core P05 | 20min | 3 tasks | 12 files |
| Phase 03-properties-bidirectional-sync P00 | 5min | 2 tasks | 5 files |
| Phase 03-properties-bidirectional-sync P02 | 8min | 2 tasks | 5 files |
| Phase 03-properties-bidirectional-sync P01 | 7min | 2 tasks | 5 files |
| Phase 03-properties-bidirectional-sync P03 | 10min | 2 tasks | 5 files |
| Phase 03-properties-bidirectional-sync P04 | 5min | 2 tasks | 2 files |
| Phase 04-import-export-layout P00 | 4min | 2 tasks | 4 files |
| Phase 04-import-export-layout P02 | 4min | 2 tasks | 3 files |
| Phase 04-import-export-layout P01 | 37min | 2 tasks | 4 files |
| Phase 04-import-export-layout P03 | 4min | 2 tasks | 2 files |
| Phase 05-mcp-server P00 | 8min | 2 tasks | 14 files |
| Phase 05-mcp-server P01 | 12min | 2 tasks | 8 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Pre-Phase 1]: Use Svelte 5 + @xyflow/svelte — not Excalidraw; typed-node graph editor required
- [Pre-Phase 1]: CALM JSON is the single canonical source of truth; all other representations derived
- [Pre-Phase 1]: calmscript uses two-layer parsing: Lezer for CodeMirror highlighting, Chevrotain for runtime compilation
- [Pre-Phase 1]: Extension pack metadata goes in `.calmstudio.json` sidecar — never embedded in `.calm` JSON
- [Pre-Phase 1]: MCP server uses stdio transport (Claude Code compatible); file-based state sharing with frontend in v1
- [Phase 01-foundation-governance]: No @semantic-release/github in per-package configs — avoids one GitHub Release per package per push (anti-pattern)
- [Phase 02-calm-canvas-core]: SvelteKit plugin required in vite.config.ts — plain vitest/config would fail to resolve @sveltejs/kit
- [Phase 02-calm-canvas-core]: passWithNoTests:true added to Vitest config so vitest exits 0 when no test files exist yet
- [Phase 02-calm-canvas-core]: tsconfig.json extends .svelte-kit/tsconfig.json without overriding paths — SvelteKit handles $lib aliases automatically
- [Phase 02-calm-canvas-core]: Use $state.raw() not $state() for Svelte Flow nodes/edges — avoids double-render loops from internal mutations
- [Phase 02-calm-canvas-core]: tsconfig.json extends .svelte-kit/tsconfig.json not tsconfig.base.json directly — SvelteKit generates required path aliases
- [Phase 02-calm-canvas-core]: calm-core exports point to TypeScript source directly — no build step, TypeScript-first workspace package pattern
- [Phase 02-calm-canvas-core]: EdgeMarkers.svelte rendered once in canvas DOM — avoids duplicate SVG defs; orient=auto-start-reverse required for marker rotation
- [Phase 02-calm-canvas-core]: currentColor for SVG marker fill/stroke — enables edge color customization and dark mode without marker-specific props
- [Phase 02-calm-canvas-core]: Monochrome-only node styling — shape alone differentiates CALM types, no per-type coloring
- [Phase 02-calm-canvas-core]: ContainerNode collapse state uses local $state + DOM CustomEvent node:toggle-collapse — decoupled from Svelte Flow internals
- [Phase 02-calm-canvas-core]: resolveNodeType uses Set for O(1) built-in type lookup, returns generic for unknown strings
- [Phase 02-calm-canvas-core]: NodePalette fires onplacenode as callback prop (Svelte 5 idiom); CalmCanvas exports placeNodeAtCenter() via bind:this
- [Phase 02-calm-canvas-core]: makeContainment called for both edge-draw and node drag-into-container — both paths create visual nesting
- [Phase 02-calm-canvas-core]: Svelte 5 module-level $state runes for history/clipboard/theme stores — avoids singleton class pattern, enables reactive exports
- [Phase 02-calm-canvas-core]: Snapshot-before-mutation undo/redo — pushSnapshot called before every mutation per CALM RESEARCH Pitfall 6
- [Phase 02-calm-canvas-core]: paste() returns new Node[] to append — caller (CalmCanvas) decides insertion; store has no canvas reference
- [Phase 03-properties-bidirectional-sync]: projection.ts imports no .svelte.ts files — stays pure TypeScript for vitest testability
- [Phase 03-properties-bidirectional-sync]: syncing mutex uses plain boolean (not $state) — no reactivity needed, avoids overhead
- [Phase 03-properties-bidirectional-sync]: Mutation functions do NOT use the mutex — called from UI event handlers, not sync paths
- [Phase 03-properties-bidirectional-sync]: onBeforeFirstEdit callback prop — properties components lack canvas nodes/edges; parent provides snapshot closure
- [Phase 03-properties-bidirectional-sync]: PropertiesPanel collapsed state uses width:40px CSS + class:collapsed — paneforge Pane handles actual resize
- [Phase 03-properties-bidirectional-sync]: jsonParseLinter imported from @codemirror/lang-json not @codemirror/lint — only lang-json exports it
- [Phase 03-properties-bidirectional-sync]: @codemirror/view and @codemirror/state must be directly installed — Rollup cannot resolve transitive deps in SvelteKit builds
- [Phase 03-properties-bidirectional-sync]: optimizeDeps.exclude required for all @codemirror/* packages — per svelte-codemirror-editor docs for SvelteKit/vite
- [Phase 03-properties-bidirectional-sync]: onmutate callback propagates through PropertiesPanel to NodeProperties/EdgeProperties — called after each debounced store mutation to re-project canvas
- [Phase 03-properties-bidirectional-sync]: applyFromCanvas called after undo/redo restores snapshot — code panel always reflects canvas state
- [Phase 03-properties-bidirectional-sync]: layout whitespace bug (extra margin between canvas and code panel) fixed in +page.svelte
- [Phase 03-properties-bidirectional-sync]: properties panel collapsed state must not trigger on field edit focus — fixed in PropertiesPanel.svelte
- [Phase 04-import-export-layout]: vi.stubGlobal(fn, undefined) keeps property detectable in window — use delete to remove File System Access API pickers for jsdom fallback tests
- [Phase 04-import-export-layout]: elkLayout.ts and fileSystem.ts pre-existed — Wave 0 test stubs serve as regression tests rather than TDD scaffolding
- [Phase 04-import-export-layout]: typeof check for FSA API feature detection (not 'in' check) — vitest stubs set property to undefined but key still exists
- [Phase 04-import-export-layout]: exportAsCalm uses Blob + createObjectURL (not data URL) for proper JSON MIME type; calmscript export is Phase 4 stub until Phase 5 DSL compiler
- [Phase 04-import-export-layout]: elkLayout.ts imports no .svelte.ts files — pure TypeScript for vitest testability (consistent with projection.ts pattern)
- [Phase 04-import-export-layout]: Flat ELK graph (no nested children) per RESEARCH Pitfall 7 — sub-flow nesting by @xyflow/svelte parentId independently
- [Phase 04-import-export-layout]: Pin toggle as canvas-level floating overlay on nodemouseenter — avoids modifying 11 node components
- [Phase 04-import-export-layout]: importCalmFile: no partial load — if JSON invalid or nodes array missing, importError set and canvas unchanged
- [Phase 04-import-export-layout]: Error banner in document flow below Toolbar (not absolute positioned) — cleaner layout, no z-index conflicts
- [Phase 04-import-export-layout]: Explicit markDirty() calls in handleCodeChange/handlePropertyMutation rather than  on nodes/edges — avoids false positives on layout runs
- [Phase 04-import-export-layout]: handleSaveAs marks clean on Blob download fallback — content exported so dirty state resolved
- [Phase 05-mcp-server]: Package named @calmstudio/mcp for npm distribution (not workspace stub name)
- [Phase 05-mcp-server]: Node16 moduleResolution required for mcp-server CLI — bundler resolution fails for standalone binaries
- [Phase 05-mcp-server]: readCalmFile auto-inits with empty arch on ENOENT — not an error (per RESEARCH Pitfall 8)
- [Phase 05-mcp-server P01]: z.infer<typeof Schema> for tool handler params — avoids exactOptionalPropertyTypes conflicts with Zod output
- [Phase 05-mcp-server P01]: server.tool(name, description, schema.shape, cb) pattern for MCP SDK registration
- [Phase 05-mcp-server P01]: Pure logic functions exported alongside registerXxxTools() — enables direct testing without MCP server

### Pending Todos

None yet.

### Blockers/Concerns

- [Research]: calmscript grammar specifics for all 5 CALM relationship types and their sub-properties have no prior art — grammar spike recommended before Phase 5 planning
- [Research]: File watch latency for MCP-to-frontend state sharing on Windows needs empirical validation — Tauri IPC channel is the fallback (address before Phase 8)
- [Research]: VS Code extension — audit existing `calm` Marketplace extension before Phase 12 to determine extend vs rebuild

## Session Continuity

Last session: 2026-03-12T09:18:45Z
Stopped at: Completed 05-mcp-server-01-PLAN.md
Resume file: None
