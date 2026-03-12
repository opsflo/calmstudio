<!-- SPDX-FileCopyrightText: 2024 CalmStudio contributors - see NOTICE file -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

<!--
  CalmCanvas.svelte — Main Svelte Flow canvas wrapper for CALM Studio.

  Responsibilities:
  - Mounts <SvelteFlow> with all CALM nodeTypes and edgeTypes
  - Handles HTML5 drag-and-drop from NodePalette (ondragover + ondrop)
  - Creates new nodes via screenToFlowPosition when items are dropped
  - Handles click-to-place via the onplacenode callback prop
  - Creates edges defaulting to DEFAULT_EDGE_TYPE ('connects')
  - Creates containment when deployed-in/composed-of edges are drawn
  - Detects node drag-into-container and auto-creates containment
  - Renders EdgeMarkers.svelte once (shared SVG defs for all edges)
  - Wires undo/redo (Cmd+Z/Cmd+Shift+Z), copy/paste (Cmd+C/V)
  - Wires search panel (Cmd+F), dark mode keyboard shortcut
  - Calls pushSnapshot BEFORE every mutation (RESEARCH Pitfall 6)

  Key decisions:
  - MUST use $state.raw for nodes/edges — Svelte Flow mutates arrays internally;
    deep $state() reactivity causes double-render loops (RESEARCH Pitfall 1)
  - makeContainment is called for both edge-draw and node drag-into (per user decision)
  - @svelte-put/shortcut action used for declarative keyboard shortcut binding
-->
<script lang="ts">
	import {
		SvelteFlow,
		Background,
		BackgroundVariant,
		useSvelteFlow,
		type Node,
		type Edge,
		type Connection,
		type NodeDragEvent,
	} from '@xyflow/svelte';
	import { shortcut } from '@svelte-put/shortcut';
	import { nanoid } from 'nanoid';

	import { nodeTypes, resolveNodeType } from './nodeTypes';
	import { edgeTypes, DEFAULT_EDGE_TYPE } from './edgeTypes';
	import { makeContainment, isContainmentType } from './containment';
	import EdgeMarkers from './edges/EdgeMarkers.svelte';
	import NodeSearch from '$lib/search/NodeSearch.svelte';
	import { pushSnapshot, undo, redo } from '$lib/stores/history.svelte';
	import { copy, paste } from '$lib/stores/clipboard.svelte';
	import { applyFromCanvas } from '$lib/stores/calmModel.svelte';

	import '@xyflow/svelte/dist/style.css';

	// ─── Props ────────────────────────────────────────────────────────────────

	let {
		nodes = $bindable<Node[]>([]),
		edges = $bindable<Edge[]>([]),
		onplacenode,
		onselectionchange,
		onfileimport,
		oncanvaschange,
	}: {
		nodes?: Node[];
		edges?: Edge[];
		/** Called by parent when a palette item is clicked — places node at viewport center. */
		onplacenode?: (type: string) => void;
		/** Called when canvas selection changes. nodeId and edgeId are the IDs of the first selected items (or null). */
		onselectionchange?: (nodeId: string | null, edgeId: string | null) => void;
		/** Called when a .json file is dropped onto the canvas. Receives file content and filename. */
		onfileimport?: (content: string, filename: string) => void;
		/** Called when canvas content changes (node drag, edge create, delete, etc.) for dirty tracking. */
		oncanvaschange?: () => void;
	} = $props();

	// ─── Svelte Flow context ─────────────────────────────────────────────────

	const { screenToFlowPosition, flowToScreenPosition, fitView } = useSvelteFlow();

	/**
	 * Fit all nodes into view. Called by parent after import or layout.
	 */
	export function fitViewport() {
		fitView({ duration: 300 });
	}

	// ─── Search state ─────────────────────────────────────────────────────────

	let searchOpen = $state(false);

	function handleSearchResults(ids: string[]) {
		if (ids.length === 0) return;
		// Highlight matching nodes by setting selected: true
		nodes = nodes.map((n) => ({
			...n,
			selected: ids.includes(n.id),
		}));
	}

	function closeSearch() {
		searchOpen = false;
		// Deselect all nodes when search closes
		nodes = nodes.map((n) => ({ ...n, selected: false }));
	}

	// ─── DnD drop handler ────────────────────────────────────────────────────

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
		if (event.dataTransfer) {
			event.dataTransfer.dropEffect = 'copy';
		}
	}

	async function handleDrop(event: DragEvent) {
		event.preventDefault();

		// Check for file drop first (JSON file import)
		const file = event.dataTransfer?.files[0];
		if (file && (file.name.endsWith('.json') || file.name.endsWith('.calm.json'))) {
			const content = await file.text();
			onfileimport?.(content, file.name);
			return;
		}

		const calmType = event.dataTransfer?.getData('application/calm-node-type');
		if (!calmType) return;

		pushSnapshot(nodes, edges);

		const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
		const id = nanoid();
		const resolvedType = resolveNodeType(calmType);

		const newNode: Node = {
			id,
			type: resolvedType,
			position,
			data: {
				label: `New ${calmType}`,
				calmId: nanoid(),
				calmType,
			},
		};

		nodes = [...nodes, newNode];
		applyFromCanvas(nodes, edges);
		oncanvaschange?.();
	}

	// ─── Click-to-place ──────────────────────────────────────────────────────

	/**
	 * Place a node at the viewport center.
	 * Called by parent (+page.svelte) in response to NodePalette's placenode event.
	 */
	export function placeNodeAtCenter(calmType: string) {
		const position = screenToFlowPosition({
			x: window.innerWidth / 2,
			y: window.innerHeight / 2,
		});
		const id = nanoid();
		const resolvedType = resolveNodeType(calmType);

		pushSnapshot(nodes, edges);

		const newNode: Node = {
			id,
			type: resolvedType,
			position,
			data: {
				label: `New ${calmType}`,
				calmId: nanoid(),
				calmType,
			},
		};

		nodes = [...nodes, newNode];
		applyFromCanvas(nodes, edges);
		oncanvaschange?.();
	}

	// ─── Edge creation ───────────────────────────────────────────────────────

	function handleConnect(connection: Connection) {
		pushSnapshot(nodes, edges);

		const edgeType = DEFAULT_EDGE_TYPE;
		const newEdge: Edge = {
			id: nanoid(),
			source: connection.source,
			target: connection.target,
			sourceHandle: connection.sourceHandle ?? undefined,
			targetHandle: connection.targetHandle ?? undefined,
			type: edgeType,
		};

		edges = [...edges, newEdge];

		if (isContainmentType(edgeType)) {
			nodes = makeContainment(connection.source, connection.target, nodes);
		}
		applyFromCanvas(nodes, edges);
		oncanvaschange?.();
	}

	/**
	 * Change the type of an existing edge (e.g. connects -> deployed-in).
	 * Handles containment side-effects when switching to/from containment types.
	 */
	function changeEdgeType(edgeId: string, newType: string) {
		pushSnapshot(nodes, edges);

		const edge = edges.find((e) => e.id === edgeId);
		if (!edge) return;

		edges = edges.map((e) =>
			e.id === edgeId ? { ...e, type: newType } : e
		);

		// If changing TO a containment type, establish containment
		if (isContainmentType(newType)) {
			nodes = makeContainment(edge.source, edge.target, nodes);
		}
		applyFromCanvas(nodes, edges);
		oncanvaschange?.();
	}

	// ─── Edge context menu (right-click to change type) ─────────────────────

	let edgeMenu = $state<{ x: number; y: number; edgeId: string } | null>(null);

	const EDGE_TYPE_OPTIONS = [
		{ value: 'connects', label: 'Connects' },
		{ value: 'interacts', label: 'Interacts' },
		{ value: 'deployed-in', label: 'Deployed In' },
		{ value: 'composed-of', label: 'Composed Of' },
		{ value: 'options', label: 'Options' },
	];

	function handleEdgeContextMenu(event: { event: MouseEvent; edge: Edge }) {
		event.event.preventDefault();
		edgeMenu = {
			x: event.event.clientX,
			y: event.event.clientY,
			edgeId: event.edge.id,
		};
	}

	function selectEdgeType(type: string) {
		if (edgeMenu) {
			changeEdgeType(edgeMenu.edgeId, type);
			edgeMenu = null;
		}
	}

	function closeEdgeMenu() {
		edgeMenu = null;
	}

	// ─── Node drag-into-container ────────────────────────────────────────────

	/**
	 * Checks whether point a is inside the bounding box of b.
	 */
	function isInsideBounds(
		a: { x: number; y: number },
		b: { x: number; y: number; width?: number; height?: number }
	): boolean {
		const bw = b.width ?? 200;
		const bh = b.height ?? 150;
		return (
			a.x >= b.x &&
			a.x <= b.x + bw &&
			a.y >= b.y &&
			a.y <= b.y + bh
		);
	}

	function handleNodeDragStop(event: NodeDragEvent) {
		const draggedNode = event.node;
		// Don't reparent nodes that are already parented or are containers
		if (draggedNode.type === 'container' || draggedNode.parentId) return;

		// Find any large node whose bounds contain the dragged node's position.
		// Any node type can become a container when something is dropped into it.
		for (const candidate of nodes) {
			if (candidate.id === draggedNode.id) continue;
			if (candidate.type === 'container' || (candidate.measured?.width && candidate.measured.width > 100)) {
				const bounds = {
					x: candidate.position.x,
					y: candidate.position.y,
					width: candidate.measured?.width ?? candidate.width ?? 200,
					height: candidate.measured?.height ?? candidate.height ?? 150,
				};
				if (isInsideBounds(draggedNode.position, bounds)) {
					pushSnapshot(nodes, edges);
					nodes = makeContainment(candidate.id, draggedNode.id, nodes);
					applyFromCanvas(nodes, edges);
					oncanvaschange?.();
					return;
				}
			}
		}
		// Regular drag stop (position change only)
		applyFromCanvas(nodes, edges);
		oncanvaschange?.();
	}

	// ─── Pin toggle ───────────────────────────────────────────────────────────

	/** Hover state for showing the pin button overlay. */
	let hoveredNodeId = $state<string | null>(null);
	let pinBtnPos = $state<{ x: number; y: number; width: number } | null>(null);
	let canvasEl: HTMLDivElement;

	function handleNodeMouseEnter(event: { event: MouseEvent; node: Node }) {
		hoveredNodeId = event.node.id;
		// Position pin button relative to canvas container (not screen)
		const screenPos = flowToScreenPosition(event.node.position);
		const w = event.node.measured?.width ?? event.node.width ?? 160;
		const rect = canvasEl?.getBoundingClientRect();
		const offsetX = rect?.left ?? 0;
		const offsetY = rect?.top ?? 0;
		pinBtnPos = { x: screenPos.x - offsetX + w - 22, y: screenPos.y - offsetY + 4, width: w };
	}

	function handleNodeMouseLeave() {
		// Small delay so user can click the pin button without it disappearing
		setTimeout(() => {
			hoveredNodeId = null;
			pinBtnPos = null;
		}, 200);
	}

	function togglePinNode(nodeId: string) {
		nodes = nodes.map((n) =>
			n.id === nodeId
				? { ...n, data: { ...n.data, pinned: !n.data?.pinned } }
				: n
		);
		applyFromCanvas(nodes, edges);
	}

	// ─── Keyboard shortcuts ───────────────────────────────────────────────────

	function handleUndo() {
		const snapshot = undo();
		if (snapshot) {
			nodes = snapshot.nodes;
			edges = snapshot.edges;
			applyFromCanvas(nodes, edges);
		}
	}

	function handleRedo() {
		const snapshot = redo();
		if (snapshot) {
			nodes = snapshot.nodes;
			edges = snapshot.edges;
			applyFromCanvas(nodes, edges);
		}
	}

	function handleCopy() {
		copy(nodes);
	}

	function handlePaste() {
		const newNodes = paste(nodes);
		if (newNodes.length > 0) {
			pushSnapshot(nodes, edges);
			nodes = [...nodes, ...newNodes];
			applyFromCanvas(nodes, edges);
		}
	}

	function handleSelectAll() {
		nodes = nodes.map((n) => ({ ...n, selected: true }));
	}

	function handleToggleSearch() {
		searchOpen = !searchOpen;
		if (!searchOpen) {
			// Clear search highlights when closing
			nodes = nodes.map((n) => ({ ...n, selected: false }));
		}
	}

	// ─── Selection change ─────────────────────────────────────────────────────

	function handleSelectionChange({ nodes: selectedNodes, edges: selectedEdges }: { nodes: Node[]; edges: Edge[] }) {
		const nodeId = selectedNodes.length > 0 ? (selectedNodes[0].data?.calmId as string ?? selectedNodes[0].id) : null;
		const edgeId = selectedEdges.length > 0 ? selectedEdges[0].id : null;
		onselectionchange?.(nodeId, edgeId);
	}
</script>

<!--
  Full-size canvas wrapper. ondragover + ondrop handle palette drops.
  The wrapper div must fill its parent (h-full w-full) so SvelteFlow
  has a proper measurement context.

  Keyboard shortcuts are bound via @svelte-put/shortcut action on the wrapper div.
-->
<div
	bind:this={canvasEl}
	class="relative h-full w-full"
	ondragover={handleDragOver}
	ondrop={handleDrop}
	role="main"
	aria-label="CALM diagram canvas"
	use:shortcut={{
		trigger: [
			{ key: 'z', modifier: ['meta'], callback: handleUndo },
			{ key: 'z', modifier: ['meta', 'shift'], callback: handleRedo },
			{ key: 'c', modifier: ['meta'], callback: handleCopy },
			{ key: 'v', modifier: ['meta'], callback: handlePaste },
			{ key: 'a', modifier: ['meta'], callback: handleSelectAll },
			{ key: 'f', modifier: ['meta'], callback: handleToggleSearch },
		],
	}}
>
	<SvelteFlow
		bind:nodes
		bind:edges
		{nodeTypes}
		{edgeTypes}
		deleteKey={['Delete', 'Backspace']}
		selectionKey="Shift"
		multiSelectionKey="Meta"
		fitView
		zoomOnScroll={true}
		panOnDrag={true}
		panOnScroll={false}
		onconnect={handleConnect}
		onnodedragstop={handleNodeDragStop}
		onedgecontextmenu={handleEdgeContextMenu}
		onselectionchange={handleSelectionChange}
		onnodemouseenter={handleNodeMouseEnter}
		onnodemouseleave={handleNodeMouseLeave}
	>
		<Background variant={BackgroundVariant.Dots} gap={20} size={1} />
		<EdgeMarkers />
	</SvelteFlow>

	<!-- Floating pin button — appears on node hover -->
	{#if hoveredNodeId && pinBtnPos}
		<button
			type="button"
			class="pin-overlay-btn"
			class:pinned={nodes.find(n => n.id === hoveredNodeId)?.data?.pinned}
			style="left: {pinBtnPos.x}px; top: {pinBtnPos.y}px;"
			onmouseenter={() => { /* keep visible */ }}
			onclick={() => hoveredNodeId && togglePinNode(hoveredNodeId)}
			aria-label={nodes.find(n => n.id === hoveredNodeId)?.data?.pinned ? 'Unpin node' : 'Pin node'}
			title={nodes.find(n => n.id === hoveredNodeId)?.data?.pinned ? 'Unpin node (will move in auto-layout)' : 'Pin node (stays fixed in auto-layout)'}
		>
			<svg width="11" height="11" viewBox="0 0 24 24" fill={nodes.find(n => n.id === hoveredNodeId)?.data?.pinned ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="2.5" aria-hidden="true">
				<path d="M12 2L8 8H4l4 6v4l4-2 4 2v-4l4-6h-4L12 2z" stroke-linecap="round" stroke-linejoin="round" />
				<line x1="12" y1="18" x2="12" y2="22" stroke-linecap="round" />
			</svg>
		</button>
	{/if}

	<!-- Pinned node indicator dots — always visible on pinned nodes -->
	{#each nodes.filter(n => n.data?.pinned) as pinnedNode}
		{@const screenPos = flowToScreenPosition(pinnedNode.position)}
		{@const rect = canvasEl?.getBoundingClientRect()}
		<div
			class="pin-indicator"
			style="left: {screenPos.x - (rect?.left ?? 0) + 4}px; top: {screenPos.y - (rect?.top ?? 0) + 4}px;"
			title="Node is pinned — stays fixed during auto-layout"
			aria-hidden="true"
		></div>
	{/each}

	<!-- Floating search panel — shown when Cmd+F is pressed -->
	{#if searchOpen}
		<NodeSearch
			{nodes}
			onresults={handleSearchResults}
			onclose={closeSearch}
		/>
	{/if}

	<!-- Edge type context menu — right-click an edge to change its type -->
	{#if edgeMenu}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="edge-menu-backdrop" onclick={closeEdgeMenu}>
			<div
				class="edge-menu"
				style="left: {edgeMenu.x}px; top: {edgeMenu.y}px;"
				onclick={(e) => e.stopPropagation()}
			>
				<div class="edge-menu-header">Edge Type</div>
				{#each EDGE_TYPE_OPTIONS as opt}
					<button
						type="button"
						class="edge-menu-item"
						onclick={() => selectEdgeType(opt.value)}
					>
						{opt.label}
					</button>
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
	.edge-menu-backdrop {
		position: fixed;
		inset: 0;
		z-index: 100;
	}

	.edge-menu {
		position: fixed;
		z-index: 101;
		min-width: 140px;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 8px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04);
		padding: 4px;
		font-family: var(--font-sans);
	}

	:global(.dark) .edge-menu {
		background: #111827;
		border-color: #334155;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
	}

	.edge-menu-header {
		padding: 4px 8px;
		font-size: 10px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--color-text-tertiary);
	}

	.edge-menu-item {
		display: block;
		width: 100%;
		padding: 6px 8px;
		border: none;
		background: none;
		border-radius: 5px;
		font-size: 12px;
		font-family: inherit;
		color: var(--color-text-primary);
		text-align: left;
		cursor: pointer;
		transition: background 0.1s;
	}

	.edge-menu-item:hover {
		background: var(--color-surface-tertiary);
	}

	:global(.dark) .edge-menu-item {
		color: #e2e8f0;
	}

	:global(.dark) .edge-menu-item:hover {
		background: #1e293b;
	}

	/* ─── Pin overlay button ─────────────────────────────────── */

	.pin-overlay-btn {
		position: absolute;
		width: 20px;
		height: 20px;
		border: 1px solid var(--color-border);
		background: var(--color-surface);
		border-radius: 4px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		color: var(--color-text-tertiary);
		z-index: 20;
		padding: 0;
		box-shadow: 0 1px 3px rgba(0,0,0,0.08);
		transition: all 0.1s;
	}

	.pin-overlay-btn:hover {
		background: var(--color-surface-tertiary);
		color: var(--color-text-primary);
	}

	.pin-overlay-btn.pinned {
		color: var(--color-accent, #3b82f6);
		border-color: var(--color-accent, #3b82f6);
	}

	:global(.dark) .pin-overlay-btn {
		background: #111827;
		border-color: #334155;
		color: #64748b;
	}

	:global(.dark) .pin-overlay-btn:hover {
		background: #1e293b;
		color: #e2e8f0;
	}

	:global(.dark) .pin-overlay-btn.pinned {
		color: #60a5fa;
		border-color: #60a5fa;
	}

	/* ─── Pin indicator dot ──────────────────────────────────── */

	.pin-indicator {
		position: absolute;
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--color-accent, #3b82f6);
		z-index: 15;
		pointer-events: none;
		box-shadow: 0 0 0 2px var(--color-surface);
	}

	:global(.dark) .pin-indicator {
		background: #60a5fa;
		box-shadow: 0 0 0 2px #111827;
	}
</style>
