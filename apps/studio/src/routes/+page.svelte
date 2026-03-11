<!-- SPDX-FileCopyrightText: 2024 CalmStudio contributors - see NOTICE file -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

<!--
  +page.svelte — Main layout: left sidebar palette + full-height canvas area.

  State ownership:
  - nodes and edges live here at the page level (passed down via bind:)
  - Both use $state.raw — Svelte Flow mutates these arrays internally; deep
    $state() reactivity causes double-render loops (per RESEARCH Pitfall 1)

  Click-to-place flow:
  1. User clicks a palette item
  2. NodePalette calls its onplacenode prop with the CALM type string
  3. +page.svelte forwards the type to CalmCanvas.placeNodeAtCenter()
  4. CalmCanvas places a node at viewport center
-->
<script lang="ts">
	import type { Node, Edge } from '@xyflow/svelte';
	import DnDProvider from '$lib/palette/DnDProvider.svelte';
	import NodePalette from '$lib/palette/NodePalette.svelte';
	import CalmCanvas from '$lib/canvas/CalmCanvas.svelte';

	// MUST use $state.raw — Svelte Flow mutates these arrays internally.
	// See RESEARCH Pitfall 1 and Phase 02 decision log.
	let nodes = $state.raw<Node[]>([]);
	let edges = $state.raw<Edge[]>([]);

	/** Reference to CalmCanvas so we can call placeNodeAtCenter() on click-to-place. */
	let canvas: CalmCanvas;

	function handlePalettePlace(type: string) {
		canvas?.placeNodeAtCenter(type);
	}
</script>

<!--
  Full-viewport layout.
  DnDProvider wraps both palette and canvas so they share drag-type context.
  NodePalette: fixed 240px left sidebar.
  CalmCanvas: flex-1, fills remaining space.
-->
<DnDProvider>
	<div class="flex h-screen w-screen overflow-hidden bg-neutral-50 dark:bg-neutral-950">
		<NodePalette onplacenode={handlePalettePlace} />

		<main class="relative flex-1 overflow-hidden">
			<CalmCanvas bind:this={canvas} bind:nodes bind:edges />
		</main>
	</div>
</DnDProvider>
