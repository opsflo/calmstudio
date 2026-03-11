// SPDX-FileCopyrightText: 2024 CalmStudio contributors - see NOTICE file
//
// SPDX-License-Identifier: Apache-2.0

import ActorNode from './nodes/ActorNode.svelte';
import SystemNode from './nodes/SystemNode.svelte';
import ServiceNode from './nodes/ServiceNode.svelte';
import DatabaseNode from './nodes/DatabaseNode.svelte';
import NetworkNode from './nodes/NetworkNode.svelte';
import WebclientNode from './nodes/WebclientNode.svelte';
import EcosystemNode from './nodes/EcosystemNode.svelte';
import LdapNode from './nodes/LdapNode.svelte';
import DataAssetNode from './nodes/DataAssetNode.svelte';
import GenericNode from './nodes/GenericNode.svelte';
import ContainerNode from './nodes/ContainerNode.svelte';

/**
 * Maps CALM node type strings to their corresponding Svelte Flow node components.
 * Pass this object directly to <SvelteFlow nodeTypes={nodeTypes} />.
 */
export const nodeTypes = {
	actor: ActorNode,
	system: SystemNode,
	service: ServiceNode,
	database: DatabaseNode,
	network: NetworkNode,
	webclient: WebclientNode,
	ecosystem: EcosystemNode,
	ldap: LdapNode,
	'data-asset': DataAssetNode,
	generic: GenericNode,
	container: ContainerNode,
} as const;

/** The set of built-in CALM node type strings (for runtime lookup). */
const BUILT_IN_TYPES = new Set<string>([
	'actor',
	'system',
	'service',
	'database',
	'network',
	'webclient',
	'ecosystem',
	'ldap',
	'data-asset',
]);

/**
 * Resolves a CALM node-type string to a key in the nodeTypes map.
 * Built-in types are returned as-is; custom/unknown types fall back to 'generic'.
 *
 * @param calmType - The node-type value from a CALM architecture document.
 * @returns A key from the nodeTypes map — one of the 9 built-in types or 'generic'.
 */
export function resolveNodeType(calmType: string): keyof typeof nodeTypes {
	if (BUILT_IN_TYPES.has(calmType)) {
		return calmType as keyof typeof nodeTypes;
	}
	return 'generic';
}
