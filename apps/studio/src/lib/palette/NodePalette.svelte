<!-- SPDX-FileCopyrightText: 2024 CalmStudio contributors - see NOTICE file -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

<script lang="ts">
	import { useDnD } from './DnDProvider.svelte';

	const dnd = useDnD();

	let { onplacenode }: { onplacenode?: (type: string) => void } = $props();

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

	/** Returns the CSS custom property prefix for a node type's color */
	function getColorVar(type: string): string {
		return `--node-${type}`;
	}

	function getIcon(type: string): string {
		switch (type) {
			case 'actor':
				return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
					<circle cx="12" cy="7" r="4"/><path d="M5.5 21c0-3.5 2.9-6.5 6.5-6.5s6.5 3 6.5 6.5" stroke-linecap="round"/>
				</svg>`;
			case 'system':
				return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
					<rect x="3" y="3" width="18" height="18" rx="2"/><rect x="7" y="7" width="10" height="10" rx="1" stroke-width="1.2"/>
				</svg>`;
			case 'service':
				return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
					<circle cx="12" cy="12" r="3"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke-linecap="round"/>
				</svg>`;
			case 'database':
				return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
					<ellipse cx="12" cy="5.5" rx="8" ry="2.5"/><path d="M4 5.5v13c0 1.38 3.58 2.5 8 2.5s8-1.12 8-2.5v-13"/>
				</svg>`;
			case 'network':
				return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
					<path d="M6.5 19c-2.5 0-4.5-2-4.5-4.5 0-2.2 1.6-4.1 3.7-4.4C5.9 7.3 8.2 5 11 5c2.4 0 4.5 1.6 5.3 3.8.4-.2.8-.3 1.2-.3 1.9 0 3.5 1.6 3.5 3.5s-1.6 3.5-3.5 3.5H6.5Z" stroke-linejoin="round"/>
				</svg>`;
			case 'webclient':
				return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
					<rect x="2" y="3" width="20" height="18" rx="2"/><path d="M2 8h20"/><circle cx="5.5" cy="5.5" r="1" fill="currentColor" stroke="none"/><circle cx="8.5" cy="5.5" r="1" fill="currentColor" stroke="none"/>
				</svg>`;
			case 'ecosystem':
				return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
					<path d="M12 2l8.5 5v10L12 22l-8.5-5V7L12 2Z" stroke-linejoin="round"/>
				</svg>`;
			case 'ldap':
				return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
					<path d="M12 2l8 3.5V11c0 5-3.5 9.7-8 11-4.5-1.3-8-6-8-11V5.5L12 2Z" stroke-linejoin="round"/>
					<circle cx="12" cy="10" r="2" stroke-width="1.2"/><path d="M12 12v4M12 14h2" stroke-width="1.2" stroke-linecap="round"/>
				</svg>`;
			case 'data-asset':
				return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
					<path d="M6 2h9l5 5v15H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z" stroke-linejoin="round"/><path d="M15 2v5h5"/>
					<path d="M8 10h8M8 13h8M8 16h5" stroke-width="1.2" stroke-linecap="round"/>
				</svg>`;
			default:
				return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="4 2">
					<rect x="3" y="3" width="18" height="18" rx="3"/>
				</svg>`;
		}
	}

	function getLabel(type: string): string {
		return type
			.split('-')
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(' ');
	}
</script>

<aside class="palette" aria-label="CALM node palette">
	<!-- Header -->
	<div class="palette-header">
		<svg class="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
			<rect x="3" y="3" width="7" height="7" rx="1.5"/>
			<rect x="14" y="3" width="7" height="7" rx="1.5"/>
			<rect x="3" y="14" width="7" height="7" rx="1.5"/>
			<rect x="14" y="14" width="7" height="7" rx="1.5"/>
		</svg>
		<span class="header-label">Components</span>
	</div>

	<!-- Search -->
	<div class="search-wrapper">
		<div class="search-container">
			<svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
				<circle cx="11" cy="11" r="8" />
				<path d="m21 21-4.35-4.35" />
			</svg>
			<input
				type="search"
				placeholder="Search..."
				bind:value={searchQuery}
				class="search-input"
				aria-label="Search node types"
			/>
		</div>
	</div>

	<!-- Palette items -->
	<ul class="palette-list" role="list" aria-label="Node type list">
		{#each filteredTypes as type (type)}
			<li>
				<button
					type="button"
					draggable="true"
					ondragstart={(e) => handleDragStart(e, type)}
					ondragend={handleDragEnd}
					ondblclick={() => handleClick(type)}
					class="palette-item"
					style="--item-border: var({getColorVar(type)}-border); --item-stroke: var({getColorVar(type)}-stroke); --item-bg: var({getColorVar(type)}-bg);"
					aria-label="Drag or double-click to place {getLabel(type)} node"
					title="Drag to canvas or double-click to place"
				>
					<span class="item-icon" style="background: var({getColorVar(type)}-border); color: var({getColorVar(type)}-stroke);">
						{@html getIcon(type)}
					</span>
					<span class="item-label">{getLabel(type)}</span>
				</button>
			</li>
		{/each}

		{#if filteredTypes.length === 0}
			<li class="empty-state">
				No match for "{searchQuery}"
			</li>
		{/if}
	</ul>

	<!-- Custom node entry -->
	<div class="palette-footer">
		{#if showCustomInput}
			<input
				type="text"
				placeholder="Enter type name..."
				bind:value={customTypeValue}
				onkeydown={handleCustomKeydown}
				class="custom-input"
				aria-label="Custom node type input"
				autofocus
			/>
			<p class="custom-hint">
				Enter to place &middot; Esc to cancel
			</p>
		{:else}
			<button
				type="button"
				onclick={() => (showCustomInput = true)}
				class="custom-btn"
				aria-label="Create a custom node type"
			>
				<span class="custom-icon">
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
						<line x1="12" y1="5" x2="12" y2="19" />
						<line x1="5" y1="12" x2="19" y2="12" />
					</svg>
				</span>
				<span class="item-label">Custom...</span>
			</button>
		{/if}
	</div>
</aside>

<style>
	.palette {
		display: flex;
		flex-direction: column;
		width: 224px;
		height: 100%;
		flex-shrink: 0;
		background: var(--color-surface);
		border-right: 1px solid var(--color-border);
		font-family: var(--font-sans);
	}

	:global(.dark) .palette {
		background: #0f1320;
		border-color: #1e293b;
	}

	/* Header */
	.palette-header {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 14px 16px;
		border-bottom: 1px solid var(--color-border);
	}

	:global(.dark) .palette-header {
		border-color: #1e293b;
	}

	.header-icon {
		width: 15px;
		height: 15px;
		color: var(--color-accent);
	}

	:global(.dark) .header-icon {
		color: #818cf8;
	}

	.header-label {
		font-size: 11px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-text-tertiary);
	}

	:global(.dark) .header-label {
		color: #64748b;
	}

	/* Search */
	.search-wrapper {
		padding: 10px 12px;
	}

	.search-container {
		position: relative;
	}

	.search-icon {
		position: absolute;
		left: 10px;
		top: 50%;
		transform: translateY(-50%);
		width: 14px;
		height: 14px;
		color: var(--color-text-tertiary);
		pointer-events: none;
	}

	.search-input {
		width: 100%;
		padding: 7px 12px 7px 32px;
		font-size: 12px;
		font-family: inherit;
		color: var(--color-text-primary);
		background: var(--color-surface-secondary);
		border: 1px solid var(--color-border);
		border-radius: 8px;
		outline: none;
		transition: all 0.15s ease;
	}

	.search-input::placeholder {
		color: var(--color-text-tertiary);
	}

	.search-input:focus {
		border-color: var(--color-accent);
		box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.12);
	}

	:global(.dark) .search-input {
		background: #1e293b;
		border-color: #334155;
		color: #e2e8f0;
	}

	:global(.dark) .search-input::placeholder {
		color: #64748b;
	}

	:global(.dark) .search-input:focus {
		border-color: #818cf8;
		box-shadow: 0 0 0 2px rgba(129, 140, 248, 0.15);
	}

	/* Palette list */
	.palette-list {
		flex: 1;
		overflow-y: auto;
		padding: 4px 8px;
		margin: 0;
		list-style: none;
	}

	.palette-item {
		display: flex;
		width: 100%;
		align-items: center;
		gap: 10px;
		padding: 7px 10px;
		border: none;
		background: transparent;
		border-radius: 8px;
		cursor: grab;
		text-align: left;
		font-family: inherit;
		transition: all 0.15s ease;
	}

	.palette-item:hover {
		background: var(--color-surface-tertiary);
	}

	.palette-item:active {
		cursor: grabbing;
	}

	:global(.dark) .palette-item:hover {
		background: #1e293b;
	}

	.item-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 30px;
		height: 30px;
		border-radius: 7px;
		flex-shrink: 0;
		transition: all 0.15s ease;
	}

	:global(.dark) .item-icon {
		background: color-mix(in srgb, var(--item-stroke) 12%, transparent) !important;
	}

	.item-label {
		font-size: 12.5px;
		font-weight: 500;
		color: var(--color-text-secondary);
		transition: color 0.15s ease;
	}

	.palette-item:hover .item-label {
		color: var(--color-text-primary);
	}

	:global(.dark) .item-label {
		color: #94a3b8;
	}

	:global(.dark) .palette-item:hover .item-label {
		color: #e2e8f0;
	}

	.empty-state {
		padding: 20px 12px;
		text-align: center;
		font-size: 12px;
		color: var(--color-text-tertiary);
	}

	/* Footer */
	.palette-footer {
		padding: 8px;
		border-top: 1px solid var(--color-border);
	}

	:global(.dark) .palette-footer {
		border-color: #1e293b;
	}

	.custom-btn {
		display: flex;
		width: 100%;
		align-items: center;
		gap: 10px;
		padding: 7px 10px;
		border: none;
		background: transparent;
		border-radius: 8px;
		cursor: pointer;
		font-family: inherit;
		transition: all 0.15s ease;
	}

	.custom-btn:hover {
		background: var(--color-accent-subtle);
	}

	.custom-btn:hover .item-label {
		color: var(--color-accent);
	}

	:global(.dark) .custom-btn:hover {
		background: rgba(129, 140, 248, 0.08);
	}

	:global(.dark) .custom-btn:hover .item-label {
		color: #818cf8;
	}

	.custom-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 30px;
		height: 30px;
		border-radius: 7px;
		border: 1.5px dashed var(--color-border);
		color: var(--color-text-tertiary);
		flex-shrink: 0;
	}

	:global(.dark) .custom-icon {
		border-color: #334155;
		color: #64748b;
	}

	.custom-input {
		width: 100%;
		padding: 8px 12px;
		font-size: 12px;
		font-family: inherit;
		color: var(--color-text-primary);
		background: var(--color-surface);
		border: 1.5px solid var(--color-accent);
		border-radius: 8px;
		outline: none;
		box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.12);
	}

	:global(.dark) .custom-input {
		background: #1e293b;
		border-color: #818cf8;
		color: #e2e8f0;
		box-shadow: 0 0 0 2px rgba(129, 140, 248, 0.15);
	}

	.custom-hint {
		margin: 6px 0 0;
		text-align: center;
		font-size: 10px;
		color: var(--color-text-tertiary);
	}
</style>
