<!-- SPDX-FileCopyrightText: 2024 CalmStudio contributors - see NOTICE file -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

<script lang="ts">
	import { type Node, type Edge, SvelteFlowProvider } from '@xyflow/svelte';
	import { tick, onMount } from 'svelte';
	import { PaneGroup, Pane, PaneResizer } from 'paneforge';
	import DnDProvider from '$lib/palette/DnDProvider.svelte';
	import NodePalette from '$lib/palette/NodePalette.svelte';
	import CalmCanvas from '$lib/canvas/CalmCanvas.svelte';
	import CodePanel from '$lib/editor/CodePanel.svelte';
	import PropertiesPanel from '$lib/properties/PropertiesPanel.svelte';
	import Toolbar from '$lib/toolbar/Toolbar.svelte';
	import ValidationPanel from '$lib/validation/ValidationPanel.svelte';
	import { toggleTheme, isDark } from '$lib/stores/theme.svelte';
	import { getModelJson, applyFromJson, applyFromCanvas, getModel, resetModel } from '$lib/stores/calmModel.svelte';
	import { calmToFlow } from '$lib/stores/projection';
	import { pushSnapshot, resetHistory } from '$lib/stores/history.svelte';
	import { layoutCalm, type LayoutDirection } from '$lib/layout/elkLayout';
	import { openFile, saveFile, saveFileAs } from '$lib/io/fileSystem';
	import {
		getFileName,
		getFileHandle,
		getIsDirty,
		markDirty,
		markClean,
		resetFileState
	} from '$lib/io/fileState.svelte';
	import { exportAsCalm, exportAsSvg, exportAsPng, exportAsCalmscript } from '$lib/io/export';
	import type { CalmArchitecture } from '@calmstudio/calm-core';
	import {
		getIssues,
		getErrorCountForElement,
		getWarningCountForElement,
		getMaxSeverityForElement,
		isPanelOpen,
		closePanel,
		getScrollToElementId,
		setScrollToElementId,
		clearValidation,
		runValidation,
	} from '$lib/stores/validation.svelte';

	let nodes = $state.raw<Node[]>([]);
	let edges = $state.raw<Edge[]>([]);

	let canvas: CalmCanvas;

	// ─── Validation ──────────────────────────────────────────────────────────

	/**
	 * Run validation on demand and enrich nodes/edges with results.
	 * Called by the Validate toolbar button.
	 */
	function handleValidate() {
		if (isPanelOpen()) {
			closePanel();
			return;
		}
		runValidation();
		enrichNodesEdgesWithValidation();
	}

	/**
	 * Inject validation counts into nodes and edges for badge/color display.
	 * Only called after explicit validation run — not reactive.
	 */
	function enrichNodesEdgesWithValidation() {
		const currentIssues = getIssues();
		if (!currentIssues.length) {
			// Clear any previous validation data from nodes/edges
			const clearedNodes = nodes.map((n) => {
				if (n.data?.validationErrors === 0 && n.data?.validationWarnings === 0) return n;
				return { ...n, data: { ...n.data, validationErrors: 0, validationWarnings: 0 } };
			});
			if (clearedNodes.some((n, i) => n !== nodes[i])) nodes = clearedNodes;

			const clearedEdges = edges.map((e) => {
				if (e.data?.validationSeverity === null) return e;
				return { ...e, data: { ...e.data, validationSeverity: null } };
			});
			if (clearedEdges.some((e, i) => e !== edges[i])) edges = clearedEdges;
			return;
		}

		// Merge validation counts into nodes
		const nextNodes = nodes.map((n) => {
			const calmId = (n.data?.calmId as string) ?? n.id;
			const errs = getErrorCountForElement(calmId);
			const warns = getWarningCountForElement(calmId);
			if (n.data?.validationErrors === errs && n.data?.validationWarnings === warns) return n;
			return {
				...n,
				data: { ...n.data, validationErrors: errs, validationWarnings: warns },
			};
		});
		if (nextNodes.some((n, i) => n !== nodes[i])) nodes = nextNodes;

		// Merge validation severity into edges
		const nextEdges = edges.map((e) => {
			const calmId = (e.data?.calmId as string) ?? e.id;
			const sev = getMaxSeverityForElement(calmId);
			if (e.data?.validationSeverity === sev) return e;
			return {
				...e,
				data: { ...e.data, validationSeverity: sev },
			};
		});
		if (nextEdges.some((e, i) => e !== edges[i])) edges = nextEdges;
	}

	// ─── Import error state — set by importCalmFile on invalid JSON ──────────

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

	// ─── Validation panel navigation ──────────────────────────────────────────

	/**
	 * Called when user clicks an issue row in the ValidationPanel.
	 * Centers canvas on the element and selects it.
	 */
	function handleNavigateToNode(elementId: string) {
		// Check nodes first
		const node = nodes.find(
			(n) => (n.data?.calmId as string) === elementId || n.id === elementId
		);
		if (node) {
			selectedNodeId = (node.data?.calmId as string) ?? null;
			selectedEdgeId = null;
			canvas?.navigateToNode(elementId);
			// Clear scroll-to after navigation
			setScrollToElementId(null);
			return;
		}
		// Check edges
		const edge = edges.find(
			(e) => (e.data?.calmId as string) === elementId || e.id === elementId
		);
		if (edge) {
			selectedEdgeId = (edge.data?.calmId as string) ?? edge.id;
			selectedNodeId = null;
			setScrollToElementId(null);
		}
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

					// Mark dirty on code-driven changes
					markDirty();
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

		// Mark dirty on property mutations
		markDirty();
	}

	/**
	 * Called by PropertiesPanel before the first mutation in a selection session.
	 * Pushes an undo snapshot so property edits can be undone as a group.
	 */
	function handleBeforeFirstEdit() {
		pushSnapshot(nodes, edges);
	}

	// ─── Pin toggle ──────────────────────────────────────────────────────────

	function handleTogglePin(nodeId: string) {
		nodes = nodes.map((n) =>
			n.id === nodeId
				? { ...n, data: { ...n.data, pinned: !n.data?.pinned } }
				: n
		);
		applyFromCanvas(nodes, edges);
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

		// Clear previous validation results on new file load
		clearValidation();

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

	// ─── File operations ──────────────────────────────────────────────────────

	async function handleOpen() {
		try {
			const result = await openFile();
			await importCalmFile(result.content, result.name);
			// On success, importCalmFile clears importError; mark clean with new file info
			markClean(result.name, result.handle);
		} catch (e) {
			// User cancelled the file picker — not an error
		}
	}

	async function handleSave() {
		try {
			const json = getModelJson();
			const handle = await saveFile(json, getFileHandle(), getFileName() ?? 'architecture.calm.json');
			markClean(undefined, handle);
		} catch (e) {
			// User cancelled or save failed — remain dirty
		}
	}

	async function handleSaveAs() {
		try {
			const json = getModelJson();
			const handle = await saveFileAs(json, getFileName() ?? 'architecture.calm.json');
			// saveFileAs returns handle (FSA API) or null (Blob download fallback)
			if (handle) {
				markClean(handle.name ?? getFileName() ?? undefined, handle);
			} else {
				// Blob download — we can mark clean since content was "saved" (downloaded)
				markClean();
			}
		} catch (e) {
			// User cancelled or save failed — remain dirty
		}
	}

	async function handleNew() {
		if (getIsDirty()) {
			const confirmed = window.confirm('You have unsaved changes. Continue without saving?');
			if (!confirmed) return;
		}
		resetModel();
		resetHistory();
		resetFileState();
		clearValidation();
		nodes = [];
		edges = [];
	}

	// ─── Export operations ────────────────────────────────────────────────────

	function handleExportCalm() {
		exportAsCalm(getModelJson());
	}

	async function handleExportSvg() {
		await exportAsSvg(nodes);
	}

	async function handleExportPng() {
		await exportAsPng(nodes);
	}

	function handleExportCalmscript() {
		// Phase 4 stub: export CALM JSON with a header comment — Phase 5 will provide real calmscript
		const json = getModelJson();
		exportAsCalmscript(`// calmscript export — full DSL support coming in Phase 5\n// CALM JSON representation:\n${json}\n`);
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

	// ─── Keyboard shortcuts and beforeunload ──────────────────────────────────

	onMount(() => {
		function handleKeydown(e: KeyboardEvent) {
			// Option+N (Mac) / Alt+N: new diagram
			// Use e.code because Option+N produces 'ñ' for e.key on Mac
			if (e.altKey && e.code === 'KeyN') {
				e.preventDefault();
				handleNew();
				return;
			}

			const isMod = e.metaKey || e.ctrlKey;
			if (!isMod) return;

			if (e.key === 'o') {
				e.preventDefault();
				handleOpen();
			} else if (e.key === 's' && !e.shiftKey) {
				e.preventDefault();
				handleSave();
			} else if (e.key === 's' && e.shiftKey) {
				e.preventDefault();
				handleSaveAs();
			}
		}

		// Use capture phase so we intercept before browser processes Cmd+N/Cmd+O
		window.addEventListener('keydown', handleKeydown, true);

		return () => {
			window.removeEventListener('keydown', handleKeydown, true);
		};
	});

	// ─── Document title + beforeunload reactive update ──────────────────────

	$effect(() => {
		const filename = getFileName();
		const dirty = getIsDirty();

		if (filename) {
			document.title = dirty ? `${filename} \u2022 CalmStudio` : `${filename} - CalmStudio`;
		} else {
			document.title = dirty ? 'CalmStudio \u2022 Unsaved' : 'CalmStudio';
		}

		// Reactively set/clear onbeforeunload based on dirty state
		if (dirty) {
			window.onbeforeunload = (e: BeforeUnloadEvent) => {
				e.preventDefault();
				e.returnValue = '';
				return '';
			};
		} else {
			window.onbeforeunload = null;
		}
	});
</script>

<DnDProvider>
	<div class="app-shell">
		<!-- Top: Slim toolbar -->
		<Toolbar
			onopen={handleOpen}
			onsave={handleSave}
			onsaveas={handleSaveAs}
			onnew={handleNew}
			onvalidate={handleValidate}
			onexportcalm={handleExportCalm}
			onexportsvg={handleExportSvg}
			onexportpng={handleExportPng}
			onexportcalmscript={handleExportCalmscript}
			filename={getFileName()}
			isDirty={getIsDirty()}
		/>

		<!-- Error banner: below toolbar, above canvas panes -->
		{#if importError}
			<div class="error-banner" role="alert">
				<span class="error-message">{importError}</span>
				<button
					type="button"
					class="error-dismiss"
					onclick={() => (importError = null)}
					aria-label="Dismiss error"
				>
					<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
						<line x1="18" y1="6" x2="6" y2="18" />
						<line x1="6" y1="6" x2="18" y2="18" />
					</svg>
				</button>
			</div>
		{/if}

		<!-- Main content: three-column canvas + bottom code panel + validation drawer -->
		<PaneGroup direction="vertical" class="main-pane-group">
			<!-- Top: Three-column layout (palette | canvas | properties) -->
			<Pane defaultSize={60} minSize={30}>
				<PaneGroup direction="horizontal" style="height: 100%;">
					<!-- Left: Node Palette -->
					<Pane defaultSize={15} minSize={8}>
						<NodePalette onplacenode={handlePalettePlace} />
					</Pane>

					<PaneResizer class="resizer resizer-vertical" />

					<!-- Center: Canvas area -->
					<Pane defaultSize={70}>
						<div class="canvas-pane" role="main">
							<!-- Floating toolbar (layout controls + dark mode toggle) -->
							<div class="canvas-toolbar">
								<!-- Auto-layout controls -->
								<div class="layout-group" role="group" aria-label="Auto-layout controls">
									<!-- Direction dropdown -->
									<select
										class="layout-select"
										bind:value={layoutDirection}
										aria-label="Layout direction"
										onchange={() => runLayout(layoutDirection)}
										title="Layout direction"
									>
										<option value="DOWN">Top to Bottom</option>
										<option value="RIGHT">Left to Right</option>
										<option value="UP">Hierarchical</option>
									</select>

									<!-- Layout button -->
									<button
										type="button"
										class="canvas-toolbar-btn"
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

								<!-- Dark mode toggle -->
								<button
									onclick={toggleTheme}
									class="canvas-toolbar-btn"
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
									onfileimport={importCalmFile}
									oncanvaschange={markDirty}
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
							ontogglepin={handleTogglePin}
						/>
					</Pane>
				</PaneGroup>
			</Pane>

			<PaneResizer class="resizer resizer-horizontal" />

			<!-- Middle: Code editor panel (full width) -->
			<Pane defaultSize={25} minSize={10}>
				<CodePanel
					value={calmJson}
					onchange={handleCodeChange}
					parseError={codeParseError}
					selectedNodeId={selectedNodeId}
					selectedEdgeId={selectedEdgeId}
				/>
			</Pane>

			{#if isPanelOpen()}
				<PaneResizer class="resizer resizer-horizontal" />

				<!-- Bottom: Validation panel (shown after user clicks Validate) -->
				<Pane
					defaultSize={20}
					minSize={8}
				>
					<ValidationPanel
						issues={getIssues()}
						onnavigatetonode={handleNavigateToNode}
						ondismiss={() => { closePanel(); }}
						scrollToId={getScrollToElementId()}
					/>
				</Pane>
			{/if}
		</PaneGroup>
	</div>
</DnDProvider>

<style>
	/* Full-height app shell — toolbar + pane group stack vertically */
	.app-shell {
		display: flex;
		flex-direction: column;
		height: 100vh;
		overflow: hidden;
	}

	/* PaneGroup fills remaining height below toolbar (and error banner) */
	:global(.main-pane-group) {
		flex: 1;
		min-height: 0;
	}

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

	/* ─── Error banner (full-width, below top Toolbar) ──────────── */

	.error-banner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		background: #fef2f2;
		border-bottom: 1px solid #fca5a5;
		padding: 8px 16px;
		font-size: 12px;
		font-family: var(--font-sans);
		color: #dc2626;
		flex-shrink: 0;
	}

	:global(.dark) .error-banner {
		background: #1c0a0a;
		border-color: #7f1d1d;
		color: #f87171;
	}

	.error-message {
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
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

	/* ─── Floating canvas toolbar (layout + dark mode) ──────────── */

	.canvas-toolbar {
		position: absolute;
		right: 12px;
		top: 12px;
		z-index: 50;
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.canvas-toolbar-btn {
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

	.canvas-toolbar-btn:hover {
		background: var(--color-surface-tertiary);
		color: var(--color-text-primary);
	}

	:global(.dark) .canvas-toolbar-btn {
		background: #111827;
		border-color: #334155;
		color: #94a3b8;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
	}

	:global(.dark) .canvas-toolbar-btn:hover {
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
	.layout-group .canvas-toolbar-btn {
		width: 28px;
		height: 28px;
		border: none;
		background: transparent;
		box-shadow: none;
		border-radius: 6px;
	}

	.layout-group .canvas-toolbar-btn:hover {
		background: var(--color-surface-tertiary);
	}

	:global(.dark) .layout-group .canvas-toolbar-btn {
		background: transparent;
	}

	:global(.dark) .layout-group .canvas-toolbar-btn:hover {
		background: #1e293b;
	}
</style>
