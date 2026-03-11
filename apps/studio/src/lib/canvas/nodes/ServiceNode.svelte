<!-- SPDX-FileCopyrightText: 2024 CalmStudio contributors - see NOTICE file -->
<!-- SPDX-License-Identifier: Apache-2.0 -->
<script lang="ts">
	import { Handle, Position, NodeResizer, type NodeProps } from '@xyflow/svelte';

	let { id, data, selected }: NodeProps = $props();
</script>

<NodeResizer minWidth={100} minHeight={80} isVisible={selected} />

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

<!-- Rounded rectangle with gear/cog icon -->
<div class="service-node" class:selected>
	<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
		<!-- Gear/cog shape -->
		<circle cx="14" cy="14" r="5" stroke="currentColor" stroke-width="1.5" fill="none" />
		<path
			d="M14 2 L15.5 6 L18.5 4.5 L18.5 8 L22 8 L20.5 11 L24 12.5 L21 14 L24 15.5 L20.5 17 L22 20 L18.5 20 L18.5 23.5 L15.5 22 L14 26 L12.5 22 L9.5 23.5 L9.5 20 L6 20 L7.5 17 L4 15.5 L7 14 L4 12.5 L7.5 11 L6 8 L9.5 8 L9.5 4.5 L12.5 6 Z"
			stroke="currentColor"
			stroke-width="1.5"
			fill="none"
			stroke-linejoin="round"
		/>
	</svg>
	<div class="label">{data.label ?? data.calmId}</div>
	<div class="type-badge">service</div>
</div>

<style>
	.service-node {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 10px 14px;
		min-width: 100px;
		min-height: 80px;
		border: 2px solid #1a1a1a;
		border-radius: 12px;
		color: #1a1a1a;
		cursor: default;
		user-select: none;
		background: transparent;
	}

	.service-node.selected {
		border-color: #3b82f6;
	}

	.service-node.selected svg circle,
	.service-node.selected svg path {
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
