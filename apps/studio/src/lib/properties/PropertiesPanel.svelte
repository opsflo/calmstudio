<!-- SPDX-FileCopyrightText: 2026 CalmStudio Contributors -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

<!--
  PropertiesPanel.svelte — Outer shell for the properties panel.
  Routes to NodeProperties or EdgeProperties based on current selection.
  When nothing is selected, shows a collapsed thin strip with a vertical label.
-->
<script lang="ts">
	import type { Node, Edge } from '@xyflow/svelte';
	import NodeProperties from './NodeProperties.svelte';
	import EdgeProperties from './EdgeProperties.svelte';

	let {
		selectedNode = null,
		selectedEdge = null,
		onBeforeFirstEdit,
	}: {
		selectedNode?: Node | null;
		selectedEdge?: Edge | null;
		/** Forwarded to NodeProperties/EdgeProperties for undo snapshot before first edit. */
		onBeforeFirstEdit?: () => void;
	} = $props();

	/** Prefer node when both are somehow selected. */
	const activeNode: Node | null = $derived(selectedNode ?? null);
	const activeEdge: Edge | null = $derived(!selectedNode ? (selectedEdge ?? null) : null);
	const hasSelection: boolean = $derived(activeNode !== null || activeEdge !== null);

	const headerText: string = $derived(
		activeNode
			? `Node: ${String(activeNode.data?.label ?? activeNode.data?.calmId ?? activeNode.id)}`
			: activeEdge
				? `Edge: ${String(activeEdge.data?.calmRelType ?? activeEdge.type ?? activeEdge.id)}`
				: 'Properties'
	);
</script>

<aside class="properties-panel" class:collapsed={!hasSelection} aria-label="Properties panel">
	{#if hasSelection}
		<div class="panel-content">
			{#if activeNode}
				<NodeProperties node={activeNode} {onBeforeFirstEdit} />
			{:else if activeEdge}
				<EdgeProperties edge={activeEdge} {onBeforeFirstEdit} />
			{/if}
		</div>
	{:else}
		<!-- Collapsed strip — thin panel with rotated "Properties" label -->
		<div class="collapsed-strip" aria-label="Properties panel — nothing selected">
			<svg
				class="panel-icon"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="1.5"
				aria-hidden="true"
			>
				<rect x="3" y="3" width="18" height="18" rx="2" />
				<path d="M9 3v18M3 9h6M3 15h6" stroke-linecap="round" />
			</svg>
			<span class="collapsed-label">Properties</span>
		</div>
	{/if}
</aside>

<style>
	.properties-panel {
		display: flex;
		flex-direction: column;
		height: 100%;
		background: var(--color-surface, #fff);
		border-left: 1px solid var(--color-border, #e2e8f0);
		font-family: var(--font-sans, inherit);
		overflow: hidden;
		min-width: 0;
	}

	:global(.dark) .properties-panel {
		background: #0f1320;
		border-color: #1e293b;
	}

	/* Expanded state — full panel content */
	.panel-content {
		flex: 1;
		overflow-y: auto;
		min-height: 0;
	}

	/* Collapsed state — ~40px wide strip */
	.properties-panel.collapsed {
		width: 40px;
		min-width: 40px;
		max-width: 40px;
		align-items: center;
	}

	.collapsed-strip {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10px;
		padding: 16px 0;
		width: 100%;
	}

	.panel-icon {
		width: 16px;
		height: 16px;
		color: var(--color-text-tertiary, #94a3b8);
		flex-shrink: 0;
	}

	:global(.dark) .panel-icon {
		color: #475569;
	}

	.collapsed-label {
		font-size: 10px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--color-text-tertiary, #94a3b8);
		writing-mode: vertical-rl;
		text-orientation: mixed;
		transform: rotate(180deg);
	}

	:global(.dark) .collapsed-label {
		color: #475569;
	}
</style>
