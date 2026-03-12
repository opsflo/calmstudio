<!-- SPDX-FileCopyrightText: 2024 CalmStudio contributors - see NOTICE file -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

<script lang="ts">
	import { type Node, type Edge, SvelteFlowProvider } from '@xyflow/svelte';
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
	import type { CalmArchitecture } from '@calmstudio/calm-core';

	let nodes = $state.raw<Node[]>([]);
	let edges = $state.raw<Edge[]>([]);

	let canvas: CalmCanvas;

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
					<div class="canvas-pane">
						<!-- Floating toolbar -->
						<div class="toolbar">
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

						<SvelteFlowProvider>
							<CalmCanvas
								bind:this={canvas}
								bind:nodes
								bind:edges
								onselectionchange={handleSelectionChange}
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
</style>
