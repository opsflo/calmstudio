<!-- SPDX-FileCopyrightText: 2024 CalmStudio contributors - see NOTICE file -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

<!--
  ConnectsEdge.svelte — CALM "connects" relationship edge.
  Visual style: solid line + filled arrowhead.
  Protocol labels (e.g. "HTTPS", "JDBC", "gRPC") render as inline text
  centered on the path when data.protocol or label is provided.
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
		<span
			class="rounded bg-white/90 px-1.5 py-0.5 text-xs font-medium text-gray-700 shadow-sm dark:bg-gray-800/90 dark:text-gray-200"
		>
			{protocolLabel}
		</span>
	</EdgeLabel>
{/if}
