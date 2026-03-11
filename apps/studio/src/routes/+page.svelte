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

  Dark mode toggle:
  - Theme button in top-right toolbar calls toggleTheme()
  - isDark() reflects current state for sun/moon icon switching
-->
<script lang="ts">
	import type { Node, Edge } from '@xyflow/svelte';
	import DnDProvider from '$lib/palette/DnDProvider.svelte';
	import NodePalette from '$lib/palette/NodePalette.svelte';
	import CalmCanvas from '$lib/canvas/CalmCanvas.svelte';
	import { toggleTheme, isDark } from '$lib/stores/theme.svelte';

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
  Theme toggle: absolute top-right corner button.
-->
<DnDProvider>
	<div class="flex h-screen w-screen overflow-hidden bg-neutral-50 dark:bg-neutral-950">
		<NodePalette onplacenode={handlePalettePlace} />

		<main class="relative flex-1 overflow-hidden">
			<!-- Dark mode toggle — top-right toolbar -->
			<div class="absolute right-4 top-4 z-50">
				<button
					onclick={toggleTheme}
					class="flex h-8 w-8 items-center justify-center rounded-md border
					       border-neutral-200 bg-white text-neutral-600 shadow-sm transition
					       hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900
					       dark:text-neutral-300 dark:hover:bg-neutral-800"
					aria-label={isDark() ? 'Switch to light mode' : 'Switch to dark mode'}
					title={isDark() ? 'Switch to light mode' : 'Switch to dark mode'}
				>
					{#if isDark()}
						<!-- Sun icon -->
						<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
							<circle cx="12" cy="12" r="4" />
							<path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
						</svg>
					{:else}
						<!-- Moon icon -->
						<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
							<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
						</svg>
					{/if}
				</button>
			</div>

			<CalmCanvas bind:this={canvas} bind:nodes bind:edges />
		</main>
	</div>
</DnDProvider>
