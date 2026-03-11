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

  Key decisions:
  - MUST use $state.raw for nodes/edges — Svelte Flow mutates arrays internally;
    deep $state() reactivity causes double-render loops (RESEARCH Pitfall 1)
  - makeContainment is called for both edge-draw and node drag-into (per user decision)
-->
<script lang="ts">
	import {
		SvelteFlow,
		useSvelteFlow,
		type Node,
		type Edge,
		type Connection,
		type NodeDragEvent,
	} from '@xyflow/svelte';
	import { nanoid } from 'nanoid';

	import { nodeTypes, resolveNodeType } from './nodeTypes';
	import { edgeTypes, DEFAULT_EDGE_TYPE } from './edgeTypes';
	import { makeContainment, isContainmentType } from './containment';
	import EdgeMarkers from './edges/EdgeMarkers.svelte';

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
				nodes = makeContainment(container.id, draggedNode.id, nodes);
				return;
			}
		}
	}
</script>

<!--
  Full-size canvas wrapper. ondragover + ondrop handle palette drops.
  The wrapper div must fill its parent (h-full w-full) so SvelteFlow
  has a proper measurement context.
-->
<div
	class="h-full w-full"
	ondragover={handleDragOver}
	ondrop={handleDrop}
	role="main"
	aria-label="CALM diagram canvas"
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
		<!-- Shared SVG marker defs — rendered once, referenced by all edge components -->
		<EdgeMarkers />
	</SvelteFlow>
</div>
