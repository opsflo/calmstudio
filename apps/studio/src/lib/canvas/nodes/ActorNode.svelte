<!-- SPDX-FileCopyrightText: 2024 CalmStudio contributors - see NOTICE file -->
<!-- SPDX-License-Identifier: Apache-2.0 -->
<script lang="ts">
	import { Handle, Position, NodeResizer, type NodeProps } from '@xyflow/svelte';

	let { id, data, selected }: NodeProps = $props();
</script>

<NodeResizer minWidth={80} minHeight={100} isVisible={selected} />

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

<div class="actor-node" class:selected>
	<!-- Person silhouette: head circle + body trapezoid -->
	<svg width="48" height="60" viewBox="0 0 48 60" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
		<!-- Head -->
		<circle cx="24" cy="13" r="10" stroke="currentColor" stroke-width="2" fill="none" />
		<!-- Body (trapezoid) -->
		<path d="M10 54 L14 32 Q24 26 34 32 L38 54 Z" stroke="currentColor" stroke-width="2" fill="none" />
		<!-- Arms -->
		<line x1="6" y1="36" x2="42" y2="36" stroke="currentColor" stroke-width="2" />
	</svg>

	<div class="label">{data.label ?? data.calmId}</div>
	<div class="type-badge">actor</div>
</div>

<style>
	.actor-node {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 8px;
		min-width: 80px;
		min-height: 100px;
		color: #1a1a1a;
		cursor: default;
		user-select: none;
	}

	.actor-node.selected svg circle,
	.actor-node.selected svg path,
	.actor-node.selected svg line {
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
