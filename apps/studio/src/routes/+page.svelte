<!-- SPDX-FileCopyrightText: 2024 CalmStudio contributors - see NOTICE file -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

<script lang="ts">
	import { type Node, type Edge, SvelteFlowProvider } from '@xyflow/svelte';
	import DnDProvider from '$lib/palette/DnDProvider.svelte';
	import NodePalette from '$lib/palette/NodePalette.svelte';
	import CalmCanvas from '$lib/canvas/CalmCanvas.svelte';
	import { toggleTheme, isDark } from '$lib/stores/theme.svelte';

	let nodes = $state.raw<Node[]>([]);
	let edges = $state.raw<Edge[]>([]);

	let canvas: CalmCanvas;

	function handlePalettePlace(type: string) {
		canvas?.placeNodeAtCenter(type);
	}
</script>

<DnDProvider>
	<div class="app-shell">
		<!-- Sidebar -->
		<NodePalette onplacenode={handlePalettePlace} />

		<!-- Canvas area -->
		<main class="canvas-area">
			<!-- Floating toolbar -->
			<div class="toolbar">
				<button
					onclick={toggleTheme}
					class="toolbar-btn"
					aria-label={isDark() ? 'Switch to light mode' : 'Switch to dark mode'}
					title={isDark() ? 'Switch to light mode' : 'Switch to dark mode'}
				>
					{#if isDark()}
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
							<circle cx="12" cy="12" r="4" />
							<path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
						</svg>
					{:else}
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
							<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
						</svg>
					{/if}
				</button>
			</div>

			<SvelteFlowProvider>
				<CalmCanvas bind:this={canvas} bind:nodes bind:edges />
			</SvelteFlowProvider>
		</main>
	</div>
</DnDProvider>

<style>
	.app-shell {
		display: flex;
		width: 100vw;
		height: 100vh;
		overflow: hidden;
		background: var(--color-canvas-bg);
	}

	:global(.dark) .app-shell {
		background: #0b0f1a;
	}

	.canvas-area {
		position: relative;
		flex: 1;
		overflow: hidden;
	}

	.toolbar {
		position: absolute;
		right: 12px;
		top: 12px;
		z-index: 50;
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.toolbar-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 34px;
		height: 34px;
		border-radius: 9px;
		border: 1px solid var(--color-border);
		background: var(--color-surface);
		color: var(--color-text-secondary);
		cursor: pointer;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
		transition: all 0.15s ease;
	}

	.toolbar-btn:hover {
		background: var(--color-surface-tertiary);
		color: var(--color-text-primary);
	}

	:global(.dark) .toolbar-btn {
		background: #111827;
		border-color: #334155;
		color: #94a3b8;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
	}

	:global(.dark) .toolbar-btn:hover {
		background: #1e293b;
		color: #e2e8f0;
	}
</style>
