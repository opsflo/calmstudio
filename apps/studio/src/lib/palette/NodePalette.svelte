<!-- SPDX-FileCopyrightText: 2024 CalmStudio contributors - see NOTICE file -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

<!--
  NodePalette.svelte — Left sidebar panel showing the 9 CALM node types and a Custom entry.
  Supports:
  - Drag-and-drop: draggable items set 'application/calm-node-type' on dataTransfer
  - Click-to-place: clicking dispatches a 'placenode' CustomEvent with { detail: { type } }
  - Search: substring filter on type names
  - Custom node: inline text input to enter an arbitrary type string

  The parent (+page.svelte) listens to the 'placenode' event and creates a node at canvas center.
-->
<script lang="ts">
	import { useDnD } from './DnDProvider.svelte';

	const dnd = useDnD();

	/** Called when user clicks a palette item — dispatches placenode CustomEvent. */
	let { onplacenode }: { onplacenode?: (type: string) => void } = $props();

	/** The 9 core CALM node types shown in the palette. */
	const CALM_TYPES = [
		'actor',
		'system',
		'service',
		'database',
		'network',
		'webclient',
		'ecosystem',
		'ldap',
		'data-asset',
	] as const;

	let searchQuery = $state('');
	let showCustomInput = $state(false);
	let customTypeValue = $state('');

	/** Filtered list of CALM types based on search query. */
	const filteredTypes = $derived(
		searchQuery.trim() === ''
			? ([...CALM_TYPES] as string[])
			: CALM_TYPES.filter((t) => t.includes(searchQuery.toLowerCase()))
	);

	function handleDragStart(event: DragEvent, type: string) {
		if (!event.dataTransfer) return;
		event.dataTransfer.setData('application/calm-node-type', type);
		event.dataTransfer.effectAllowed = 'copy';
		dnd.setDragType(type);
	}

	function handleDragEnd() {
		dnd.setDragType(null);
	}

	function handleClick(type: string) {
		onplacenode?.(type);
	}

	function handleCustomKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			const trimmed = customTypeValue.trim();
			if (trimmed) {
				onplacenode?.(trimmed);
				customTypeValue = '';
				showCustomInput = false;
			}
		} else if (event.key === 'Escape') {
			showCustomInput = false;
			customTypeValue = '';
		}
	}

	/** Mini SVG icon for each CALM type — matches the shape used in node components. */
	function getIcon(type: string): string {
		switch (type) {
			case 'actor':
				// Person silhouette: head + trapezoid body
				return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="6" r="3.5"/>
          <path d="M5 20 Q5 14 12 14 Q19 14 19 20"/>
        </svg>`;
			case 'system':
				// Double border rectangle
				return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="2" y="2" width="20" height="20" rx="1"/>
          <rect x="4.5" y="4.5" width="15" height="15" rx="1" stroke-width="1"/>
        </svg>`;
			case 'service':
				// Rounded rect with small gear hint (cog outline)
				return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="2" y="2" width="20" height="20" rx="4"/>
          <circle cx="12" cy="12" r="3"/>
          <line x1="12" y1="5" x2="12" y2="7"/>
          <line x1="12" y1="17" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="7" y2="12"/>
          <line x1="17" y1="12" x2="19" y2="12"/>
        </svg>`;
			case 'database':
				// Cylinder: ellipse top + sides + ellipse bottom
				return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <ellipse cx="12" cy="6" rx="8" ry="3"/>
          <line x1="4" y1="6" x2="4" y2="18"/>
          <line x1="20" y1="6" x2="20" y2="18"/>
          <ellipse cx="12" cy="18" rx="8" ry="3"/>
        </svg>`;
			case 'network':
				// Cloud shape
				return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M6.5 19C4 19 2 17 2 14.5C2 12.3 3.6 10.4 5.7 10.1C5.9 7.3 8.2 5 11 5C13.4 5 15.5 6.6 16.3 8.8C16.7 8.6 17.1 8.5 17.5 8.5C19.4 8.5 21 10.1 21 12C21 13.9 19.4 15.5 17.5 15.5H6.5Z"/>
        </svg>`;
			case 'webclient':
				// Browser window: rect + toolbar divider
				return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="2" y="3" width="20" height="18" rx="2"/>
          <line x1="2" y1="8" x2="22" y2="8"/>
          <circle cx="5.5" cy="5.5" r="1" fill="currentColor" stroke="none"/>
          <circle cx="8.5" cy="5.5" r="1" fill="currentColor" stroke="none"/>
          <rect x="11" y="4.5" width="8" height="2" rx="1"/>
        </svg>`;
			case 'ecosystem':
				// Hexagon
				return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <polygon points="12,2 20.7,7 20.7,17 12,22 3.3,17 3.3,7"/>
        </svg>`;
			case 'ldap':
				// Shield with key
				return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M12 2 L20 5.5 V11 C20 16 16 20 12 22 C8 20 4 16 4 11 V5.5 Z"/>
          <circle cx="11" cy="11" r="2.5"/>
          <line x1="13.5" y1="11" x2="17" y2="11"/>
          <line x1="17" y1="11" x2="17" y2="14"/>
          <line x1="15" y1="11" x2="15" y2="13"/>
        </svg>`;
			case 'data-asset':
				// Document with folded corner
				return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M5 2 H15 L19 6 V22 H5 Z"/>
          <polyline points="15,2 15,6 19,6"/>
          <line x1="8" y1="10" x2="16" y2="10"/>
          <line x1="8" y1="13" x2="16" y2="13"/>
          <line x1="8" y1="16" x2="13" y2="16"/>
        </svg>`;
			default:
				// Generic dashed box
				return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="4 2">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
        </svg>`;
		}
	}

	/** Friendly display label for each type (capitalised + hyphen replaced by space). */
	function getLabel(type: string): string {
		return type
			.split('-')
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(' ');
	}
</script>

<!--
  Fixed-width left sidebar (~240px).
  Full viewport height, scrollable if many items.
-->
<aside
	class="flex h-full w-60 flex-shrink-0 flex-col border-r border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900"
	aria-label="CALM node palette"
>
	<!-- Search input -->
	<div class="border-b border-neutral-200 p-3 dark:border-neutral-700">
		<input
			type="search"
			placeholder="Search types..."
			bind:value={searchQuery}
			class="w-full rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm text-neutral-900 placeholder-neutral-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-500"
			aria-label="Search node types"
		/>
	</div>

	<!-- Palette items -->
	<ul class="flex-1 overflow-y-auto py-2" role="list" aria-label="Node type list">
		{#each filteredTypes as type (type)}
			<li>
				<button
					type="button"
					draggable="true"
					ondragstart={(e) => handleDragStart(e, type)}
					ondragend={handleDragEnd}
					onclick={() => handleClick(type)}
					class="flex w-full cursor-grab items-center gap-2.5 px-3 py-2 text-left text-sm
            text-neutral-700 hover:bg-neutral-100 active:cursor-grabbing
            dark:text-neutral-300 dark:hover:bg-neutral-800"
					aria-label="Drag or click to place {getLabel(type)} node"
					title="Drag to canvas or click to place at center"
				>
					<span class="flex-shrink-0 text-neutral-500 dark:text-neutral-400">
						<!-- eslint-disable-next-line svelte/no-at-html-tags -->
						{@html getIcon(type)}
					</span>
					<span class="font-medium">{getLabel(type)}</span>
				</button>
			</li>
		{/each}

		{#if filteredTypes.length === 0}
			<li class="px-3 py-4 text-center text-sm text-neutral-400 dark:text-neutral-500">
				No types match &ldquo;{searchQuery}&rdquo;
			</li>
		{/if}
	</ul>

	<!-- Custom node entry at bottom -->
	<div class="border-t border-neutral-200 p-2 dark:border-neutral-700">
		{#if showCustomInput}
			<input
				type="text"
				placeholder="Enter type string..."
				bind:value={customTypeValue}
				onkeydown={handleCustomKeydown}
				class="w-full rounded-md border border-blue-400 bg-white px-3 py-1.5 text-sm text-neutral-900
          outline-none focus:ring-2 focus:ring-blue-400 dark:bg-neutral-800 dark:text-neutral-100"
				aria-label="Custom node type input"
				autofocus
			/>
			<p class="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
				Press Enter to place, Esc to cancel
			</p>
		{:else}
			<button
				type="button"
				onclick={() => (showCustomInput = true)}
				class="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-neutral-500
          hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800
          dark:hover:text-neutral-200"
				aria-label="Create a custom node type"
			>
				<svg
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="1.5"
					class="flex-shrink-0 text-neutral-400"
					aria-hidden="true"
				>
					<rect x="3" y="3" width="18" height="18" rx="2" stroke-dasharray="4 2" />
					<line x1="12" y1="8" x2="12" y2="16" />
					<line x1="8" y1="12" x2="16" y2="12" />
				</svg>
				<span class="font-medium">Custom...</span>
			</button>
		{/if}
	</div>
</aside>
