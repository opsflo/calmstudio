<!-- SPDX-FileCopyrightText: 2024 CalmStudio contributors - see NOTICE file -->
<!-- SPDX-License-Identifier: Apache-2.0 -->
<script lang="ts">
	import { Handle, Position, NodeResizer, type NodeProps } from '@xyflow/svelte';

	let { id, data, selected }: NodeProps = $props();
</script>

<NodeResizer minWidth={100} minHeight={90} isVisible={selected} />

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

<!-- Hexagon shape — external system boundary -->
<div class="ecosystem-node" class:selected>
	<svg width="68" height="60" viewBox="0 0 68 60" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
		<!-- Regular hexagon -->
		<polygon
			points="34,2 64,18 64,42 34,58 4,42 4,18"
			stroke="currentColor"
			stroke-width="2"
			fill="none"
			stroke-linejoin="round"
		/>
	</svg>
	<div class="label">{data.label ?? data.calmId}</div>
	<div class="type-badge">ecosystem</div>
</div>

<style>
	.ecosystem-node {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 4px 8px;
		min-width: 100px;
		min-height: 90px;
		color: #1a1a1a;
		cursor: default;
		user-select: none;
	}

	.ecosystem-node.selected svg polygon {
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
