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

<!-- Document shape: rectangle with folded corner -->
<div class="data-asset-node" class:selected>
	<svg width="56" height="68" viewBox="0 0 56 68" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
		<!-- Document body with folded corner -->
		<path
			d="M4 4 L40 4 L52 16 L52 64 L4 64 Z"
			stroke="currentColor"
			stroke-width="2"
			fill="none"
			stroke-linejoin="round"
		/>
		<!-- Folded corner triangle -->
		<path
			d="M40 4 L40 16 L52 16"
			stroke="currentColor"
			stroke-width="2"
			fill="none"
		/>
		<!-- Document lines -->
		<line x1="12" y1="28" x2="44" y2="28" stroke="currentColor" stroke-width="1.5" />
		<line x1="12" y1="36" x2="44" y2="36" stroke="currentColor" stroke-width="1.5" />
		<line x1="12" y1="44" x2="36" y2="44" stroke="currentColor" stroke-width="1.5" />
	</svg>
	<div class="label">{data.label ?? data.calmId}</div>
	<div class="type-badge">data-asset</div>
</div>

<style>
	.data-asset-node {
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

	.data-asset-node.selected svg path,
	.data-asset-node.selected svg line {
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
