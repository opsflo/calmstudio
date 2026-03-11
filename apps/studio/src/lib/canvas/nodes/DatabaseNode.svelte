<!-- SPDX-FileCopyrightText: 2024 CalmStudio contributors - see NOTICE file -->
<!-- SPDX-License-Identifier: Apache-2.0 -->
<script lang="ts">
	import { Handle, Position, NodeResizer, type NodeProps } from '@xyflow/svelte';

	let { id, data, selected }: NodeProps = $props();
</script>

<NodeResizer minWidth={90} minHeight={100} isVisible={selected} />

<!-- Default handles -->
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

<!-- Cylinder shape: ellipse top + rect body + ellipse bottom -->
<div class="database-node" class:selected>
	<svg width="60" height="80" viewBox="0 0 60 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
		<!-- Cylinder body sides -->
		<path d="M5 16 L5 64" stroke="currentColor" stroke-width="2" />
		<path d="M55 16 L55 64" stroke="currentColor" stroke-width="2" />
		<!-- Bottom ellipse -->
		<ellipse cx="30" cy="64" rx="25" ry="8" stroke="currentColor" stroke-width="2" fill="none" />
		<!-- Top ellipse -->
		<ellipse cx="30" cy="16" rx="25" ry="8" stroke="currentColor" stroke-width="2" fill="none" />
		<!-- Middle line (shelf) -->
		<ellipse cx="30" cy="30" rx="25" ry="8" stroke="currentColor" stroke-width="1" stroke-dasharray="4 3" fill="none" />
	</svg>
	<div class="label">{data.label ?? data.calmId}</div>
	<div class="type-badge">database</div>
</div>

<style>
	.database-node {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 4px 8px;
		min-width: 90px;
		min-height: 100px;
		color: #1a1a1a;
		cursor: default;
		user-select: none;
	}

	.database-node.selected svg ellipse,
	.database-node.selected svg path,
	.database-node.selected svg line {
		stroke: #3b82f6;
	}

	.label {
		font-size: 11px;
		font-weight: 600;
		text-align: center;
		margin-top: 4px;
		max-width: 100px;
		word-break: break-word;
	}

	.type-badge {
		font-size: 9px;
		color: #6b7280;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-top: 2px;
	}
</style>
