<!-- SPDX-FileCopyrightText: 2024 CalmStudio contributors - see NOTICE file -->
<!-- SPDX-License-Identifier: Apache-2.0 -->
<script lang="ts">
	import { Handle, Position, NodeResizer, type NodeProps } from '@xyflow/svelte';

	let { id, data, selected }: NodeProps = $props();

	let collapsed = $state(data.collapsed ?? false);

	function toggleCollapse() {
		collapsed = !collapsed;
		const event = new CustomEvent('node:toggle-collapse', {
			detail: { nodeId: id, collapsed },
			bubbles: true,
			composed: true,
		});
		document.dispatchEvent(event);
	}
</script>

{#if !collapsed}
	<NodeResizer minWidth={200} minHeight={150} isVisible={selected} />
{/if}

<Handle type="target" position={Position.Top} />
<Handle type="source" position={Position.Bottom} />
<Handle type="target" position={Position.Left} />
<Handle type="source" position={Position.Right} />

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

{#if collapsed}
	<div class="container-node collapsed" class:selected>
		<div class="collapsed-inner">
			<div class="icon-dot"></div>
			<span class="label">{data.label ?? data.calmId}</span>
			<button class="toggle-btn" onclick={toggleCollapse} title="Expand container" aria-label="Expand container">
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
					<path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
				</svg>
			</button>
		</div>
		<span class="type-badge">Container</span>
	</div>
{:else}
	<div class="container-node expanded" class:selected>
		<div class="header-bar">
			<div class="header-left">
				<div class="icon-dot"></div>
				<span class="label">{data.label ?? data.calmId}</span>
			</div>
			<div class="header-right">
				<span class="type-badge">Container</span>
				<button class="toggle-btn" onclick={toggleCollapse} title="Collapse container" aria-label="Collapse container">
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
						<path d="M18 15l-6-6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
					</svg>
				</button>
			</div>
		</div>
		<div class="container-body"></div>
	</div>
{/if}

<style>
	.container-node {
		font-family: var(--node-font);
		cursor: default;
		user-select: none;
	}

	/* Collapsed */
	.container-node.collapsed {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
		padding: 10px 16px;
		background: var(--node-container-bg);
		border: 1.5px solid var(--node-container-border);
		border-radius: 10px;
		min-width: 140px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
	}

	.container-node.collapsed.selected {
		border-color: var(--node-selected-ring);
		box-shadow: 0 0 0 2px var(--node-selected-ring);
	}

	.collapsed-inner {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	/* Expanded */
	.container-node.expanded {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		border: 2px dashed var(--node-container-border);
		border-radius: 12px;
		min-width: 200px;
		min-height: 150px;
		background: var(--node-container-bg);
		overflow: hidden;
	}

	.container-node.expanded.selected {
		border-color: var(--node-selected-ring);
		border-style: solid;
	}

	.header-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 6px 12px;
		background: var(--node-container-header-bg);
		border-bottom: 1px solid var(--node-container-header-border);
	}

	.header-left {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.header-right {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.container-body {
		flex: 1;
	}

	.icon-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--node-container-stroke);
		opacity: 0.6;
		flex-shrink: 0;
	}

	.label {
		font-size: 12px;
		font-weight: 600;
		color: var(--node-label-color);
		max-width: 160px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.type-badge {
		font-size: 10px;
		font-weight: 500;
		color: var(--node-container-badge);
		letter-spacing: 0.02em;
	}

	.toggle-btn {
		background: none;
		border: none;
		padding: 3px;
		cursor: pointer;
		color: var(--node-container-badge);
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 4px;
		transition: all 0.15s ease;
	}

	.toggle-btn:hover {
		background: var(--node-container-header-bg);
		color: var(--node-container-stroke);
	}
</style>
