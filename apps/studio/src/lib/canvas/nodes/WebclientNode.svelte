<!-- SPDX-FileCopyrightText: 2024 CalmStudio contributors - see NOTICE file -->
<!-- SPDX-License-Identifier: Apache-2.0 -->
<script lang="ts">
	import { Handle, Position, NodeResizer, type NodeProps } from '@xyflow/svelte';

	let { id, data, selected }: NodeProps = $props();
</script>

<NodeResizer minWidth={110} minHeight={90} isVisible={selected} />

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

<!-- Browser window shape: rectangle with top toolbar dots -->
<div class="webclient-node" class:selected>
	<svg width="72" height="56" viewBox="0 0 72 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
		<!-- Browser outer frame -->
		<rect x="2" y="2" width="68" height="52" rx="4" stroke="currentColor" stroke-width="2" fill="none" />
		<!-- Toolbar bar -->
		<line x1="2" y1="16" x2="70" y2="16" stroke="currentColor" stroke-width="1.5" />
		<!-- Browser dots (traffic lights) -->
		<circle cx="12" cy="9" r="2.5" stroke="currentColor" stroke-width="1.5" fill="none" />
		<circle cx="21" cy="9" r="2.5" stroke="currentColor" stroke-width="1.5" fill="none" />
		<circle cx="30" cy="9" r="2.5" stroke="currentColor" stroke-width="1.5" fill="none" />
		<!-- URL bar -->
		<rect x="38" y="5" width="28" height="8" rx="2" stroke="currentColor" stroke-width="1" fill="none" />
		<!-- Content area lines -->
		<line x1="10" y1="26" x2="62" y2="26" stroke="currentColor" stroke-width="1" stroke-dasharray="3 2" />
		<line x1="10" y1="34" x2="50" y2="34" stroke="currentColor" stroke-width="1" stroke-dasharray="3 2" />
	</svg>
	<div class="label">{data.label ?? data.calmId}</div>
	<div class="type-badge">webclient</div>
</div>

<style>
	.webclient-node {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 4px 8px;
		min-width: 110px;
		min-height: 90px;
		color: #1a1a1a;
		cursor: default;
		user-select: none;
	}

	.webclient-node.selected svg rect,
	.webclient-node.selected svg line,
	.webclient-node.selected svg circle {
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
