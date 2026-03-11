// SPDX-FileCopyrightText: 2024 CalmStudio contributors - see NOTICE file
//
// SPDX-License-Identifier: Apache-2.0

/**
 * The 9 built-in CALM node types. Custom types are represented as plain strings.
 */
export type CalmNodeType =
  | 'actor'
  | 'system'
  | 'service'
  | 'database'
  | 'network'
  | 'webclient'
  | 'ecosystem'
  | 'ldap'
  | 'data-asset';

/**
 * The 5 CALM relationship types.
 */
export type CalmRelationshipType =
  | 'connects'
  | 'interacts'
  | 'deployed-in'
  | 'composed-of'
  | 'options';

/**
 * A typed interface (endpoint) attached to a CALM node.
 * Represents things like URLs, host-port pairs, container images, etc.
 */
export interface CalmInterface {
  'unique-id': string;
  /** e.g. 'url', 'host-port', 'container-image', 'port' */
  type: string;
  value?: string;
}

/**
 * A node in the CALM architecture graph.
 * Corresponds to services, databases, actors, and other system components.
 */
export interface CalmNode {
  'unique-id': string;
  /** node-type is CalmNodeType for built-in types; plain string allows custom types */
  'node-type': CalmNodeType | string;
  name: string;
  description?: string;
  interfaces?: CalmInterface[];
}

/**
 * A directed relationship between two CALM nodes.
 */
export interface CalmRelationship {
  'unique-id': string;
  'relationship-type': CalmRelationshipType;
  /** unique-id of the source node */
  source: string;
  /** unique-id of the destination node */
  destination: string;
  /** e.g. 'HTTPS', 'JDBC', 'gRPC' */
  protocol?: string;
  description?: string;
}

/**
 * A complete CALM architecture document — nodes + relationships.
 */
export interface CalmArchitecture {
  nodes: CalmNode[];
  relationships: CalmRelationship[];
}
