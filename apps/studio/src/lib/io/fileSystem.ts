// SPDX-FileCopyrightText: 2026 CalmStudio Contributors
//
// SPDX-License-Identifier: Apache-2.0

/**
 * fileSystem.ts — File I/O with File System Access API and browser fallbacks.
 *
 * Strategy:
 * - openFile: showOpenFilePicker (Chrome/Edge) → <input type="file"> fallback
 * - saveFile: existing handle → showSaveFilePicker → Blob download fallback
 * - saveFileAs: always prompts (showSaveFilePicker → Blob download fallback)
 * - downloadDataUrl: anchor click (for data: URLs — SVG, PNG exports)
 *
 * All picker calls must be inside user-gesture handlers (RESEARCH Pitfall 5).
 */

export interface OpenFileResult {
	content: string;
	name: string;
	handle: FileSystemFileHandle | null;
}

/**
 * Open a file using showOpenFilePicker if available, otherwise via
 * a hidden <input type="file"> element (Firefox/Safari fallback).
 *
 * Must be called directly from a user gesture handler.
 */
export async function openFile(): Promise<OpenFileResult> {
	if (typeof (window as unknown as Record<string, unknown>)['showOpenFilePicker'] === 'function') {
		const [handle] = await (window as unknown as { showOpenFilePicker: (opts?: unknown) => Promise<FileSystemFileHandle[]> }).showOpenFilePicker({
			types: [
				{
					description: 'CALM JSON',
					accept: { 'application/json': ['.json', '.calm.json'] },
				},
			],
		});
		const file = await handle.getFile();
		const content = await file.text();
		return { content, name: file.name, handle };
	}

	// Fallback: hidden <input type="file">
	return new Promise((resolve) => {
		const input = document.createElement('input') as HTMLInputElement;
		input.type = 'file';
		input.accept = '.json,.calm.json';

		input.onchange = () => {
			const file = input.files![0];
			const reader = new FileReader();
			reader.onload = (event) => {
				const content = (event.target as FileReader).result as string;
				resolve({ content, name: file.name, handle: null });
			};
			reader.readAsText(file);
		};

		input.click();
	});
}

/**
 * Save content to a file.
 * - If handle provided: write in-place via createWritable().
 * - Else if showSaveFilePicker available: prompt for location.
 * - Else: trigger Blob download (Firefox/Safari fallback).
 *
 * Returns the file handle (new or existing) or null if Blob download used.
 * Must be called directly from a user gesture handler.
 */
export async function saveFile(
	content: string,
	handle: FileSystemFileHandle | null,
	filename: string,
): Promise<FileSystemFileHandle | null> {
	if (handle) {
		const writable = await handle.createWritable();
		await writable.write(content);
		await writable.close();
		return handle;
	}

	if (typeof (window as unknown as Record<string, unknown>)['showSaveFilePicker'] === 'function') {
		const newHandle = await (window as unknown as { showSaveFilePicker: (opts?: unknown) => Promise<FileSystemFileHandle> }).showSaveFilePicker({
			suggestedName: filename,
			types: [
				{
					description: 'CALM JSON',
					accept: { 'application/json': ['.json', '.calm.json'] },
				},
			],
		});
		const writable = await newHandle.createWritable();
		await writable.write(content);
		await writable.close();
		return newHandle;
	}

	// Fallback: Blob download
	_blobDownload(content, filename);
	return null;
}

/**
 * Save As — always prompts the user to choose a new location.
 * - Uses showSaveFilePicker if available.
 * - Falls back to Blob download otherwise.
 *
 * Returns the new file handle or null.
 * Must be called directly from a user gesture handler.
 */
export async function saveFileAs(
	content: string,
	filename: string,
): Promise<FileSystemFileHandle | null> {
	if (typeof (window as unknown as Record<string, unknown>)['showSaveFilePicker'] === 'function') {
		const handle = await (window as unknown as { showSaveFilePicker: (opts?: unknown) => Promise<FileSystemFileHandle> }).showSaveFilePicker({
			suggestedName: filename,
			types: [
				{
					description: 'CALM JSON',
					accept: { 'application/json': ['.json', '.calm.json'] },
				},
			],
		});
		const writable = await handle.createWritable();
		await writable.write(content);
		await writable.close();
		return handle;
	}

	// Fallback: Blob download
	_blobDownload(content, filename);
	return null;
}

/**
 * Download a data URL (e.g., SVG or PNG) by triggering an anchor click.
 * No URL.createObjectURL needed — data URLs are self-contained.
 */
export function downloadDataUrl(dataUrl: string, filename: string): void {
	const a = document.createElement('a');
	a.href = dataUrl;
	a.download = filename;
	a.click();
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function _blobDownload(content: string, filename: string): void {
	const blob = new Blob([content], { type: 'application/json' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}
