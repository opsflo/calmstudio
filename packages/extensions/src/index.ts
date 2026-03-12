// SPDX-FileCopyrightText: 2024 CalmStudio contributors - see NOTICE file
//
// SPDX-License-Identifier: Apache-2.0

export type { PackDefinition, NodeTypeEntry, PackColor } from './types.js';
export {
	registerPack,
	resolvePackNode,
	getAllPacks,
	getPacksForTypes,
	resetRegistry,
} from './registry.js';
export { corePack } from './packs/core.js';

import { registerPack } from './registry.js';
import { corePack as _corePack } from './packs/core.js';

/** Register all built-in packs. Call once at application startup. */
export function initAllPacks(): void {
	registerPack(_corePack);
}
