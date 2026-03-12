<!-- SPDX-FileCopyrightText: 2024 CalmStudio contributors - see NOTICE file -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

<script lang="ts">
	import { type Node, type Edge, SvelteFlowProvider } from '@xyflow/svelte';
	import { tick } from 'svelte';
	import { PaneGroup, Pane, PaneResizer } from 'paneforge';
	import DnDProvider from '$lib/palette/DnDProvider.svelte';
	import NodePalette from '$lib/palette/NodePalette.svelte';
	import CalmCanvas from '$lib/canvas/CalmCanvas.svelte';
	import CodePanel from '$lib/editor/CodePanel.svelte';
	import PropertiesPanel from '$lib/properties/PropertiesPanel.svelte';
	import { toggleTheme, isDark } from '$lib/stores/theme.svelte';
	import { getModelJson, applyFromJson, getModel } from '$lib/stores/calmModel.svelte';
	import { calmToFlow } from '$lib/stores/projection';
	import { pushSnapshot } from '$lib/stores/history.svelte';
	import { layoutCalm, type LayoutDirection } from '$lib/layout/elkLayout';
	import type { CalmArchitecture } from '@calmstudio/calm-core';

	let nodes = $state.raw<Node[]>([]);
	let edges = $state.raw<Edge[]>([]);

	let canvas: CalmCanvas;

	// ─── Import error state — consumed by Plan 03 error banner ──────────────

	let importError = $state<string | null>(null);

	function handlePalettePlace(type: string) {
		canvas?.placeNodeAtCenter(type);
	}

	// ─── Forward sync: model -> JSON string for code panel ───────────────────

	const calmJson = $derived(getModelJson());

	// ─── Selection state ─────────────────────────────────────────────────────

	let selectedNodeId = $state<string | null>(null);
	let selectedEdgeId = $state<string | null>(null);

	// Derive selected node/edge objects for properties panel
	const selectedNode = $derived(
		selectedNodeId ? nodes.find((n) => n.data?.calmId === selectedNodeId) ?? null : null
	);
	const selectedEdge = $derived(
		selectedEdgeId ? edges.find((e) => e.id === selectedEdgeId) ?? null : null
	);

	function handleSelectionChange(nodeId: string | null, edgeId: string | null) {
		selectedNodeId = nodeId;
		selectedEdgeId = edgeId;
	}

	// ─── Reverse sync: code editor -> model -> canvas ────────────────────────

	let codeParseError = $state<string | null>(null);
	let codeChangeTimer: ReturnType<typeof setTimeout>;

	function handleCodeChange(newValue: string) {
		// Debounce: wait 400ms after last change before parsing
		clearTimeout(codeChangeTimer);
		codeChangeTimer = setTimeout(() => {
			try {
				const parsed = JSON.parse(newValue) as CalmArchitecture;
				codeParseError = null;

				// Build position map from current nodes to preserve positions
				const positionMap = new Map<string, { x: number; y: number }>();
				for (const n of nodes) {
					if (n.data?.calmId) {
						positionMap.set(n.data.calmId as string, { ...n.position });
					}
				}

				// Push undo snapshot BEFORE applying
				pushSnapshot(nodes, edges);

				// Apply to canonical model (mutex prevents re-entry)
				const applied = applyFromJson(parsed);
				if (applied) {
					// Project back to Svelte Flow format, preserving positions and selection
					const projected = calmToFlow(parsed, positionMap);
					const selectionMap = new Map<string, boolean>();
					for (const n of nodes) {
						if (n.selected && n.data?.calmId) selectionMap.set(n.data.calmId as string, true);
					}
					nodes = projected.nodes.map((n) =>
						selectionMap.has(n.data?.calmId as string)
							? { ...n, selected: true }
							: n
					);
					edges = projected.edges;
				}
			} catch (e) {
				codeParseError = (e as Error).message;
				// Canvas keeps last valid state — no update
			}
		}, 400);
	}

	// ─── Properties panel mutation callback ──────────────────────────────────

	/**
	 * Called by PropertiesPanel after a property mutation updates the model store.
	 * Re-projects the canonical model back to Svelte Flow nodes/edges to keep
	 * canvas and code panel in sync.
	 */
	function handlePropertyMutation() {
		const model = getModel();
		const positionMap = new Map<string, { x: number; y: number }>();
		const selectionMap = new Map<string, boolean>();
		for (const n of nodes) {
			if (n.data?.calmId) {
				positionMap.set(n.data.calmId as string, { ...n.position });
				if (n.selected) selectionMap.set(n.data.calmId as string, true);
			}
		}
		const projected = calmToFlow(model, positionMap);
		// Preserve selection state so SvelteFlow doesn't fire deselection
		nodes = projected.nodes.map((n) =>
			selectionMap.has(n.data?.calmId as string)
				? { ...n, selected: true }
				: n
		);
		edges = projected.edges;
	}

	/**
	 * Called by PropertiesPanel before the first mutation in a selection session.
	 * Pushes an undo snapshot so property edits can be undone as a group.
	 */
	function handleBeforeFirstEdit() {
		pushSnapshot(nodes, edges);
	}

	// ─── CALM file import ─────────────────────────────────────────────────────

	/**
	 * Import a CALM JSON file from string content.
	 * Validates JSON and presence of `nodes` array.
	 * On success: applies to model, runs ELK layout, projects to canvas, fits view.
	 * On error: sets importError, canvas unchanged (no partial load).
	 */
	async function importCalmFile(content: string, _filename?: string) {
		let parsed: CalmArchitecture;
		try {
			parsed = JSON.parse(content) as CalmArchitecture;
		} catch (e) {
			importError = 'Malformed JSON: ' + (e as Error).message;
			return;
		}

		if (!Array.isArray(parsed.nodes)) {
			importError = 'Invalid CALM JSON: missing nodes array';
			return;
		}

		// Clear any previous error
		importError = null;

		// Push undo snapshot before mutation
		pushSnapshot(nodes, edges);

		// Apply to canonical model
		applyFromJson(parsed);

		// Auto-layout with no pinned nodes on fresh import
		const positionMap = await layoutCalm(parsed, new Set(), 'DOWN');

		// Project to Svelte Flow
		const projected = calmToFlow(parsed, positionMap);
		nodes = projected.nodes;
		edges = projected.edges;

		// Fit view after DOM update
		await tick();
		canvas?.fitViewport();
	}

	// ─── Auto-layout ──────────────────────────────────────────────────────────

	/** Currently selected layout direction (used by toolbar dropdown). */
	let layoutDirection = $state<LayoutDirection>('DOWN');

	/**
	 * Run ELK auto-layout on the current diagram.
	 * Pinned nodes are excluded from ELK; their current positions are preserved.
	 */
	async function runLayout(direction: LayoutDirection) {
		const model = getModel();
		const pinnedIds = new Set(
			nodes.filter((n) => n.data?.pinned).map((n) => n.id)
		);

		// Run ELK for free (unpinned) nodes
		const elkPositions = await layoutCalm(model, pinnedIds, direction);

		// Build final position map: ELK results + pinned node current positions
		const finalPositions = new Map<string, { x: number; y: number }>();

		// Inject pinned positions from current canvas state
		for (const n of nodes) {
			if (pinnedIds.has(n.id)) {
				finalPositions.set(n.id, { ...n.position });
			}
		}

		// Add ELK-computed positions for free nodes
		for (const [id, pos] of elkPositions) {
			finalPositions.set(id, pos);
		}

		// Project via calmToFlow with combined position map
		const projected = calmToFlow(model, finalPositions);

		// Preserve pinned flag on projected nodes
		const pinnedMap = new Map(nodes.map((n) => [n.id, n.data?.pinned ?? false]));
		nodes = projected.nodes.map((n) =>
			pinnedMap.get(n.id) ? { ...n, data: { ...n.data, pinned: true } } : n
		);
		edges = projected.edges;

		await tick();
		canvas?.fitViewport();
	}

	// ─── Cmd+O keyboard shortcut — open file picker ───────────────────────────

	function handleOpenFile() {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = '.json,.calm.json';
		input.onchange = async () => {
			const file = input.files?.[0];
			if (!file) return;
			const content = await file.text();
			await importCalmFile(content, file.name);
		};
		input.click();
	}
</script>

<DnDProvider>
	<PaneGroup direction="vertical" style="height: 100vh; overflow: hidden;">
		<!-- Top: Three-column layout (palette | canvas | properties) -->
		<Pane defaultSize={70} minSize={30}>
			<PaneGroup direction="horizontal" style="height: 100%;">
				<!-- Left: Node Palette -->
				<Pane defaultSize={15} minSize={8}>
					<NodePalette onplacenode={handlePalettePlace} />
				</Pane>

				<PaneResizer class="resizer resizer-vertical" />

				<!-- Center: Canvas area -->
				<Pane defaultSize={70}>
					<div
						class="canvas-pane"
						onkeydown={(e) => {
							if ((e.metaKey || e.ctrlKey) && e.key === 'o') {
								e.preventDefault();
								handleOpenFile();
							}
						}}
						role="main"
						tabindex="-1"
					>
						<!-- Floating toolbar -->
						<div class="toolbar">
							<!-- Auto-layout controls -->
							<div class="layout-group" role="group" aria-label="Auto-layout controls">
								<!-- Direction dropdown -->
								<select
									class="layout-select"
									bind:value={layoutDirection}
									aria-label="Layout direction"
									title="Layout direction"
								>
									<option value="DOWN">Top to Bottom</option>
									<option value="RIGHT">Left to Right</option>
									<option value="UP">Hierarchical</option>
								</select>

								<!-- Layout button -->
								<button
									type="button"
									class="toolbar-btn"
									onclick={() => runLayout(layoutDirection)}
									aria-label="Auto-layout diagram"
									title="Auto-layout (ELK)"
								>
									<!-- Grid/arrange icon -->
									<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
										<rect x="3" y="3" width="7" height="7" rx="1" />
										<rect x="14" y="3" width="7" height="7" rx="1" />
										<rect x="3" y="14" width="7" height="7" rx="1" />
										<rect x="14" y="14" width="7" height="7" rx="1" />
									</svg>
								</button>
							</div>

							<!-- Open file button (Cmd+O) -->
							<button
								type="button"
								class="toolbar-btn"
								onclick={handleOpenFile}
								aria-label="Open CALM JSON file (Cmd+O)"
								title="Import CALM JSON (Cmd+O)"
							>
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
									<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
								</svg>
							</button>

							<!-- Dark mode toggle -->
							<button
								onclick={toggleTheme}
								class="toolbar-btn"
								aria-label={isDark() ? 'Switch to light mode' : 'Switch to dark mode'}
								title={isDark() ? 'Switch to light mode' : 'Switch to dark mode'}
							>
								{#if isDark()}
									<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
										<circle cx="12" cy="12" r="4" />
										<path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
									</svg>
								{:else}
									<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
										<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
									</svg>
								{/if}
							</button>
						</div>

						<!-- Import error banner -->
						{#if importError}
							<div class="import-error" role="alert">
								<span>{importError}</span>
								<button type="button" class="error-dismiss" onclick={() => (importError = null)} aria-label="Dismiss error">
									<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
										<line x1="18" y1="6" x2="6" y2="18" />
										<line x1="6" y1="6" x2="18" y2="18" />
									</svg>
								</button>
							</div>
						{/if}

						<SvelteFlowProvider>
							<CalmCanvas
								bind:this={canvas}
								bind:nodes
								bind:edges
								onselectionchange={handleSelectionChange}
								onfileimport={importCalmFile}
							/>
						</SvelteFlowProvider>
					</div>
				</Pane>

				<PaneResizer class="resizer resizer-vertical" />

				<!-- Right: Properties panel -->
				<Pane defaultSize={15} minSize={5}>
					<PropertiesPanel
						{selectedNode}
						{selectedEdge}
						onBeforeFirstEdit={handleBeforeFirstEdit}
						onmutate={handlePropertyMutation}
					/>
				</Pane>
			</PaneGroup>
		</Pane>

		<PaneResizer class="resizer resizer-horizontal" />

		<!-- Bottom: Code editor panel (full width) -->
		<Pane defaultSize={30} minSize={10}>
			<CodePanel
				value={calmJson}
				onchange={handleCodeChange}
				parseError={codeParseError}
				selectedNodeId={selectedNodeId}
				selectedEdgeId={selectedEdgeId}
			/>
		</Pane>
	</PaneGroup>
</DnDProvider>

<style>
	/* Canvas pane fills its container with relative positioning for toolbar overlay */
	.canvas-pane {
		position: relative;
		width: 100%;
		height: 100%;
		overflow: hidden;
		background: var(--color-canvas-bg);
	}

	:global(.dark) .canvas-pane {
		background: #0b0f1a;
	}

	/* Floating dark mode toggle toolbar */
	.toolbar {
		position: absolute;
		right: 12px;
		top: 12px;
		z-index: 50;
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.toolbar-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 34px;
		height: 34px;
		border-radius: 9px;
		border: 1px solid var(--color-border);
		background: var(--color-surface);
		color: var(--color-text-secondary);
		cursor: pointer;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
		transition: all 0.15s ease;
	}

	.toolbar-btn:hover {
		background: var(--color-surface-tertiary);
		color: var(--color-text-primary);
	}

	:global(.dark) .toolbar-btn {
		background: #111827;
		border-color: #334155;
		color: #94a3b8;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
	}

	:global(.dark) .toolbar-btn:hover {
		background: #1e293b;
		color: #e2e8f0;
	}

	/* PaneResizer styling — thin draggable bars */
	:global(.resizer) {
		background: transparent;
		transition: background 0.15s ease;
		flex-shrink: 0;
		position: relative;
		z-index: 10;
	}

	/* Vertical resizer (between horizontal panes) */
	:global(.resizer-vertical) {
		width: 4px;
		cursor: col-resize;
	}

	/* Horizontal resizer (between vertical panes) */
	:global(.resizer-horizontal) {
		height: 4px;
		cursor: row-resize;
	}

	:global(.resizer:hover) {
		background: var(--color-border);
		opacity: 0.6;
	}

	:global(.resizer[data-resize-handle-active]) {
		background: var(--color-accent, #3b82f6);
		opacity: 1;
	}

	:global(.dark) :global(.resizer:hover) {
		background: #334155;
		opacity: 0.8;
	}

	:global(.dark) :global(.resizer[data-resize-handle-active]) {
		background: #3b82f6;
		opacity: 1;
	}

	/* ─── Layout group (dropdown + button) ──────────────────────── */

	.layout-group {
		display: flex;
		align-items: center;
		gap: 2px;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 9px;
		padding: 2px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
	}

	:global(.dark) .layout-group {
		background: #111827;
		border-color: #334155;
	}

	.layout-select {
		border: none;
		background: transparent;
		font-size: 11px;
		font-family: var(--font-sans);
		color: var(--color-text-secondary);
		cursor: pointer;
		padding: 4px 4px 4px 6px;
		border-radius: 7px;
		outline: none;
		min-width: 100px;
	}

	.layout-select:hover,
	.layout-select:focus {
		background: var(--color-surface-tertiary);
		color: var(--color-text-primary);
	}

	:global(.dark) .layout-select {
		color: #94a3b8;
	}

	:global(.dark) .layout-select option {
		background: #111827;
		color: #e2e8f0;
	}

	/* Layout button inside layout-group has no outer border/bg */
	.layout-group .toolbar-btn {
		width: 28px;
		height: 28px;
		border: none;
		background: transparent;
		box-shadow: none;
		border-radius: 6px;
	}

	.layout-group .toolbar-btn:hover {
		background: var(--color-surface-tertiary);
	}

	:global(.dark) .layout-group .toolbar-btn {
		background: transparent;
	}

	:global(.dark) .layout-group .toolbar-btn:hover {
		background: #1e293b;
	}

	/* ─── Import error banner ────────────────────────────────────── */

	.import-error {
		position: absolute;
		top: 56px;
		left: 50%;
		transform: translateX(-50%);
		z-index: 50;
		display: flex;
		align-items: center;
		gap: 8px;
		background: #fef2f2;
		border: 1px solid #fca5a5;
		border-radius: 8px;
		padding: 8px 12px;
		font-size: 12px;
		font-family: var(--font-sans);
		color: #dc2626;
		max-width: 480px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	:global(.dark) .import-error {
		background: #1c0a0a;
		border-color: #7f1d1d;
		color: #f87171;
	}

	.error-dismiss {
		background: none;
		border: none;
		cursor: pointer;
		color: inherit;
		display: flex;
		align-items: center;
		padding: 2px;
		border-radius: 4px;
		flex-shrink: 0;
		opacity: 0.7;
	}

	.error-dismiss:hover {
		opacity: 1;
		background: rgba(220, 38, 38, 0.1);
	}
</style>
