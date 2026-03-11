<!-- SPDX-FileCopyrightText: 2024 CalmStudio contributors - see NOTICE file -->
<!-- SPDX-License-Identifier: Apache-2.0 -->
<script lang="ts">
	import { Handle, Position, NodeResizer, type NodeProps } from '@xyflow/svelte';

	let { id, data, selected }: NodeProps = $props();
</script>

<NodeResizer minWidth={90} minHeight={100} isVisible={selected} />

<!-- Default handles -->
<Handle type="target" position={Position.Top} />
<Handle type="source" position={Position.Bottom} />
<Handle type="target" position={Position.Left} />
<Handle type="source" position={Position.Right} />

<!-- Interface handles -->
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

<!-- Shield/key shape — directory service -->
<div class="ldap-node" class:selected>
	<svg width="52" height="66" viewBox="0 0 52 66" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
		<!-- Shield outline -->
		<path
			d="M26 2 L48 12 L48 34 Q48 54 26 64 Q4 54 4 34 L4 12 Z"
			stroke="currentColor"
			stroke-width="2"
			fill="none"
			stroke-linejoin="round"
		/>
		<!-- Key circle -->
		<circle cx="26" cy="28" r="8" stroke="currentColor" stroke-width="1.5" fill="none" />
		<!-- Key stem -->
		<line x1="26" y1="36" x2="26" y2="50" stroke="currentColor" stroke-width="1.5" />
		<!-- Key teeth -->
		<line x1="26" y1="42" x2="32" y2="42" stroke="currentColor" stroke-width="1.5" />
		<line x1="26" y1="47" x2="30" y2="47" stroke="currentColor" stroke-width="1.5" />
	</svg>
	<div class="label">{data.label ?? data.calmId}</div>
	<div class="type-badge">ldap</div>
</div>

<style>
	.ldap-node {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 4px 8px;
		min-width: 90px;
		min-height: 100px;
		color: #1a1a1a;
		cursor: default;
		user-select: none;
	}

	.ldap-node.selected svg path,
	.ldap-node.selected svg circle,
	.ldap-node.selected svg line {
		stroke: #3b82f6;
	}

	.label {
		font-size: 11px;
		font-weight: 600;
		text-align: center;
		margin-top: 4px;
		max-width: 100px;
		word-break: break-word;
	}

	.type-badge {
		font-size: 9px;
		color: #6b7280;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-top: 2px;
	}
</style>
