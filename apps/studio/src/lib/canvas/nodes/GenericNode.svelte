<!-- SPDX-FileCopyrightText: 2024 CalmStudio contributors - see NOTICE file -->
<!-- SPDX-License-Identifier: Apache-2.0 -->
<script lang="ts">
	import { Handle, Position, NodeResizer, type NodeProps } from '@xyflow/svelte';

	let { id, data, selected }: NodeProps = $props();
</script>

<NodeResizer minWidth={100} minHeight={70} isVisible={selected} />

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

<!-- Plain rectangle with dashed border — fallback for unknown custom types -->
<div class="generic-node" class:selected>
	<div class="label">{data.label ?? data.calmId}</div>
	{#if data.calmType}
		<div class="custom-type">{data.calmType}</div>
	{/if}
</div>

<style>
	.generic-node {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 12px 16px;
		min-width: 100px;
		min-height: 70px;
		border: 2px dashed #6b7280;
		border-radius: 4px;
		color: #1a1a1a;
		cursor: default;
		user-select: none;
		background: transparent;
	}

	.generic-node.selected {
		border-color: #3b82f6;
	}

	.label {
		font-size: 11px;
		font-weight: 600;
		text-align: center;
		max-width: 120px;
		word-break: break-word;
	}

	.custom-type {
		font-size: 9px;
		color: #6b7280;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-top: 4px;
		font-style: italic;
	}
</style>
