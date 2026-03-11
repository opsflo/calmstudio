<!-- SPDX-FileCopyrightText: 2024 CalmStudio contributors - see NOTICE file -->
<!-- SPDX-License-Identifier: Apache-2.0 -->
<script lang="ts">
	import { SvelteFlow, type Node, type Edge } from '@xyflow/svelte';

	// MUST use $state.raw — Svelte Flow mutates these arrays internally;
	// deep $state() reactivity causes double-render loops and stale positions.
	let nodes = $state.raw<Node[]>([]);
	let edges = $state.raw<Edge[]>([]);
</script>

<div style="width: 100%; height: 100vh;">
	<SvelteFlow
		bind:nodes
		bind:edges
		deleteKey="Delete"
		selectionKey="Shift"
		multiSelectionKey="Meta"
		fitView
	/>
</div>
