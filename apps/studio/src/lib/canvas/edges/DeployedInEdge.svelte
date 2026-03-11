<!-- SPDX-FileCopyrightText: 2024 CalmStudio contributors - see NOTICE file -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

<!--
  DeployedInEdge.svelte — CALM "deployed-in" relationship edge.
  Visual style: solid line + open diamond marker.
  Represents a deployment relationship (component deployed inside a node).
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
		style
	}: EdgeProps = $props();

	const [edgePath] = $derived(
		getSmoothStepPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition })
	);
</script>

<BaseEdge
	{id}
	path={edgePath}
	markerEnd="url(#marker-diamond-open)"
	{style}
/>
