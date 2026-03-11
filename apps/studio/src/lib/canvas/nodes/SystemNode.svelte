<!-- SPDX-FileCopyrightText: 2024 CalmStudio contributors - see NOTICE file -->
<!-- SPDX-License-Identifier: Apache-2.0 -->
<script lang="ts">
	import { Handle, Position, NodeResizer, type NodeProps } from '@xyflow/svelte';

	let { id, data, selected }: NodeProps = $props();
</script>

<NodeResizer minWidth={120} minHeight={80} isVisible={selected} />

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

<!-- Large rectangle with double border — system boundary box -->
<div class="system-node" class:selected>
	<div class="outer-border">
		<div class="inner-border">
			<div class="content">
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
					<!-- System icon: nested squares -->
					<rect x="2" y="2" width="20" height="20" rx="2" stroke="currentColor" stroke-width="1.5" fill="none" />
					<rect x="6" y="6" width="12" height="12" rx="1" stroke="currentColor" stroke-width="1.5" fill="none" />
				</svg>
				<div class="label">{data.label ?? data.calmId}</div>
				<div class="type-badge">system</div>
			</div>
		</div>
	</div>
</div>

<style>
	.system-node {
		min-width: 120px;
		min-height: 80px;
		height: 100%;
		width: 100%;
		color: #1a1a1a;
		cursor: default;
		user-select: none;
	}

	.outer-border {
		width: 100%;
		height: 100%;
		border: 2px solid #1a1a1a;
		border-radius: 4px;
		padding: 3px;
	}

	.inner-border {
		width: 100%;
		height: 100%;
		border: 1px solid #1a1a1a;
		border-radius: 2px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.system-node.selected .outer-border {
		border-color: #3b82f6;
	}

	.system-node.selected .inner-border {
		border-color: #3b82f6;
	}

	.system-node.selected svg rect {
		stroke: #3b82f6;
	}

	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 8px;
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
