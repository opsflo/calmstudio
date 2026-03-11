<!-- SPDX-FileCopyrightText: 2024 CalmStudio contributors - see NOTICE file -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

<script lang="ts">
	import { type Node, type Edge, SvelteFlowProvider } from '@xyflow/svelte';
	import { PaneGroup, Pane, PaneResizer } from 'paneforge';
	import DnDProvider from '$lib/palette/DnDProvider.svelte';
	import NodePalette from '$lib/palette/NodePalette.svelte';
	import CalmCanvas from '$lib/canvas/CalmCanvas.svelte';
	import CodePanel from '$lib/editor/CodePanel.svelte';
	import { toggleTheme, isDark } from '$lib/stores/theme.svelte';

	let nodes = $state.raw<Node[]>([]);
	let edges = $state.raw<Edge[]>([]);

	let canvas: CalmCanvas;

	function handlePalettePlace(type: string) {
		canvas?.placeNodeAtCenter(type);
	}
</script>

<DnDProvider>
	<PaneGroup direction="horizontal" style="height: 100vh; overflow: hidden;">
		<!-- Left: Node Palette -->
		<Pane defaultSize={15} minSize={8}>
			<NodePalette onplacenode={handlePalettePlace} />
		</Pane>

		<PaneResizer class="resizer resizer-vertical" />

		<!-- Center: Canvas + Code editor (nested vertical split) -->
		<Pane defaultSize={70}>
			<PaneGroup direction="vertical" style="height: 100%;">
				<!-- Top: Canvas area -->
				<Pane defaultSize={70} minSize={30}>
					<div class="canvas-pane">
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
					</div>
				</Pane>

				<PaneResizer class="resizer resizer-horizontal" />

				<!-- Bottom: Code editor panel -->
				<Pane defaultSize={30} minSize={10}>
					<CodePanel value="" onchange={() => {}} />
				</Pane>
			</PaneGroup>
		</Pane>

		<PaneResizer class="resizer resizer-vertical" />

		<!-- Right: Properties placeholder (Plan 02 fills this) -->
		<Pane defaultSize={15} minSize={5}>
			<div class="properties-placeholder">
				<span>Select a node or edge</span>
			</div>
		</Pane>
	</PaneGroup>
</DnDProvider>

<style>
	/* Canvas pane fills its container with relative positioning for toolbar overlay */
	.canvas-pane {
		position: relative;
		width: 100%;
		height: 100%;
		overflow: hidden;
		background: var(--color-canvas-bg);
	}

	:global(.dark) .canvas-pane {
		background: #0b0f1a;
	}

	/* Floating dark mode toggle toolbar */
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

	/* Properties placeholder panel */
	.properties-placeholder {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		background: var(--color-surface);
		border-left: 1px solid var(--color-border);
		color: var(--color-text-secondary);
		font-size: 13px;
		text-align: center;
		padding: 16px;
	}

	:global(.dark) .properties-placeholder {
		background: #0d1117;
		border-left-color: #334155;
		color: #64748b;
	}

	/* PaneResizer styling — thin draggable bars */
	:global(.resizer) {
		background: transparent;
		transition: background 0.15s ease;
		flex-shrink: 0;
		position: relative;
		z-index: 10;
	}

	/* Vertical resizer (between horizontal panes) */
	:global(.resizer-vertical) {
		width: 4px;
		cursor: col-resize;
	}

	/* Horizontal resizer (between vertical panes) */
	:global(.resizer-horizontal) {
		height: 4px;
		cursor: row-resize;
	}

	:global(.resizer:hover) {
		background: var(--color-border);
		opacity: 0.6;
	}

	:global(.resizer[data-resize-handle-active]) {
		background: var(--color-accent, #3b82f6);
		opacity: 1;
	}

	:global(.dark) :global(.resizer:hover) {
		background: #334155;
		opacity: 0.8;
	}

	:global(.dark) :global(.resizer[data-resize-handle-active]) {
		background: #3b82f6;
		opacity: 1;
	}
</style>
