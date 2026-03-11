<!-- SPDX-FileCopyrightText: 2024 CalmStudio contributors - see NOTICE file -->
<!-- SPDX-License-Identifier: Apache-2.0 -->
<script lang="ts">
	import { Handle, Position, NodeResizer, type NodeProps } from '@xyflow/svelte';

	let { id, data, selected }: NodeProps = $props();
</script>

<NodeResizer minWidth={110} minHeight={80} isVisible={selected} />

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

<!-- Cloud shape: overlapping circles -->
<div class="network-node" class:selected>
	<svg width="80" height="55" viewBox="0 0 80 55" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
		<!-- Cloud shape built from overlapping arcs -->
		<path
			d="M20 44 Q8 44 8 34 Q8 24 18 22 Q18 10 30 10 Q38 10 42 16 Q46 12 52 12 Q64 12 64 24 Q72 24 72 34 Q72 44 60 44 Z"
			stroke="currentColor"
			stroke-width="2"
			fill="none"
			stroke-linejoin="round"
		/>
	</svg>
	<div class="label">{data.label ?? data.calmId}</div>
	<div class="type-badge">network</div>
</div>

<style>
	.network-node {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 4px 8px;
		min-width: 110px;
		min-height: 80px;
		color: #1a1a1a;
		cursor: default;
		user-select: none;
	}

	.network-node.selected svg path {
		stroke: #3b82f6;
	}

	.label {
		font-size: 11px;
		font-weight: 600;
		text-align: center;
		margin-top: 4px;
		max-width: 120px;
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
