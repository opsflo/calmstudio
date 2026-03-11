<!-- SPDX-FileCopyrightText: 2026 CalmStudio Contributors -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

<!--
  NodeSearch.svelte — Floating search bar for filtering canvas nodes.

  Renders a floating search input in the top-right area of the canvas.
  On input change, calls searchNodes() and dispatches matching IDs to parent.
  Escape key or X button closes the search panel.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import type { Node } from '@xyflow/svelte';
	import { createNodeSearcher, searchNodes } from './search';

	let {
		nodes = [],
		onresults,
		onclose,
	}: {
		nodes?: Node[];
		/** Called with matching node IDs when query changes */
		onresults?: (ids: string[]) => void;
		/** Called when search is dismissed */
		onclose?: () => void;
	} = $props();

	let query = $state('');
	let inputEl: HTMLInputElement;

	// Recompute searcher when nodes change
	let searcher = $derived(createNodeSearcher(nodes));
	let matchIds = $derived(searchNodes(searcher, query));
	let matchCount = $derived(matchIds.length);
	let totalCount = $derived(nodes.length);

	// Notify parent on result changes
	$effect(() => {
		onresults?.(matchIds);
	});

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			onclose?.();
		}
	}

	onMount(() => {
		inputEl?.focus();
	});
</script>

<!--
  Floating panel anchored to top-right of canvas.
  Absolute positioning handled by parent's `relative` container.
-->
<div
	class="absolute right-4 top-4 z-50 flex w-64 flex-col gap-1 rounded-lg border border-neutral-200
	       bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-900"
	role="search"
	aria-label="Search nodes"
>
	<div class="flex items-center gap-2 px-3 py-2">
		<!-- Search icon -->
		<svg
			class="h-4 w-4 shrink-0 text-neutral-400"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			aria-hidden="true"
		>
			<circle cx="11" cy="11" r="8" />
			<path d="m21 21-4.35-4.35" />
		</svg>

		<input
			bind:this={inputEl}
			bind:value={query}
			type="text"
			placeholder="Search nodes..."
			onkeydown={handleKeydown}
			class="min-w-0 flex-1 bg-transparent text-sm text-neutral-800 outline-none
			       placeholder:text-neutral-400 dark:text-neutral-100"
			aria-label="Node search input"
		/>

		<!-- Close button -->
		<button
			onclick={() => onclose?.()}
			class="shrink-0 text-neutral-400 transition hover:text-neutral-700 dark:hover:text-neutral-200"
			aria-label="Close search"
		>
			<svg
				class="h-4 w-4"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				aria-hidden="true"
			>
				<path d="M18 6 6 18M6 6l12 12" />
			</svg>
		</button>
	</div>

	<!-- Result count — only shown when query is non-empty -->
	{#if query.trim()}
		<div class="border-t border-neutral-100 px-3 py-1.5 text-xs text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
			{matchCount} of {totalCount} node{totalCount !== 1 ? 's' : ''}
		</div>
	{/if}
</div>
