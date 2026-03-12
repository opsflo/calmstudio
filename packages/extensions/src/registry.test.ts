// SPDX-FileCopyrightText: 2024 CalmStudio contributors - see NOTICE file
//
// SPDX-License-Identifier: Apache-2.0
import { describe, it, expect, beforeEach } from 'vitest';
import {
	registerPack,
	resolvePackNode,
	getAllPacks,
	getPacksForTypes,
	resetRegistry,
} from './registry.js';
import { corePack } from './packs/core.js';
import { initAllPacks } from './index.js';
import type { PackDefinition } from './types.js';

describe('PackRegistry', () => {
	beforeEach(() => {
		resetRegistry();
	});

	it('getAllPacks() returns empty array before any registration', () => {
		expect(getAllPacks()).toEqual([]);
	});

	it('registerPack(corePack) makes corePack retrievable via getAllPacks()', () => {
		registerPack(corePack);
		expect(getAllPacks()).toContain(corePack);
	});

	it('resolvePackNode("actor") returns null (core types are unprefixed)', () => {
		registerPack(corePack);
		expect(resolvePackNode('actor')).toBeNull();
	});

	it('resolvePackNode("aws:lambda") returns null when no AWS pack registered', () => {
		expect(resolvePackNode('aws:lambda')).toBeNull();
	});

	it('resolvePackNode("test:foo") returns the entry after registering a pack with that typeId', () => {
		const testPack: PackDefinition = {
			id: 'test',
			label: 'Test Pack',
			version: '1.0.0',
			color: { bg: '#fff', border: '#000', stroke: '#000' },
			nodes: [
				{
					typeId: 'test:foo',
					label: 'Foo',
					icon: '<svg/>',
					color: { bg: '#fff', border: '#000', stroke: '#000' },
				},
			],
		};
		registerPack(testPack);
		const result = resolvePackNode('test:foo');
		expect(result).not.toBeNull();
		expect(result?.typeId).toBe('test:foo');
	});

	it('getPacksForTypes returns unique pack IDs from colon-prefixed types, ignoring unprefixed', () => {
		const packs = getPacksForTypes(['aws:lambda', 'actor', 'k8s:pod']);
		expect(packs).toContain('aws');
		expect(packs).toContain('k8s');
		expect(packs).not.toContain('actor');
		expect(packs.length).toBe(2);
	});

	it('resetRegistry() clears all registered packs', () => {
		registerPack(corePack);
		expect(getAllPacks().length).toBeGreaterThan(0);
		resetRegistry();
		expect(getAllPacks()).toEqual([]);
	});
});

describe('corePack', () => {
	it('corePack.id === "core"', () => {
		expect(corePack.id).toBe('core');
	});

	it('corePack.nodes.length === 9', () => {
		expect(corePack.nodes.length).toBe(9);
	});

	it('corePack.nodes includes entries for all 9 CALM types', () => {
		const typeIds = corePack.nodes.map((n) => n.typeId);
		const expectedTypes = [
			'actor',
			'system',
			'service',
			'database',
			'network',
			'webclient',
			'ecosystem',
			'ldap',
			'data-asset',
		];
		for (const t of expectedTypes) {
			expect(typeIds).toContain(t);
		}
	});
});

describe('initAllPacks', () => {
	beforeEach(() => {
		resetRegistry();
	});

	it('initAllPacks() registers core pack', () => {
		initAllPacks();
		const packs = getAllPacks();
		expect(packs.some((p) => p.id === 'core')).toBe(true);
	});
});
