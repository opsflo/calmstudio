<!-- SPDX-FileCopyrightText: 2024 CalmStudio contributors - see NOTICE file -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

<!--
  InteractsEdge.svelte — CALM "interacts" relationship edge.
  Visual style: dashed line (6 4) + filled arrowhead.
  No protocol label — interacts edges represent human/actor interactions
  which don't have protocols in the CALM schema.
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
		? `stroke-dasharray: 6 4; ${style ?? ''} ${validationStyle}`
		: `stroke-dasharray: 6 4; ${style ?? ''}`);
</script>

<BaseEdge
	{id}
	path={edgePath}
	markerEnd="url(#marker-arrow-filled)"
	style={finalStyle}
/>
