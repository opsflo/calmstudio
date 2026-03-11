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

	import '@xyflow/svelte/dist/style.css';

	// ─── Props ────────────────────────────────────────────────────────────────

	let {
		nodes = $bindable<Node[]>([]),
		edges = $bindable<Edge[]>([]),
		onplacenode,
	}: {
		nodes?: Node[];
		edges?: Edge[];
		/** Called by parent when a palette item is clicked — places node at viewport center. */
		onplacenode?: (type: string) => void;
	} = $props();

	// ─── Svelte Flow context ─────────────────────────────────────────────────

	const { screenToFlowPosition } = useSvelteFlow();

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

	function handleDrop(event: DragEvent) {
		event.preventDefault();
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

		// If it's a containment edge type, also set parentId on the target
		if (isContainmentType(edgeType)) {
			nodes = makeContainment(connection.source, connection.target, nodes);
		}
	}

	// ─── Node drag-into-container ────────────────────────────────────────────

	/**
	 * Checks whether two rectangle bounds overlap (used for drag-into-container detection).
	 */
	function boundsOverlap(
		a: { x: number; y: number; width?: number; height?: number },
		b: { x: number; y: number; width?: number; height?: number }
	): boolean {
		const aw = a.width ?? 150;
		const ah = a.height ?? 50;
		const bw = b.width ?? 150;
		const bh = b.height ?? 50;
		return (
			a.x < b.x + bw &&
			a.x + aw > b.x &&
			a.y < b.y + bh &&
			a.y + ah > b.y
		);
	}

	function handleNodeDragStop(event: NodeDragEvent) {
		const draggedNode = event.node;
		// Don't reparent nodes that are already parented or are containers themselves
		if (draggedNode.type === 'container' || draggedNode.parentId) return;

		// Find any container node whose bounds overlap the dragged node
		const containers = nodes.filter(
			(n) => n.type === 'container' && n.id !== draggedNode.id
		);

		for (const container of containers) {
			if (boundsOverlap(draggedNode.position, container.position)) {
				pushSnapshot(nodes, edges);
				nodes = makeContainment(container.id, draggedNode.id, nodes);
				return;
			}
		}
	}

	// ─── Keyboard shortcuts ───────────────────────────────────────────────────

	function handleUndo() {
		const snapshot = undo();
		if (snapshot) {
			nodes = snapshot.nodes;
			edges = snapshot.edges;
		}
	}

	function handleRedo() {
		const snapshot = redo();
		if (snapshot) {
			nodes = snapshot.nodes;
			edges = snapshot.edges;
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
</script>

<!--
  Full-size canvas wrapper. ondragover + ondrop handle palette drops.
  The wrapper div must fill its parent (h-full w-full) so SvelteFlow
  has a proper measurement context.

  Keyboard shortcuts are bound via @svelte-put/shortcut action on the wrapper div.
-->
<div
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
		deleteKey="Delete"
		selectionKey="Shift"
		multiSelectionKey="Meta"
		fitView
		zoomOnScroll={true}
		panOnDrag={true}
		panOnScroll={false}
		onconnect={handleConnect}
		onnodedragstop={handleNodeDragStop}
	>
		<Background variant={BackgroundVariant.Dots} gap={20} size={1} />
		<EdgeMarkers />
	</SvelteFlow>

	<!-- Floating search panel — shown when Cmd+F is pressed -->
	{#if searchOpen}
		<NodeSearch
			{nodes}
			onresults={handleSearchResults}
			onclose={closeSearch}
		/>
	{/if}
</div>
