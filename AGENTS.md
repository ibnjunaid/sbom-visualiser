# Architecture Overview: SBOMScope

This document outlines the architectural decisions and data flow for the SBOMScope visualizer.

## Core Layers

### 1. Parser Layer (`src/parsers/`)
Responsible for detecting and parsing various SBOM formats.
- **Auto-detection**: The index dispatcher iterates through registered parsers to find one that can handle the file content.
- **Normalization**: Each parser maps the format-specific schema (SPDX 2.x, 3.0, CycloneDX) into a single internal **Normalized Data Model**.
- **Error Handling**: Specific parse errors (missing fields, malformed JSON/XML) are captured and reported to the UI.

### 2. Normalized Model (`src/models/sbom.ts`)
A unified TypeScript interface that represents an SBOM regardless of its original format.
- **Metadata**: Format, version, tool, timestamp.
- **Components**: Name, version, PURL, licenses (distinguishing declared vs concluded), supplier.
- **Relationships**: A flat array of source-target-type edges used for graph construction.
- **Vulnerabilities**: Embedded security data associated with components.

### 3. UI Components (`src/components/`)
React components that consume the normalized model.
- **DependencyGraph**: Uses **Cytoscape.js** for high-performance node rendering. Supports hierarchical and force-directed layouts.
- **ComponentTable**: Filterable and sortable view of all packages.
- **LicenseView**: Aggregates license data for compliance overviews.

### 4. Web Worker Layer (`src/workers/`)
To prevent blocking the main thread during large file parsing, all parsing logic is encapsulated in `sbom.worker.ts`.

## Performance Considerations
- **Cytoscape.js**: Chosen for its ability to handle hundreds of nodes efficiently and its support for complex layouts.
- **Canvas over SVG**: Cytoscape uses Canvas for rendering, which is significantly more performant than DOM/SVG for large graphs (500+ nodes).

## Deployment
- **GitHub Pages**: Fully static build. Deployed via GitHub Actions (`.github/workflows/deploy.yml`).
- **Offline-ready**: Built to work as a static bundle; no external API calls or backend required.
