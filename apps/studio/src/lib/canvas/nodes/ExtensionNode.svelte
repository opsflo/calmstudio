<!-- SPDX-FileCopyrightText: 2024 CalmStudio contributors - see NOTICE file -->
<!-- SPDX-License-Identifier: Apache-2.0 -->
<script lang="ts">
	import { Handle, Position, NodeResizer, type NodeProps } from '@xyflow/svelte';
	import ValidationBadge from './ValidationBadge.svelte';
	import { resolvePackNode } from '@calmstudio/extensions';

	let { id, data, selected }: NodeProps = $props();

	const errorCount = $derived((data as Record<string, unknown>).validationErrors as number ?? 0);
	const warnCount = $derived((data as Record<string, unknown>).validationWarnings as number ?? 0);
	const calmType = $derived((data as Record<string, unknown>).calmType as string ?? '');
	const meta = $derived(resolvePackNode(calmType));

	// Fallback colors when the pack is not registered
	const bg = $derived(meta?.color.bg ?? 'var(--node-generic-bg)');
	const borderColor = $derived(meta?.color.border ?? 'var(--node-generic-border)');
	const strokeColor = $derived(meta?.color.stroke ?? 'currentColor');
	const label = $derived((data as Record<string, unknown>).label as string ?? (data as Record<string, unknown>).calmId as string ?? calmType);
</script>

<NodeResizer minWidth={80} minHeight={40} isVisible={selected} />
<Handle type="target" position={Position.Top} />
<Handle type="source" position={Position.Bottom} />
<Handle type="target" position={Position.Left} />
<Handle type="source" position={Position.Right} />

{#if data.interfaces}
	{#each data.interfaces as iface, i}
		<Handle type="source" position={Position.Right} id={iface['unique-id']} style="top: {20 + i * 20}%" />
	{/each}
{/if}

<div
	class="node"
	class:selected
	class:fallback={!meta}
	style="background: {bg}; border-color: {borderColor};"
>
	<ValidationBadge {errorCount} {warnCount} nodeId={(data as Record<string, unknown>).calmId as string ?? id} />
	{#if meta?.icon}
		<span class="icon" style="color: {strokeColor};">
			{@html meta.icon}
		</span>
	{/if}
	<span class="label">{label}</span>
	{#if calmType}
		<span class="badge" style="color: {strokeColor};">{calmType}</span>
	{/if}
</div>

<style>
	.node {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
		padding: 8px 10px;
		border: 1.5px solid var(--node-generic-border);
		border-radius: 4px;
		font-family: var(--node-font);
		cursor: default;
		user-select: none;
	}

	.node.fallback {
		background: var(--node-generic-bg);
		border-color: var(--node-generic-border);
		border-style: dashed;
	}

	.node.selected {
		border-color: var(--node-selected-ring) !important;
		border-style: solid;
		box-shadow: 0 0 0 1.5px var(--node-selected-ring);
	}

	.icon {
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 4px;
	}

	.label {
		font-size: 10px;
		font-weight: 600;
		color: var(--node-label-color);
		text-align: center;
		max-width: 100px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.badge {
		font-size: 9px;
		font-weight: 500;
		font-style: italic;
		margin-top: 2px;
		opacity: 0.75;
	}
</style>
