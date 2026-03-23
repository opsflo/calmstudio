// SPDX-FileCopyrightText: 2024 CalmStudio contributors - see NOTICE file
//
// SPDX-License-Identifier: Apache-2.0

// elkjs/lib/elk.bundled.js is CJS — use same compat pattern as mcp-server render.ts
import ELKImport from 'elkjs/lib/elk.bundled.js';
const ELK = (ELKImport as unknown as { default?: new () => { layout: (graph: unknown) => Promise<unknown> } }).default ?? ELKImport as unknown as new () => { layout: (graph: unknown) => Promise<unknown> };

import type { CalmArchitecture } from '@calmstudio/calm-core';
import { renderNodeSvg } from './nodeRenderer.js';
import { renderEdgeSvg, renderEdgeMarkers } from './edgeRenderer.js';

// ---------------------------------------------------------------------------
// ELK type helpers
// ---------------------------------------------------------------------------

type ElkChild = {
  id: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  labels?: Array<{ text: string }>;
};

type ElkEdgeSection = {
  startPoint?: { x: number; y: number };
  endPoint?: { x: number; y: number };
  bendPoints?: Array<{ x: number; y: number }>;
};

type ElkLayouted = {
  children?: ElkChild[];
  edges?: Array<{ id: string; sections?: ElkEdgeSection[] }>;
};

// ---------------------------------------------------------------------------
// Render options
// ---------------------------------------------------------------------------

export interface RenderOptions {
  theme?: 'light' | 'dark';
  direction?: 'DOWN' | 'RIGHT';
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Render a CalmArchitecture to an interactive SVG string using ELK layout.
 * Supports pack-aware node coloring and icons for all registered packs.
 *
 * @param arch - The CALM architecture to render
 * @param options - Optional render options (theme, direction)
 * @returns Promise resolving to an SVG string
 */
export async function renderELKDiagram(
  arch: CalmArchitecture,
  options: RenderOptions = {}
): Promise<string> {
  const { theme = 'light', direction = 'DOWN' } = options;

  // Handle empty architecture
  if (arch.nodes.length === 0) {
    const bgColor = theme === 'dark' ? '#1e1e1e' : '#f5f5f5';
    const textColor = theme === 'dark' ? '#ccc' : '#999';
    return (
      `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="150" style="background:${bgColor}">` +
      `<text x="150" y="75" text-anchor="middle" font-family="sans-serif" font-size="14" fill="${textColor}">No nodes</text>` +
      `</svg>`
    );
  }

  // Build ELK graph
  const NODE_WIDTH = 180;
  const NODE_HEIGHT = 70;

  const graph = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': direction,
      'elk.layered.spacing.nodeNodeBetweenLayers': '80',
      'elk.spacing.nodeNode': '60',
    },
    children: arch.nodes.map((n) => ({
      id: n['unique-id'],
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
      labels: [{ text: n.name }],
    })),
    edges: arch.relationships.map((r) => ({
      id: r['unique-id'],
      sources: [r.source],
      targets: [r.destination],
    })),
  };

  const elk = new ELK();
  const layouted = await elk.layout(graph) as ElkLayouted;

  // Build lookup maps
  const nodeTypeMap = new Map<string, string>();
  const nodeDescMap = new Map<string, string>();
  for (const n of arch.nodes) {
    nodeTypeMap.set(n['unique-id'], n['node-type']);
    nodeDescMap.set(n['unique-id'], n.description ?? '');
  }

  const relTypeMap = new Map<string, string>();
  for (const r of arch.relationships) {
    relTypeMap.set(r['unique-id'], r['relationship-type']);
  }

  // Compute canvas dimensions
  const PADDING = 40;
  const svgWidth = Math.max(
    400,
    ...(layouted.children ?? []).map((c) => (c.x ?? 0) + (c.width ?? NODE_WIDTH) + PADDING)
  );
  const svgHeight = Math.max(
    200,
    ...(layouted.children ?? []).map((c) => (c.y ?? 0) + (c.height ?? NODE_HEIGHT) + PADDING)
  );

  const bgColor = theme === 'dark' ? '#1e1e1e' : 'transparent';

  // Build SVG
  const parts: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}" style="background:${bgColor}">`,
  ];

  // CSS custom properties for theming
  const edgeColor = theme === 'dark' ? '#aaa' : '#555';
  parts.push(
    `<style>`,
    `.calm-node { transition: opacity 0.15s; }`,
    `.calm-node:hover { opacity: 0.85; }`,
    `</style>`,
  );

  // Arrow markers
  parts.push(renderEdgeMarkers());

  // Draw edges first (behind nodes)
  for (const edge of layouted.edges ?? []) {
    for (const section of edge.sections ?? []) {
      const points: Array<{ x: number; y: number }> = [];
      if (section.startPoint) {
        points.push({ x: section.startPoint.x, y: section.startPoint.y });
      }
      for (const bp of section.bendPoints ?? []) {
        points.push({ x: bp.x, y: bp.y });
      }
      if (section.endPoint) {
        points.push({ x: section.endPoint.x, y: section.endPoint.y });
      }
      if (points.length >= 2) {
        const relType = relTypeMap.get(edge.id);
        parts.push(
          renderEdgeSvg({
            id: edge.id,
            points,
            relationshipType: relType,
          }).replace('stroke="#555"', `stroke="${edgeColor}"`).replace('stroke="#888"', `stroke="${edgeColor}"`)
        );
      }
    }
  }

  // Draw nodes
  for (const child of layouted.children ?? []) {
    const x = child.x ?? 0;
    const y = child.y ?? 0;
    const w = child.width ?? NODE_WIDTH;
    const h = child.height ?? NODE_HEIGHT;
    const nodeType = nodeTypeMap.get(child.id) ?? 'system';
    const description = nodeDescMap.get(child.id) ?? '';
    const label = child.labels?.[0]?.text ?? child.id;

    parts.push(
      renderNodeSvg({
        id: child.id,
        x,
        y,
        width: w,
        height: h,
        name: label,
        nodeType,
        description,
      })
    );
  }

  parts.push('</svg>');
  return parts.join('\n');
}
