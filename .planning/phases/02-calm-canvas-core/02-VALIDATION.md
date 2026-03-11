---
phase: 2
slug: calm-canvas-core
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-11
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest ^3.x + @testing-library/svelte ^5.x |
| **Config file** | `apps/studio/vite.config.ts` (vitest config inline) — Wave 0 creates it |
| **Quick run command** | `pnpm --filter @calmstudio/studio test --run` |
| **Full suite command** | `pnpm test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm --filter @calmstudio/studio test --run`
- **After every plan wave:** Run `pnpm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | CANV-01 | E2E | `pnpm test:e2e -- --grep "palette drag"` | ❌ W0 | ⬜ pending |
| 02-01-02 | 01 | 1 | CANV-02 | E2E | `pnpm test:e2e -- --grep "typed edge"` | ❌ W0 | ⬜ pending |
| 02-01-03 | 01 | 1 | CANV-03 | E2E | `pnpm test:e2e -- --grep "delete node"` | ❌ W0 | ⬜ pending |
| 02-01-04 | 01 | 1 | CANV-04 | E2E | `pnpm test:e2e -- --grep "zoom pan"` | ❌ W0 | ⬜ pending |
| 02-01-05 | 01 | 1 | CANV-05 | E2E | `pnpm test:e2e -- --grep "undo"` | ❌ W0 | ⬜ pending |
| 02-01-06 | 01 | 1 | CANV-06 | E2E | `pnpm test:e2e -- --grep "keyboard"` | ❌ W0 | ⬜ pending |
| 02-01-07 | 01 | 1 | CANV-07 | unit | `pnpm test -- --grep "copy paste"` | ❌ W0 | ⬜ pending |
| 02-01-08 | 01 | 1 | CANV-08 | unit | `pnpm test -- --grep "node search"` | ❌ W0 | ⬜ pending |
| 02-01-09 | 01 | 1 | CANV-09 | unit | `pnpm test -- --grep "dark mode"` | ❌ W0 | ⬜ pending |
| 02-02-01 | 02 | 1 | CALM-01 | component | `pnpm test -- --grep "node renders"` | ❌ W0 | ⬜ pending |
| 02-02-02 | 02 | 1 | CALM-02 | component | `pnpm test -- --grep "GenericNode"` | ❌ W0 | ⬜ pending |
| 02-02-03 | 02 | 1 | CALM-03 | component | `pnpm test -- --grep "edge style"` | ❌ W0 | ⬜ pending |
| 02-02-04 | 02 | 1 | CALM-04 | component | `pnpm test -- --grep "handles"` | ❌ W0 | ⬜ pending |
| 02-02-05 | 02 | 1 | CALM-05 | unit | `pnpm test -- --grep "containment"` | ❌ W0 | ⬜ pending |
| 02-02-06 | 02 | 1 | CALM-06 | component | `pnpm test -- --grep "protocol label"` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `apps/studio/vite.config.ts` — vitest + SvelteKit config
- [ ] `apps/studio/src/tests/` — test directory
- [ ] `apps/studio/playwright.config.ts` — E2E config
- [ ] Framework install: `pnpm --filter @calmstudio/studio add -D vitest @testing-library/svelte @playwright/test vitest-browser-svelte`

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Drag-and-drop from palette to canvas feels natural | CANV-01 | DnD fidelity needs visual inspection | Drag each of the 9 node types; verify placement at cursor position |
| Dark mode styling looks correct | CANV-09 | Visual rendering check | Toggle dark mode; verify all node types, edges, palette, and canvas background render correctly |
| Zoom/pan smoothness | CANV-04 | Performance perception | Pinch-zoom and scroll-pan on a 20-node diagram; verify no stutter |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
