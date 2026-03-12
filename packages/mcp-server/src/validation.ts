// SPDX-FileCopyrightText: 2024 CalmStudio contributors - see NOTICE file
//
// SPDX-License-Identifier: Apache-2.0

import type { CalmArchitecture, CalmNode, CalmRelationship } from '@calmstudio/calm-core';

export interface ValidationIssue {
  severity: 'error' | 'warning';
  message: string;
  nodeId?: string;
  relationshipId?: string;
}

/**
 * Validate a CALM architecture and return a list of issues.
 * Returns an empty array for a valid architecture.
 *
 * Errors:
 *   - Node missing unique-id or name
 *   - Relationship missing unique-id, source, or destination
 *   - Relationship references a node not in arch.nodes (dangling ref)
 *   - Duplicate unique-id across nodes
 *   - Duplicate unique-id across relationships
 *
 * Warnings:
 *   - Node has no relationships (orphan)
 *   - Relationship source equals destination (self-loop)
 */
export function validateArchitecture(arch: CalmArchitecture): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Collect node IDs for reference checks
  const nodeIds = new Set<string>();
  const duplicateNodeIds = new Set<string>();

  for (const node of arch.nodes) {
    if (!node['unique-id'] || !node.name) {
      issues.push({
        severity: 'error',
        message: `Node is missing required fields (unique-id or name): ${JSON.stringify(node)}`,
        nodeId: node['unique-id'] ?? undefined
      });
      continue;
    }
    if (nodeIds.has(node['unique-id'])) {
      duplicateNodeIds.add(node['unique-id']);
    }
    nodeIds.add(node['unique-id']);
  }

  for (const id of duplicateNodeIds) {
    issues.push({
      severity: 'error',
      message: `Duplicate node unique-id: "${id}"`,
      nodeId: id
    });
  }

  // Collect relationship IDs for duplicate checks
  const relIds = new Set<string>();
  const duplicateRelIds = new Set<string>();

  for (const rel of arch.relationships) {
    if (!rel['unique-id'] || !rel.source || !rel.destination) {
      issues.push({
        severity: 'error',
        message: `Relationship is missing required fields (unique-id, source, or destination): ${JSON.stringify(rel)}`,
        relationshipId: rel['unique-id'] ?? undefined
      });
      continue;
    }
    if (relIds.has(rel['unique-id'])) {
      duplicateRelIds.add(rel['unique-id']);
    }
    relIds.add(rel['unique-id']);
  }

  for (const id of duplicateRelIds) {
    issues.push({
      severity: 'error',
      message: `Duplicate relationship unique-id: "${id}"`,
      relationshipId: id
    });
  }

  // Check relationship references — only for valid relationships
  const availableIds = [...nodeIds].join(', ');

  for (const rel of arch.relationships) {
    if (!rel['unique-id'] || !rel.source || !rel.destination) continue;

    if (!nodeIds.has(rel.source)) {
      issues.push({
        severity: 'error',
        message: `Relationship "${rel['unique-id']}" references unknown source node "${rel.source}". Available node IDs: ${availableIds || '(none)'}`,
        relationshipId: rel['unique-id']
      });
    }
    if (!nodeIds.has(rel.destination)) {
      issues.push({
        severity: 'error',
        message: `Relationship "${rel['unique-id']}" references unknown destination node "${rel.destination}". Available node IDs: ${availableIds || '(none)'}`,
        relationshipId: rel['unique-id']
      });
    }

    // Warning: self-loop
    if (rel.source === rel.destination) {
      issues.push({
        severity: 'warning',
        message: `Relationship "${rel['unique-id']}" has the same source and destination ("${rel.source}") — self-loop`,
        relationshipId: rel['unique-id']
      });
    }
  }

  // Warning: orphan nodes (no relationships)
  const connectedNodeIds = new Set<string>();
  for (const rel of arch.relationships) {
    if (rel.source) connectedNodeIds.add(rel.source);
    if (rel.destination) connectedNodeIds.add(rel.destination);
  }

  for (const node of arch.nodes) {
    if (node['unique-id'] && !connectedNodeIds.has(node['unique-id'])) {
      issues.push({
        severity: 'warning',
        message: `Node "${node['unique-id']}" (${node.name}) has no relationships — orphan node`,
        nodeId: node['unique-id']
      });
    }
  }

  return issues;
}

// Re-export types for consumers
export type { CalmArchitecture, CalmNode, CalmRelationship };
