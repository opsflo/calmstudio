// SPDX-FileCopyrightText: 2024 CalmStudio contributors - see NOTICE file
//
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect, expectTypeOf } from 'vitest';
import type {
  CalmNode,
  CalmRelationship,
  CalmArchitecture,
  CalmDecorator,
  CalmEvidence,
  CalmControls,
  CalmControl,
  CalmControlRequirement,
} from './types.js';

describe('CALM 1.2 type definitions', () => {
  it('CalmNode accepts controls property without TypeScript error', () => {
    const controls: CalmControls = {
      'aigf-firewalling-filtering': {
        description: 'Firewall for LLM inputs/outputs',
        requirements: [
          {
            'requirement-url': 'https://example.com/req/fw-01',
          },
        ],
      },
    };

    const node: CalmNode = {
      'unique-id': 'n1',
      'node-type': 'ai:llm',
      name: 'LLM Node',
      controls,
    };

    expect(node.controls).toBeDefined();
    expect(node.controls?.['aigf-firewalling-filtering']).toBeDefined();
  });

  it('CalmNode accepts data-classification property without TypeScript error', () => {
    const node: CalmNode = {
      'unique-id': 'n2',
      'node-type': 'database',
      name: 'Customer DB',
      'data-classification': 'PII',
    };

    expect(node['data-classification']).toBe('PII');
  });

  it('CalmNode accepts metadata property without TypeScript error', () => {
    const node: CalmNode = {
      'unique-id': 'n3',
      'node-type': 'service',
      name: 'API Service',
      metadata: { tier: 'critical', owner: 'team-alpha' },
    };

    expect(node.metadata?.['tier']).toBe('critical');
  });

  it('CalmRelationship accepts controls property without TypeScript error', () => {
    const rel: CalmRelationship = {
      'unique-id': 'r1',
      'relationship-type': 'connects',
      source: 'n1',
      destination: 'n2',
      controls: {
        'aigf-encryption-data-at-rest': {
          description: 'Encrypt data in transit',
          requirements: [
            {
              'requirement-url': 'https://example.com/req/enc-01',
              'config-url': 'https://example.com/config/tls',
            },
          ],
        },
      },
    };

    expect(rel.controls).toBeDefined();
  });

  it('CalmRelationship accepts metadata property without TypeScript error', () => {
    const rel: CalmRelationship = {
      'unique-id': 'r2',
      'relationship-type': 'interacts',
      source: 'n1',
      destination: 'n3',
      metadata: { latency: 'low', protocol: 'gRPC' },
    };

    expect(rel.metadata?.['latency']).toBe('low');
  });

  it('CalmArchitecture accepts decorators array without TypeScript error', () => {
    const arch: CalmArchitecture = {
      nodes: [],
      relationships: [],
      decorators: [
        {
          'unique-id': 'd1',
          type: 'aigf-governance',
          target: ['n1'],
          'applies-to': ['controls'],
          data: { score: 85, unmitigated: 2 },
        },
      ],
    };

    expect(arch.decorators).toHaveLength(1);
  });

  it('CalmDecorator has required fields (unique-id, type, target, applies-to, data)', () => {
    const decorator: CalmDecorator = {
      'unique-id': 'd1',
      type: 'aigf-governance',
      target: ['n1', 'n2'],
      'applies-to': ['controls', 'risks'],
      data: { score: 75 },
    };

    expect(decorator['unique-id']).toBe('d1');
    expect(decorator.type).toBe('aigf-governance');
    expect(decorator.target).toEqual(['n1', 'n2']);
    expect(decorator['applies-to']).toEqual(['controls', 'risks']);
    expect(decorator.data).toEqual({ score: 75 });
  });

  it('CalmEvidence has required fields (unique-id, evidence-paths, control-config-url)', () => {
    const evidence: CalmEvidence = {
      'unique-id': 'ev1',
      'evidence-paths': ['/evidence/scan-results.json', '/evidence/audit-log.txt'],
      'control-config-url': 'https://example.com/controls/aigf-fw-01',
    };

    expect(evidence['unique-id']).toBe('ev1');
    expect(evidence['evidence-paths']).toHaveLength(2);
    expect(evidence['control-config-url']).toBe('https://example.com/controls/aigf-fw-01');
  });

  it('CalmControlRequirement only requires requirement-url', () => {
    const minimalReq: CalmControlRequirement = {
      'requirement-url': 'https://example.com/req/001',
    };

    expect(minimalReq['requirement-url']).toBeDefined();
    expect(minimalReq['config-url']).toBeUndefined();
    expect(minimalReq.config).toBeUndefined();
  });

  it('CalmControl has description and requirements array', () => {
    const control: CalmControl = {
      description: 'Prevent data leakage from AI systems',
      requirements: [
        {
          'requirement-url': 'https://example.com/req/dlp-01',
          config: { scanLevel: 'deep', piiPatterns: ['credit-card', 'ssn'] },
        },
      ],
    };

    expect(control.description).toBe('Prevent data leakage from AI systems');
    expect(control.requirements).toHaveLength(1);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect(control.requirements[0]!.config?.['scanLevel']).toBe('deep');
  });
});
