<!-- SPDX-FileCopyrightText: 2024 CalmStudio contributors - see NOTICE file -->
<!-- SPDX-License-Identifier: Apache-2.0 -->
<script lang="ts">
	import { Handle, Position, NodeResizer, type NodeProps } from '@xyflow/svelte';

	let { id, data, selected }: NodeProps = $props();
</script>

<NodeResizer minWidth={140} minHeight={64} isVisible={selected} />

<Handle type="target" position={Position.Top} />
<Handle type="source" position={Position.Bottom} />
<Handle type="target" position={Position.Left} />
<Handle type="source" position={Position.Right} />

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

<div class="node-card" class:selected>
	<div class="icon-container">
		<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
			<ellipse cx="12" cy="5.5" rx="8" ry="2.5" stroke="currentColor" stroke-width="1.5" />
			<path d="M4 5.5v13c0 1.38 3.58 2.5 8 2.5s8-1.12 8-2.5v-13" stroke="currentColor" stroke-width="1.5" />
			<path d="M4 12c0 1.38 3.58 2.5 8 2.5s8-1.12 8-2.5" stroke="currentColor" stroke-width="1.2" opacity="0.5" />
		</svg>
	</div>
	<div class="node-content">
		<span class="label">{data.label ?? data.calmId}</span>
		<span class="type-badge">Database</span>
	</div>
</div>

<style>
	.node-card {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 10px 14px;
		min-width: 140px;
		background: var(--node-database-bg);
		border: 1.5px solid var(--node-database-border);
		border-radius: 10px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02);
		transition: all 0.15s ease;
		font-family: var(--node-font);
		cursor: default;
		user-select: none;
	}

	.node-card:hover {
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04);
	}

	.node-card.selected {
		border-color: var(--node-selected-ring);
		box-shadow: 0 0 0 2px var(--node-selected-ring), 0 2px 8px rgba(99, 102, 241, 0.12);
	}

	.icon-container {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border-radius: 8px;
		background: var(--node-database-border);
		color: var(--node-database-stroke);
		flex-shrink: 0;
	}

	:global(.dark) .icon-container {
		background: rgba(217, 119, 6, 0.12);
	}

	.node-content {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}

	.label {
		font-size: 12px;
		font-weight: 600;
		color: var(--node-label-color);
		line-height: 1.3;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		max-width: 120px;
	}

	.type-badge {
		font-size: 10px;
		font-weight: 500;
		color: var(--node-database-badge);
		letter-spacing: 0.02em;
		margin-top: 1px;
	}
</style>
