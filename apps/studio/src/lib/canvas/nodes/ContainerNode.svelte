<!-- SPDX-FileCopyrightText: 2024 CalmStudio contributors - see NOTICE file -->
<!-- SPDX-License-Identifier: Apache-2.0 -->
<script lang="ts">
	import { Handle, Position, NodeResizer, type NodeProps } from '@xyflow/svelte';

	let { id, data, selected }: NodeProps = $props();

	// Collapse state — use local reactive state, sync from data.collapsed
	let collapsed = $state(data.collapsed ?? false);

	function toggleCollapse() {
		collapsed = !collapsed;
		// Notify parent canvas of state change via custom DOM event
		// The canvas handler can update node data and show/hide child nodes
		const event = new CustomEvent('node:toggle-collapse', {
			detail: { nodeId: id, collapsed },
			bubbles: true,
			composed: true,
		});
		document.dispatchEvent(event);
	}
</script>

{#if !collapsed}
	<NodeResizer minWidth={200} minHeight={150} isVisible={selected} />
{/if}

<!-- Default handles (always present) -->
<Handle type="target" position={Position.Top} />
<Handle type="source" position={Position.Bottom} />
<Handle type="target" position={Position.Left} />
<Handle type="source" position={Position.Right} />

<!-- Interface handles -->
{#if data.interfaces}
	{#each data.interfaces as iface, i}
		<Handle
			type="source"
			position={Position.Right}
			id={iface['unique-id']}
			style="top: {20 + i * 20}%"
		/>
	{/each}
{/if}

{#if collapsed}
	<!-- Collapsed: compact node showing name only -->
	<div class="container-node collapsed" class:selected>
		<div class="collapsed-header">
			<span class="label">{data.label ?? data.calmId}</span>
			<button class="toggle-btn" onclick={toggleCollapse} title="Expand container" aria-label="Expand container">
				<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
					<!-- Chevron down (expand) -->
					<path d="M2 4 L6 8 L10 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
				</svg>
			</button>
		</div>
		<div class="type-badge">container</div>
	</div>
{:else}
	<!-- Expanded: boundary box with header bar -->
	<div class="container-node expanded" class:selected>
		<div class="header-bar">
			<span class="label">{data.label ?? data.calmId}</span>
			<div class="header-right">
				<span class="type-badge">container</span>
				<button class="toggle-btn" onclick={toggleCollapse} title="Collapse container" aria-label="Collapse container">
					<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
						<!-- Chevron up (collapse) -->
						<path d="M2 8 L6 4 L10 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
					</svg>
				</button>
			</div>
		</div>
		<!-- Children render inside via Svelte Flow parentId + extent:'parent' -->
		<div class="container-body"></div>
	</div>
{/if}

<style>
	.container-node {
		color: #1a1a1a;
		cursor: default;
		user-select: none;
	}

	/* Collapsed variant */
	.container-node.collapsed {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 8px 14px;
		border: 2px solid #1a1a1a;
		border-radius: 6px;
		min-width: 120px;
		background: transparent;
	}

	.container-node.collapsed.selected {
		border-color: #3b82f6;
	}

	.collapsed-header {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	/* Expanded variant — fills parent (Svelte Flow manages width/height via style prop) */
	.container-node.expanded {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		border: 2px dashed #9ca3af;
		border-radius: 8px;
		min-width: 200px;
		min-height: 150px;
		background: transparent;
	}

	.container-node.expanded.selected {
		border-color: #3b82f6;
	}

	.header-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 4px 10px;
		border-bottom: 1px solid #d1d5db;
		background: rgba(0, 0, 0, 0.03);
		border-radius: 6px 6px 0 0;
	}

	.header-right {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.container-body {
		flex: 1;
	}

	.label {
		font-size: 11px;
		font-weight: 600;
		max-width: 140px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.type-badge {
		font-size: 9px;
		color: #6b7280;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.toggle-btn {
		background: none;
		border: none;
		padding: 2px;
		cursor: pointer;
		color: #6b7280;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 3px;
		transition: background 0.15s;
	}

	.toggle-btn:hover {
		background: rgba(0, 0, 0, 0.08);
		color: #1a1a1a;
	}
</style>
