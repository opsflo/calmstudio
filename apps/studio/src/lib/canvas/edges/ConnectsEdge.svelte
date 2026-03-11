<!-- SPDX-FileCopyrightText: 2024 CalmStudio contributors - see NOTICE file -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

<!--
  ConnectsEdge.svelte — CALM "connects" relationship edge.
  Visual style: solid line + filled arrowhead.
  Protocol labels render as inline pill on the path.
-->
<script lang="ts">
	import { BaseEdge, EdgeLabel, getSmoothStepPath, type EdgeProps } from '@xyflow/svelte';

	let {
		id,
		sourceX,
		sourceY,
		targetX,
		targetY,
		sourcePosition,
		targetPosition,
		label,
		data,
		markerEnd,
		style
	}: EdgeProps = $props();

	const [edgePath, labelX, labelY] = $derived(
		getSmoothStepPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition })
	);

	const protocolLabel = $derived((data as Record<string, unknown>)?.protocol ?? label);
</script>

<BaseEdge
	{id}
	path={edgePath}
	markerEnd="url(#marker-arrow-filled)"
	{style}
/>

{#if protocolLabel}
	<EdgeLabel x={labelX} y={labelY} class="nodrag nopan">
		<span class="edge-label">
			{protocolLabel}
		</span>
	</EdgeLabel>
{/if}

<style>
	.edge-label {
		display: inline-block;
		padding: 2px 8px;
		font-family: var(--node-font);
		font-size: 10px;
		font-weight: 600;
		letter-spacing: 0.02em;
		color: var(--color-text-secondary);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 6px;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
	}

	:global(.dark) .edge-label {
		background: #111827;
		border-color: #334155;
		color: #94a3b8;
	}
</style>
