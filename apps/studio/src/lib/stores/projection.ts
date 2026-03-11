// SPDX-FileCopyrightText: 2026 CalmStudio Contributors
//
// SPDX-License-Identifier: Apache-2.0

/**
 * projection.ts — Pure bidirectional projection functions between CalmArchitecture and Svelte Flow.
 *
 * calmToFlow: converts a CalmArchitecture into Svelte Flow nodes[] and edges[].
 * flowToCalm: converts Svelte Flow nodes[] and edges[] back to CalmArchitecture.
 *
 * IMPORTANT: This file must NOT import from .svelte.ts files (not testable in vitest without
 * additional Svelte transform setup). Only imports types from @xyflow/svelte and @calmstudio/calm-core,
 * and the pure resolveNodeType function.
 */

import type { Node, Edge } from '@xyflow/svelte';
import type { CalmArchitecture, CalmInterface, CalmNode, CalmRelationship } from '@calmstudio/calm-core';
import { resolveNodeType } from '$lib/canvas/nodeTypes';

/**
 * Converts a CalmArchitecture into Svelte Flow nodes and edges.
 *
 * @param arch - The CALM architecture to project.
 * @param positionMap - Optional map of node unique-id to {x, y} position.
 *   Known nodes use their stored position; unknown nodes get staggered defaults.
 * @returns { nodes, edges } ready for use with SvelteFlow.
 */
export function calmToFlow(
	arch: CalmArchitecture,
	positionMap?: Map<string, { x: number; y: number }>
): { nodes: Node[]; edges: Edge[] } {
	const nodes: Node[] = arch.nodes.map((cn: CalmNode, idx: number) => {
		const position =
			positionMap?.get(cn['unique-id']) ?? { x: 100 + idx * 160, y: 100 };

		return {
			id: cn['unique-id'],
			type: resolveNodeType(cn['node-type']),
			position,
			data: {
				label: cn.name,
				calmId: cn['unique-id'],
				calmType: cn['node-type'],
				description: cn.description ?? '',
				interfaces: cn.interfaces ?? [],
				customMetadata: cn.customMetadata ?? {},
			},
		};
	});

	const edges: Edge[] = arch.relationships.map((cr: CalmRelationship) => ({
		id: cr['unique-id'],
		source: cr.source,
		target: cr.destination,
		type: cr['relationship-type'],
		data: {
			protocol: cr.protocol,
			description: cr.description,
		},
	}));

	return { nodes, edges };
}

/**
 * Converts Svelte Flow nodes and edges back to a CalmArchitecture.
 *
 * Reads all CALM fields from node.data and edge.data/type.
 * Preserves customMetadata from node.data.customMetadata.
 *
 * @param nodes - Svelte Flow nodes (must have data.calmId, data.calmType, data.label)
 * @param edges - Svelte Flow edges (must have id, source, target, type)
 * @returns A CalmArchitecture with nodes and relationships reconstructed.
 */
export function flowToCalm(nodes: Node[], edges: Edge[]): CalmArchitecture {
	const calmNodes: CalmNode[] = nodes.map((n: Node) => {
		const d = n.data as {
			calmId: string;
			calmType: string;
			label: string;
			description?: string;
			interfaces?: CalmInterface[];
			customMetadata?: Record<string, string>;
		};

		const node: CalmNode = {
			'unique-id': d.calmId,
			'node-type': d.calmType,
			name: d.label,
		};

		if (d.description) {
			node.description = d.description;
		}

		if (d.interfaces && d.interfaces.length > 0) {
			node.interfaces = d.interfaces;
		}

		if (d.customMetadata && Object.keys(d.customMetadata).length > 0) {
			node.customMetadata = d.customMetadata;
		}

		return node;
	});

	const calmRelationships: CalmRelationship[] = edges.map((e: Edge) => {
		const edgeData = (e.data ?? {}) as { protocol?: string; description?: string };

		const rel: CalmRelationship = {
			'unique-id': e.id,
			'relationship-type': (e.type ?? 'connects') as CalmRelationship['relationship-type'],
			source: e.source,
			destination: e.target,
		};

		if (edgeData.protocol) {
			rel.protocol = edgeData.protocol;
		}

		if (edgeData.description) {
			rel.description = edgeData.description;
		}

		return rel;
	});

	return { nodes: calmNodes, relationships: calmRelationships };
}
