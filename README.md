# SBOMScope

A fully static, client-side SBOM (Software Bill of Materials) visualizer.

## Features

- **100% Client-Side**: No data leaves your browser. No backend, no APIs, no tracking.
- **Multi-format Support**:
  - **CycloneDX**: JSON and XML (v1.4, v1.5, v1.6)
  - **SPDX**: JSON, YAML, and Tag-Value (v2.2, v2.3)
  - **SPDX 3.0**: JSON-LD support (Core Software Profile)
- **Interactive Visualization**:
  - Searchable and sortable component inventory.
  - Interactive dependency graph using Cytoscape.js.
  - License distribution and aggregate view.
  - Embedded vulnerability display.
- **Large File Handling**: Parsing is performed in a Web Worker to keep the UI responsive.
- **Export**: Export normalized SBOM data to JSON or CSV.

## Tech Stack

- **React 19** + **TypeScript**
- **Vite** (Build tool)
- **Tailwind CSS 4** (Styling)
- **Cytoscape.js** (Graph visualization)
- **Lucide React** (Icons)
- **Vitest** (Testing)

## Getting Started

### Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:5173](http://localhost:5173) in your browser.

### Running Tests

```bash
npm test
```

### Building for Production

```bash
npm run build
```

## Deployment

The project is configured for GitHub Pages via GitHub Actions. Any push to the `main` branch will trigger a build and deploy.

## Architecture

See [AGENTS.md](./AGENTS.md) for a detailed overview of the project architecture and data flow.
