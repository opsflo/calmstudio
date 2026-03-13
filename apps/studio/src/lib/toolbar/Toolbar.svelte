<!-- SPDX-FileCopyrightText: 2026 CalmStudio Contributors -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

<!--
  Toolbar.svelte — Slim top toolbar with file operations and export dropdown.

  Layout: full-width, ~36px height, border-bottom
  - Left:   "CalmStudio" app name
  - Center: filename + dirty indicator dot
  - Right:  New, Open, Save, Export dropdown buttons

  Props use Svelte 5 $props() rune with callback pattern.
  Export dropdown uses a simple $state boolean toggle with click-outside close.
-->

<script lang="ts">
	let {
		onopen,
		onsave,
		onsaveas,
		onnew,
		onvalidate,
		onexportcalm,
		onexportsvg,
		onexportpng,
		onexportcalmscript,
		filename = null,
		isDirty = false,
		c4Level = null,
		onc4levelchange,
	}: {
		onopen: () => void;
		onsave: () => void;
		onsaveas: () => void;
		onnew: () => void;
		onvalidate: () => void;
		onexportcalm: () => void;
		onexportsvg: () => void;
		onexportpng: () => void;
		onexportcalmscript: () => void;
		filename?: string | null;
		isDirty?: boolean;
		/** Current C4 view level. null = "All" (show everything), or 'context' | 'container' | 'component'. */
		c4Level?: string | null;
		/** Called when user clicks a C4 level segment button. level is null for "All". */
		onc4levelchange?: (level: string | null) => void;
	} = $props();

	const C4_SEGMENTS = [
		{ key: null, label: 'All' },
		{ key: 'context', label: 'Context' },
		{ key: 'container', label: 'Container' },
		{ key: 'component', label: 'Component' },
	] as const;

	let showExportMenu = $state(false);

	function toggleExportMenu() {
		showExportMenu = !showExportMenu;
	}

	function handleExportOption(fn: () => void) {
		showExportMenu = false;
		fn();
	}

	function handleClickOutside(e: MouseEvent) {
		const target = e.target as HTMLElement;
		if (!target.closest('.export-dropdown')) {
			showExportMenu = false;
		}
	}
</script>

<svelte:window onclick={handleClickOutside} />

<header class="toolbar" role="banner">
	<!-- Left: App name + C4 view selector -->
	<div class="toolbar-left">
		<span class="app-name">CalmStudio</span>
		<div class="c4-selector" role="group" aria-label="C4 view level">
			{#each C4_SEGMENTS as seg}
				<button
					type="button"
					class="c4-btn"
					class:active={c4Level === seg.key}
					onclick={() => onc4levelchange?.(seg.key)}
					aria-pressed={c4Level === seg.key}
				>
					{seg.label}
				</button>
			{/each}
		</div>
	</div>

	<!-- Center: Filename + dirty indicator -->
	<div class="toolbar-center">
		{#if filename}
			<span class="filename">{filename}</span>
			{#if isDirty}
				<span class="dirty-dot" aria-label="Unsaved changes" title="Unsaved changes">&#8226;</span>
			{/if}
		{:else}
			<span class="filename no-file">Untitled</span>
			{#if isDirty}
				<span class="dirty-dot" aria-label="Unsaved changes" title="Unsaved changes">&#8226;</span>
			{/if}
		{/if}
	</div>

	<!-- Right: File action buttons + Export dropdown -->
	<div class="toolbar-right">
		<!-- New -->
		<button
			type="button"
			class="toolbar-btn"
			onclick={onnew}
			aria-label="New diagram (⌥N)"
			title="New (⌥N)"
		>
			<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
				<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
				<polyline points="14 2 14 8 20 8" />
				<line x1="12" y1="11" x2="12" y2="17" />
				<line x1="9" y1="14" x2="15" y2="14" />
			</svg>
			<span class="btn-label">New</span>
		</button>

		<!-- Open -->
		<button
			type="button"
			class="toolbar-btn"
			onclick={onopen}
			aria-label="Open CALM JSON file (Cmd+O)"
			title="Open (Cmd+O)"
		>
			<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
				<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
			</svg>
			<span class="btn-label">Open</span>
		</button>

		<!-- Save -->
		<button
			type="button"
			class="toolbar-btn"
			onclick={onsave}
			aria-label="Save diagram (Cmd+S)"
			title="Save (Cmd+S)"
		>
			<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
				<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
				<polyline points="17 21 17 13 7 13 7 21" />
				<polyline points="7 3 7 8 15 8" />
			</svg>
			<span class="btn-label">Save</span>
		</button>

		<!-- Validate -->
		<button
			type="button"
			class="toolbar-btn"
			onclick={onvalidate}
			aria-label="Validate CALM diagram"
			title="Validate"
		>
			<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
				<path d="M9 12l2 2 4-4" />
				<path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
			</svg>
			<span class="btn-label">Validate</span>
		</button>

		<!-- Export dropdown -->
		<div class="export-dropdown">
			<button
				type="button"
				class="toolbar-btn export-toggle"
				onclick={(e) => { e.stopPropagation(); toggleExportMenu(); }}
				aria-label="Export diagram"
				aria-expanded={showExportMenu}
				aria-haspopup="menu"
				title="Export"
			>
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
					<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
					<polyline points="7 10 12 15 17 10" />
					<line x1="12" y1="15" x2="12" y2="3" />
				</svg>
				<span class="btn-label">Export</span>
				<svg class="chevron" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
					<polyline points="6 9 12 15 18 9" />
				</svg>
			</button>

			{#if showExportMenu}
				<div class="export-menu" role="menu" aria-label="Export options">
					<button
						type="button"
						class="export-menu-item"
						role="menuitem"
						onclick={() => handleExportOption(onexportcalm)}
					>
						CALM JSON (.calm.json)
					</button>
					<button
						type="button"
						class="export-menu-item"
						role="menuitem"
						onclick={() => handleExportOption(onexportcalmscript)}
					>
						calmscript (.calmscript)
					</button>
					<button
						type="button"
						class="export-menu-item"
						role="menuitem"
						onclick={() => handleExportOption(onexportsvg)}
					>
						SVG (.svg)
					</button>
					<button
						type="button"
						class="export-menu-item"
						role="menuitem"
						onclick={() => handleExportOption(onexportpng)}
					>
						PNG (.png)
					</button>
				</div>
			{/if}
		</div>
	</div>
</header>

<style>
	/* ─── Top toolbar bar ──────────────────────────────────────── */

	.toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 36px;
		padding: 0 12px;
		border-bottom: 1px solid var(--color-border);
		background: var(--color-surface);
		flex-shrink: 0;
		z-index: 100;
		position: relative;
	}

	:global(.dark) .toolbar {
		background: #0f172a;
		border-color: #1e293b;
	}

	/* ─── Left: App name ─────────────────────────────────────── */

	.toolbar-left {
		display: flex;
		align-items: center;
		gap: 10px;
		min-width: 120px;
	}

	.app-name {
		font-size: 12px;
		font-weight: 600;
		font-family: var(--font-sans);
		color: var(--color-text-secondary);
		letter-spacing: 0.02em;
		user-select: none;
	}

	:global(.dark) .app-name {
		color: #64748b;
	}

	/* ─── Center: Filename + dirty dot ──────────────────────── */

	.toolbar-center {
		display: flex;
		align-items: center;
		gap: 4px;
		position: absolute;
		left: 50%;
		transform: translateX(-50%);
	}

	.filename {
		font-size: 12px;
		font-family: var(--font-sans);
		color: var(--color-text-primary);
		max-width: 300px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.filename.no-file {
		color: var(--color-text-secondary);
	}

	:global(.dark) .filename {
		color: #e2e8f0;
	}

	:global(.dark) .filename.no-file {
		color: #475569;
	}

	.dirty-dot {
		font-size: 16px;
		line-height: 1;
		color: #f59e0b;
		flex-shrink: 0;
	}

	:global(.dark) .dirty-dot {
		color: #fbbf24;
	}

	/* ─── Right: Button group ────────────────────────────────── */

	.toolbar-right {
		display: flex;
		align-items: center;
		gap: 4px;
		min-width: 120px;
		justify-content: flex-end;
	}

	/* ─── Toolbar buttons ────────────────────────────────────── */

	.toolbar-btn {
		display: flex;
		align-items: center;
		gap: 4px;
		padding: 4px 8px;
		height: 26px;
		border-radius: 6px;
		border: 1px solid var(--color-border);
		background: var(--color-surface);
		color: var(--color-text-secondary);
		font-size: 11px;
		font-family: var(--font-sans);
		cursor: pointer;
		transition: all 0.12s ease;
		white-space: nowrap;
	}

	.toolbar-btn:hover {
		background: var(--color-surface-tertiary);
		color: var(--color-text-primary);
		border-color: var(--color-border);
	}

	:global(.dark) .toolbar-btn {
		background: #111827;
		border-color: #334155;
		color: #94a3b8;
	}

	:global(.dark) .toolbar-btn:hover {
		background: #1e293b;
		color: #e2e8f0;
	}

	.btn-label {
		font-weight: 500;
	}

	/* ─── Export dropdown ────────────────────────────────────── */

	.export-dropdown {
		position: relative;
	}

	.export-toggle {
		/* Same as toolbar-btn + chevron spacing */
		gap: 3px;
	}

	.chevron {
		margin-left: 2px;
		opacity: 0.6;
	}

	.export-menu {
		position: absolute;
		right: 0;
		top: calc(100% + 4px);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 8px;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
		min-width: 180px;
		padding: 4px;
		z-index: 200;
	}

	:global(.dark) .export-menu {
		background: #111827;
		border-color: #334155;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
	}

	.export-menu-item {
		display: block;
		width: 100%;
		padding: 7px 10px;
		border: none;
		background: none;
		color: var(--color-text-primary);
		font-size: 12px;
		font-family: var(--font-sans);
		cursor: pointer;
		border-radius: 5px;
		text-align: left;
		transition: background 0.1s ease;
	}

	.export-menu-item:hover {
		background: var(--color-surface-tertiary);
	}

	:global(.dark) .export-menu-item {
		color: #e2e8f0;
	}

	:global(.dark) .export-menu-item:hover {
		background: #1e293b;
	}

	/* ─── C4 view level segmented control ────────────────────── */

	.c4-selector {
		display: flex;
		gap: 0;
		border: 1px solid var(--color-border, #e2e8f0);
		border-radius: 6px;
		overflow: hidden;
	}

	.c4-btn {
		padding: 2px 10px;
		height: 22px;
		font-size: 11px;
		font-family: var(--font-sans);
		font-weight: 500;
		border: none;
		border-right: 1px solid var(--color-border, #e2e8f0);
		background: transparent;
		cursor: pointer;
		color: var(--color-text-secondary);
		transition: background 0.15s, color 0.15s;
		white-space: nowrap;
	}

	.c4-btn:last-child {
		border-right: none;
	}

	.c4-btn.active {
		background: var(--color-accent, #3b82f6);
		color: white;
	}

	.c4-btn:hover:not(.active) {
		background: var(--color-surface-tertiary, #f1f5f9);
		color: var(--color-text-primary);
	}

	:global(.dark) .c4-selector {
		border-color: #334155;
	}

	:global(.dark) .c4-btn {
		color: #94a3b8;
		border-right-color: #334155;
	}

	:global(.dark) .c4-btn.active {
		background: #60a5fa;
		color: #0f172a;
	}

	:global(.dark) .c4-btn:hover:not(.active) {
		background: #1e293b;
		color: #e2e8f0;
	}
</style>
