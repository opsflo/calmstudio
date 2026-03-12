// SPDX-FileCopyrightText: 2024 CalmStudio contributors - see NOTICE file
//
// SPDX-License-Identifier: Apache-2.0
import { describe, it, expect } from 'vitest';
import { resolveNodeType } from '$lib/canvas/nodeTypes.js';

describe('resolveNodeType — built-in types', () => {
	it('resolveNodeType("actor") returns "actor"', () => {
		expect(resolveNodeType('actor')).toBe('actor');
	});

	it('resolveNodeType("unknown-custom") returns "generic"', () => {
		expect(resolveNodeType('unknown-custom')).toBe('generic');
	});
});

describe('resolveNodeType — extension pack types (Plan 03)', () => {
	// Enable after Plan 03 wires resolveNodeType to pack registry
	it.skip('resolveNodeType("aws:lambda") returns "extension"', () => {
		expect(resolveNodeType('aws:lambda')).toBe('extension');
	});

	it.skip('resolveNodeType("k8s:pod") returns "extension"', () => {
		expect(resolveNodeType('k8s:pod')).toBe('extension');
	});
});
