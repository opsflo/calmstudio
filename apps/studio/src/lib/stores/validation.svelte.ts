// SPDX-FileCopyrightText: 2026 CalmStudio Contributors
//
// SPDX-License-Identifier: Apache-2.0

/**
 * validation.svelte.ts — Reactive debounced validation store.
 *
 * Tracks getModel() reactively via $effect and runs validateCalmArchitecture()
 * with a 400ms debounce. Validation results are stored in module-level $state
 * and exposed via pure accessor functions.
 *
 * IMPORTANT: This store READS getModel() but NEVER WRITES to calmModel.
 * Validation data is injected into node.data by +page.svelte (Plan 02 wiring).
 * This prevents the infinite loop described in RESEARCH Pitfall 3.
 *
 * Panel auto-open logic:
 *   - When errors appear and panelDismissed is false -> auto-open
 *   - Manual dismiss sets panelDismissed = true (persists until resetDismiss)
 *   - resetDismiss() called on new file load (clears dismissed state)
 */

import { getModel } from './calmModel.svelte';
import { validateCalmArchitecture, type ValidationIssue } from '@calmstudio/calm-core';

// Re-export ValidationIssue for consumers that cannot resolve @calmstudio/calm-core via tsconfig
export type { ValidationIssue };

// ─── Module-level state ───────────────────────────────────────────────────────

let issues = $state<ValidationIssue[]>([]);
let panelDismissed = $state(false);
let panelWasAutoOpened = $state(false);
let scrollToId = $state<string | null>(null);

// Plain let — debounce timer has no reactivity need (per syncing mutex pattern)
let debounceTimer: ReturnType<typeof setTimeout> | undefined;

// ─── Reactive debounced validation effect ────────────────────────────────────

$effect.root(() => {
	$effect(() => {
		// Reactive tracking: reading getModel() subscribes to model changes
		const currentModel = getModel();

		// Clear any pending debounce
		clearTimeout(debounceTimer);

		debounceTimer = setTimeout(() => {
			issues = validateCalmArchitecture(currentModel);

			// Auto-open panel on first errors (unless user already dismissed)
			const hasErrors = issues.some((i) => i.severity === 'error');
			if (hasErrors && !panelDismissed) {
				panelWasAutoOpened = true;
			}
		}, 400);

		// Cleanup: clear timer when effect re-runs or component unmounts
		return () => {
			clearTimeout(debounceTimer);
		};
	});
});

// ─── Accessor functions ───────────────────────────────────────────────────────

/** Returns all current validation issues. */
export function getIssues(): ValidationIssue[] {
	return issues;
}

/** Returns all issues for a specific element (node or relationship) by unique-id. */
export function getIssuesByElementId(id: string): ValidationIssue[] {
	return issues.filter((i) => i.nodeId === id || i.relationshipId === id);
}

/** Returns the count of error-severity issues for the given element. */
export function getErrorCountForElement(id: string): number {
	return issues.filter((i) => i.severity === 'error' && (i.nodeId === id || i.relationshipId === id)).length;
}

/** Returns the count of warning-severity issues for the given element. */
export function getWarningCountForElement(id: string): number {
	return issues.filter((i) => i.severity === 'warning' && (i.nodeId === id || i.relationshipId === id)).length;
}

/**
 * Returns the highest severity for the given element, or null if no issues.
 * Priority: error > warning > info
 */
export function getMaxSeverityForElement(id: string): 'error' | 'warning' | 'info' | null {
	const elementIssues = getIssuesByElementId(id);
	if (elementIssues.some((i) => i.severity === 'error')) return 'error';
	if (elementIssues.some((i) => i.severity === 'warning')) return 'warning';
	if (elementIssues.some((i) => i.severity === 'info')) return 'info';
	return null;
}

/** Returns true when the validation panel should be visible (auto-opened and not dismissed). */
export function isPanelOpen(): boolean {
	return panelWasAutoOpened && !panelDismissed;
}

/** Dismiss the validation panel. Panel will not auto-reopen until resetDismiss(). */
export function dismissPanel(): void {
	panelDismissed = true;
}

/** Reset dismissed state. Call on new file load to allow panel to auto-open again. */
export function resetDismiss(): void {
	panelDismissed = false;
	panelWasAutoOpened = false;
}

/** Returns the element ID that the panel should scroll to (set by badge click). */
export function getScrollToElementId(): string | null {
	return scrollToId;
}

/** Set the element ID for panel scroll coordination (called by badge click). */
export function setScrollToElementId(id: string | null): void {
	scrollToId = id;
}
