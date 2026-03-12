// SPDX-FileCopyrightText: 2024 CalmStudio contributors - see NOTICE file
//
// SPDX-License-Identifier: Apache-2.0
import { describe, it, expect } from 'vitest';

// Enable after Plan 03 creates sidecar.ts
describe('sidecarNameFor', () => {
	it.skip('sidecarNameFor("architecture.json") returns "architecture.calmstudio.json"', () => {
		// import { sidecarNameFor } from '$lib/sidecar.js';
		// expect(sidecarNameFor('architecture.json')).toBe('architecture.calmstudio.json');
	});

	it.skip('sidecarNameFor("my-diagram.calm.json") returns "my-diagram.calm.calmstudio.json"', () => {
		// import { sidecarNameFor } from '$lib/sidecar.js';
		// expect(sidecarNameFor('my-diagram.calm.json')).toBe('my-diagram.calm.calmstudio.json');
	});
});

// Enable after Plan 03 creates sidecar.ts
describe('detectPacksFromArch', () => {
	it.skip('detectPacksFromArch with aws:lambda and actor nodes returns ["aws"]', () => {
		// import { detectPacksFromArch } from '$lib/sidecar.js';
		// const arch = { nodes: [{ 'node-type': 'aws:lambda' }, { 'node-type': 'actor' }] };
		// expect(detectPacksFromArch(arch)).toEqual(['aws']);
	});

	it.skip('detectPacksFromArch with only core types returns []', () => {
		// import { detectPacksFromArch } from '$lib/sidecar.js';
		// const arch = { nodes: [{ 'node-type': 'actor' }] };
		// expect(detectPacksFromArch(arch)).toEqual([]);
	});
});
