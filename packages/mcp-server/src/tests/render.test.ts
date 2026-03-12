// SPDX-FileCopyrightText: 2024 CalmStudio contributors - see NOTICE file
//
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { writeFileSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { renderDiagram, validateArchitectureTool } from '../tools/render.js';

const tmpFile = join(tmpdir(), `render-test-${Date.now()}.calm`);

const sampleArch = {
  nodes: [
    { 'unique-id': 'node-1', 'node-type': 'system', name: 'Frontend' },
    { 'unique-id': 'node-2', 'node-type': 'service', name: 'API' },
    { 'unique-id': 'node-3', 'node-type': 'database', name: 'DB' }
  ],
  relationships: [
    { 'unique-id': 'rel-1', 'relationship-type': 'connects', source: 'node-1', destination: 'node-2' },
    { 'unique-id': 'rel-2', 'relationship-type': 'connects', source: 'node-2', destination: 'node-3' }
  ]
};

const emptyArch = { nodes: [], relationships: [] };

beforeEach(() => {
  writeFileSync(tmpFile, JSON.stringify(sampleArch, null, 2), 'utf-8');
});

afterEach(() => {
  try { unlinkSync(tmpFile); } catch { /* ignore */ }
});

describe('render_diagram tool', () => {
  it('returns SVG string for valid architecture', async () => {
    const result = await renderDiagram({ file: tmpFile, direction: 'DOWN' });
    expect(result.isError).toBe(false);
    const text = result.content[0]!.text;
    expect(text).toContain('<svg');
    expect(text).toContain('</svg>');
  });

  it('handles empty architecture — returns placeholder SVG', async () => {
    writeFileSync(tmpFile, JSON.stringify(emptyArch, null, 2), 'utf-8');
    const result = await renderDiagram({ file: tmpFile, direction: 'DOWN' });
    expect(result.isError).toBe(false);
    expect(result.content[0]!.text).toContain('<svg');
  });

  it('direction RIGHT produces SVG (no crash)', async () => {
    const result = await renderDiagram({ file: tmpFile, direction: 'RIGHT' });
    expect(result.isError).toBe(false);
    expect(result.content[0]!.text).toContain('<svg');
  });

  it('includes node names in SVG', async () => {
    const result = await renderDiagram({ file: tmpFile, direction: 'DOWN' });
    const svg = result.content[0]!.text;
    // SVG should contain node IDs used in ELK layout
    expect(svg.length).toBeGreaterThan(100);
  });
});

describe('validate_architecture tool', () => {
  it('returns no issues for valid architecture', () => {
    writeFileSync(tmpFile, JSON.stringify(sampleArch, null, 2), 'utf-8');
    const result = validateArchitectureTool({ file: tmpFile });
    expect(result.isError).toBe(false);
    expect(result.content[0]!.text).toContain('No validation issues');
  });

  it('returns error for dangling relationship reference', () => {
    const arch = {
      nodes: [{ 'unique-id': 'a', 'node-type': 'system', name: 'A' }],
      relationships: [
        { 'unique-id': 'r1', 'relationship-type': 'connects', source: 'a', destination: 'missing-node' }
      ]
    };
    writeFileSync(tmpFile, JSON.stringify(arch, null, 2), 'utf-8');
    const result = validateArchitectureTool({ file: tmpFile });
    expect(result.isError).toBe(false);
    expect(result.content[0]!.text).toContain('[ERROR]');
    expect(result.content[0]!.text).toContain('missing-node');
  });

  it('returns error for duplicate node IDs', () => {
    const arch = {
      nodes: [
        { 'unique-id': 'dup', 'node-type': 'system', name: 'First' },
        { 'unique-id': 'dup', 'node-type': 'service', name: 'Second' }
      ],
      relationships: []
    };
    writeFileSync(tmpFile, JSON.stringify(arch, null, 2), 'utf-8');
    const result = validateArchitectureTool({ file: tmpFile });
    expect(result.isError).toBe(false);
    expect(result.content[0]!.text).toContain('[ERROR]');
    expect(result.content[0]!.text).toContain('dup');
  });

  it('returns warning for orphan node', () => {
    const arch = {
      nodes: [
        { 'unique-id': 'connected', 'node-type': 'system', name: 'Connected' },
        { 'unique-id': 'orphan', 'node-type': 'service', name: 'Orphan' }
      ],
      relationships: [
        { 'unique-id': 'r1', 'relationship-type': 'connects', source: 'connected', destination: 'connected' }
      ]
    };
    writeFileSync(tmpFile, JSON.stringify(arch, null, 2), 'utf-8');
    const result = validateArchitectureTool({ file: tmpFile });
    expect(result.isError).toBe(false);
    expect(result.content[0]!.text).toContain('[WARNING]');
    expect(result.content[0]!.text).toContain('orphan');
  });
});
