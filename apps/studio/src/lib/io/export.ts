// SPDX-FileCopyrightText: 2026 CalmStudio Contributors
//
// SPDX-License-Identifier: Apache-2.0

/**
 * export.ts — Export functions for all supported formats.
 *
 * - exportAsCalm: Downloads the current CALM JSON model.
 * - exportAsSvg: Captures the canvas viewport as SVG via html-to-image.
 * - exportAsPng: Captures the canvas viewport as PNG (2x Retina).
 * - exportAsCalmscript: Stub — downloads calmscript content (Phase 5 will fully implement DSL).
 * - downloadDataUrl: Low-level helper for data URL downloads.
 *
 * SVG/PNG export requires a real browser (jsdom cannot render computed styles).
 * All functions are async-safe; null-guard on viewport element per RESEARCH Pitfall 3.
 */

import { toSvg, toPng } from 'html-to-image';
import { getNodesBounds, getViewportForBounds } from '@xyflow/svelte';
import type { Node } from '@xyflow/svelte';
import { downloadDataUrl } from '$lib/io/fileSystem';
import { detectPacksFromArch, buildSidecarData, sidecarNameFor } from '$lib/io/sidecar';
import type { CalmArchitecture } from '@calmstudio/calm-core';

const IMAGE_WIDTH = 1920;
const IMAGE_HEIGHT = 1080;

// ─── CALM JSON export ─────────────────────────────────────────────────────────

/**
 * Export the current CALM architecture as a .calm.json file.
 *
 * If the architecture contains extension pack nodes (colon-prefixed node types),
 * a second download is triggered for the companion .calmstudio.json sidecar file.
 * Diagrams with only core CALM types do NOT get a sidecar.
 *
 * @param json      Pretty-printed JSON string from getModelJson()
 * @param filename  Output filename (default: architecture.calm.json)
 */
export function exportAsCalm(json: string, filename = 'architecture.calm.json'): void {
	// Strip _template metadata if present — template starter files must not leak
	// template metadata into exported CALM JSON files.
	let cleanJson = json;
	try {
		const parsed = JSON.parse(json);
		if ('_template' in parsed) {
			delete parsed._template;
			cleanJson = JSON.stringify(parsed, null, 2);
		}
	} catch {
		// Malformed JSON — fall through with original content; export will still work
	}

	const blob = new Blob([cleanJson], { type: 'application/json' });
	const url = URL.createObjectURL(blob);
	downloadDataUrl(url, filename);
	// Note: URL.revokeObjectURL not needed for data: URLs, but is for blob: URLs.
	// We use a blob: URL here so we revoke after the click microtask.
	setTimeout(() => URL.revokeObjectURL(url), 0);

	// Check if the architecture uses extension pack types — if so, export sidecar too.
	try {
		const arch = JSON.parse(cleanJson) as CalmArchitecture;
		const packIds = detectPacksFromArch(arch);
		if (packIds.length > 0) {
			const sidecarData = buildSidecarData(packIds);
			const sidecarJson = JSON.stringify(sidecarData, null, 2);
			const sidecarFilename = sidecarNameFor(filename);
			const sidecarBlob = new Blob([sidecarJson], { type: 'application/json' });
			const sidecarUrl = URL.createObjectURL(sidecarBlob);
			// Small delay so the browser doesn't block the second download
			setTimeout(() => {
				downloadDataUrl(sidecarUrl, sidecarFilename);
				setTimeout(() => URL.revokeObjectURL(sidecarUrl), 0);
			}, 200);
		}
	} catch {
		// Ignore JSON parse errors — main file was already exported
	}
}

// ─── SVG export ───────────────────────────────────────────────────────────────

/**
 * Export the canvas as an SVG file with transparent background.
 *
 * Captures the `.svelte-flow__viewport` element via html-to-image.
 * Requires a real browser — jsdom cannot render canvas styles.
 *
 * @param nodes  Current Svelte Flow nodes (used to compute viewport bounds)
 */
export async function exportAsSvg(nodes: Node[]): Promise<void> {
	const viewportEl = document.querySelector('.svelte-flow__viewport') as HTMLElement | null;
	if (!viewportEl) {
		console.error('[CalmStudio] SVG export failed: .svelte-flow__viewport not found in DOM');
		return;
	}

	const bounds = getNodesBounds(nodes);
	const viewport = getViewportForBounds(bounds, IMAGE_WIDTH, IMAGE_HEIGHT, 0.5, 2, 0.1);

	const dataUrl = await toSvg(viewportEl, {
		backgroundColor: 'transparent',
		width: IMAGE_WIDTH,
		height: IMAGE_HEIGHT,
		style: {
			width: `${IMAGE_WIDTH}px`,
			height: `${IMAGE_HEIGHT}px`,
			transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
		},
	});

	downloadDataUrl(dataUrl, 'architecture.svg');
}

// ─── PNG export ───────────────────────────────────────────────────────────────

/**
 * Export the canvas as a PNG file at 2x resolution (Retina).
 *
 * Captures the `.svelte-flow__viewport` element via html-to-image.
 * Requires a real browser — jsdom cannot render canvas styles.
 *
 * @param nodes  Current Svelte Flow nodes (used to compute viewport bounds)
 */
export async function exportAsPng(nodes: Node[]): Promise<void> {
	const viewportEl = document.querySelector('.svelte-flow__viewport') as HTMLElement | null;
	if (!viewportEl) {
		console.error('[CalmStudio] PNG export failed: .svelte-flow__viewport not found in DOM');
		return;
	}

	const bounds = getNodesBounds(nodes);
	const viewport = getViewportForBounds(bounds, IMAGE_WIDTH, IMAGE_HEIGHT, 0.5, 2, 0.1);

	const dataUrl = await toPng(viewportEl, {
		backgroundColor: 'transparent',
		width: IMAGE_WIDTH,
		height: IMAGE_HEIGHT,
		pixelRatio: 2,
		style: {
			width: `${IMAGE_WIDTH}px`,
			height: `${IMAGE_HEIGHT}px`,
			transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
		},
	});

	downloadDataUrl(dataUrl, 'architecture.png');
}

// ─── calmscript export (stub) ─────────────────────────────────────────────────

/**
 * Export the current calmscript view content as a .calmscript file.
 *
 * Phase 4 stub: accepts the content string currently shown in the code panel.
 * Will be fully functional after Phase 5 implements the calmscript DSL compiler.
 *
 * @param content  Current calmscript view content string from the code panel
 */
export function exportAsCalmscript(content: string): void {
	const blob = new Blob([content], { type: 'text/plain' });
	const url = URL.createObjectURL(blob);
	downloadDataUrl(url, 'architecture.calmscript');
	setTimeout(() => URL.revokeObjectURL(url), 0);
}
