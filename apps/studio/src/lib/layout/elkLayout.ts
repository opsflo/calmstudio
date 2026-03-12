// SPDX-FileCopyrightText: 2026 CalmStudio Contributors
//
// SPDX-License-Identifier: Apache-2.0

/**
 * elkLayout.ts — Pure ELK.js layout engine for CALM architectures.
 *
 * Converts a CalmArchitecture into ELK graph format, runs auto-layout,
 * and returns a position map.
 *
 * IMPORTANT: This file must NOT import from .svelte.ts files — kept as pure
 * TypeScript for vitest testability (per RESEARCH Anti-Pattern).
 *
 * Per RESEARCH Pitfall 7: Treat ELK graph as flat (no nested children).
 * Sub-flow nesting is handled by @xyflow/svelte parentId independently.
 */

import ELK from 'elkjs/lib/elk.bundled.js';
import type { CalmArchitecture } from '@calmstudio/calm-core';

// ─── Types ────────────────────────────────────────────────────────────────────

export type LayoutDirection = 'DOWN' | 'RIGHT' | 'UP';

/** Position map: node unique-id -> {x, y} coordinates from ELK layout. */
export type PositionMap = Map<string, { x: number; y: number }>;

// ─── ELK instance ─────────────────────────────────────────────────────────────

const elk = new ELK();

// ─── layoutCalm ──────────────────────────────────────────────────────────────

/**
 * Lays out a CALM architecture using ELK.js layered algorithm.
 *
 * @param arch - The CALM architecture to lay out.
 * @param pinnedIds - Set of node unique-ids to exclude from layout (their
 *   positions are preserved by the caller — pinned nodes stay in place).
 * @param direction - Layout direction: 'DOWN' (top-to-bottom), 'RIGHT' (left-to-right), 'UP'.
 *   Defaults to 'DOWN'.
 * @returns A Map of node unique-id to {x, y} for all NON-PINNED nodes.
 *   Pinned nodes are NOT included — caller must inject their positions separately.
 */
export async function layoutCalm(
	arch: CalmArchitecture,
	pinnedIds: Set<string>,
	direction: LayoutDirection = 'DOWN'
): Promise<PositionMap> {
	// Filter out pinned nodes — ELK only positions the free ones
	const freeNodes = arch.nodes.filter((n) => !pinnedIds.has(n['unique-id']));

	if (freeNodes.length === 0) {
		return new Map();
	}

	const freeNodeIds = new Set(freeNodes.map((n) => n['unique-id']));

	// Filter edges: exclude any edge where source OR destination is pinned
	const freeEdges = arch.relationships.filter(
		(r) => !pinnedIds.has(r.source) && !pinnedIds.has(r.destination)
	);

	// Build ELK graph — flat structure (per RESEARCH Pitfall 7: no nested children)
	const graph = {
		id: 'root',
		layoutOptions: {
			'elk.algorithm': 'layered',
			'elk.direction': direction,
			'elk.layered.spacing.nodeNodeBetweenLayers': '100',
			'elk.spacing.nodeNode': '80',
		},
		children: freeNodes.map((n) => ({
			id: n['unique-id'],
			width: 160,
			height: 60,
		})),
		edges: freeEdges
			// Only include edges where both endpoints are free nodes
			.filter((r) => freeNodeIds.has(r.source) && freeNodeIds.has(r.destination))
			.map((r) => ({
				id: r['unique-id'],
				sources: [r.source],
				targets: [r.destination],
			})),
	};

	const layouted = await elk.layout(graph);

	// Build position map from ELK results
	const positionMap: PositionMap = new Map();
	for (const child of layouted.children ?? []) {
		if (child.x !== undefined && child.y !== undefined) {
			positionMap.set(child.id, { x: child.x, y: child.y });
		}
	}

	return positionMap;
}
