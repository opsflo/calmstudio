<!-- SPDX-FileCopyrightText: 2024 CalmStudio contributors - see NOTICE file -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

<!--
  OptionsEdge.svelte — CALM "options" relationship edge.
  Visual style: dotted line (2 4) + open arrowhead marker.
  Represents an optional or alternative relationship between nodes.
-->
<script lang="ts">
	import { BaseEdge, getSmoothStepPath, type EdgeProps } from '@xyflow/svelte';

	let {
		id,
		sourceX,
		sourceY,
		targetX,
		targetY,
		sourcePosition,
		targetPosition,
		data,
		style
	}: EdgeProps = $props();

	const [edgePath] = $derived(
		getSmoothStepPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition })
	);

	const validationStyle = $derived(
		(data as Record<string, unknown>)?.validationSeverity === 'error'
			? 'stroke: #dc2626; stroke-width: 2.5;'
			: (data as Record<string, unknown>)?.validationSeverity === 'warning'
				? 'stroke: #d97706; stroke-width: 2;'
				: undefined
	);
	const finalStyle = $derived(validationStyle
		? `stroke-dasharray: 2 4; ${style ?? ''} ${validationStyle}`
		: `stroke-dasharray: 2 4; ${style ?? ''}`);
</script>

<BaseEdge
	{id}
	path={edgePath}
	markerEnd="url(#marker-arrow-open)"
	style={finalStyle}
/>
