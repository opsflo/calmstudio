<!-- SPDX-FileCopyrightText: 2024 CalmStudio contributors - see NOTICE file -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# CalmStudio

**Architecture diagrams as code** — draw visually, get validated CALM JSON automatically.

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![FINOS](https://img.shields.io/badge/FINOS-active-green.svg)](https://finos.org)
[![REUSE](https://img.shields.io/badge/REUSE-compliant-green.svg)](https://reuse.software/)

## What is CalmStudio?

CalmStudio is a visual-first architecture diagramming tool that generates
[CALM (Common Architecture Language Model)](https://calm.finos.org) code. Built
with Svelte 5 and Svelte Flow, it combines an intuitive drag-and-drop canvas
with a Mermaid-like DSL called **calmscript**, an MCP server for AI integration,
and extension packs for cloud providers (AWS, GCP, Azure), Kubernetes, AI/Agentic
systems, and more.

## Quick Start

### Prerequisites

- Node.js >= 20
- pnpm >= 9 (`npm install -g pnpm`)

### Installation

```bash
git clone https://github.com/finos/calmstudio.git
cd calmstudio
pnpm install
```

### Development

```bash
pnpm build       # Build all packages
pnpm test        # Run all tests
pnpm typecheck   # TypeScript type check
pnpm lint        # Lint all packages
```

## Project Structure

```
calmstudio/
├── apps/
│   └── studio/          # SvelteKit web app
├── packages/
│   ├── calm-core/       # CALM types and validation
│   ├── calmscript/      # DSL parser and compiler
│   ├── mcp-server/      # MCP server for AI integration
│   └── extensions/      # Extension pack system
├── CONTRIBUTING.md      # How to contribute
├── CODE_OF_CONDUCT.md   # Community standards
├── SECURITY.md          # Vulnerability reporting
├── MAINTAINERS.md       # Project governance
└── NOTICE               # Attribution
```

## Contributing

We welcome contributions! Please read our [Contributing Guide](CONTRIBUTING.md)
for details on:

- Fork and pull request workflow
- DCO sign-off requirements
- Conventional commit format
- Local development setup

## Community

- [Code of Conduct](CODE_OF_CONDUCT.md) — Contributor Covenant v2.1
- [Security Policy](SECURITY.md) — Vulnerability disclosure via GitHub Security Advisories
- [Maintainers](MAINTAINERS.md) — Project governance and maintainer list
- [NOTICE](NOTICE) — Third-party attribution

## License

Copyright 2024-2025 CalmStudio contributors — see [NOTICE](NOTICE).

Distributed under the [Apache License, Version 2.0](LICENSE).

See [SPDX](https://spdx.dev/) headers in each file for per-file licensing.
