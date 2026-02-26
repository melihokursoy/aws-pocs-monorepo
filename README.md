# AWS Training POCs Monorepo

A monorepo for AWS training proof of concepts using pnpm workspaces.

## Project Structure

```
aws-pocs-monorepo/
├── projects/
│   ├── project-1/
│   ├── project-2/
│   └── ...
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 22+ (for TypeScript/Node.js projects)
- pnpm 8+ (`npm install -g pnpm`)

### Installation

```bash
pnpm install
```

## Creating a New Project

1. Create a new folder under `projects/`:
   ```bash
   mkdir projects/my-new-poc
   cd projects/my-new-poc
   ```

2. Initialize a new package:
   ```bash
   pnpm init
   ```

3. Create your project structure and add dependencies as needed.

## Available Commands

Run from the monorepo root:

- `pnpm dev` - Run dev servers in all projects (parallel)
- `pnpm build` - Build all projects
- `pnpm test` - Run tests in all projects
- `pnpm lint` - Lint all projects

## Working with Individual Projects

To work on a specific project:

```bash
cd projects/my-project
pnpm install
pnpm dev
```

Or run commands from the root:

```bash
pnpm -r --filter my-project dev
pnpm -r --filter @aws-pocs/my-project dev
```

## AWS Resources

Each POC should document:
- The AWS services being used
- Architecture overview
- Deployment instructions
- Clean-up instructions

## Dependencies

Shared dependencies are defined in the root `package.json` and installed via pnpm workspaces.

To add a package to a specific project:

```bash
cd projects/my-project
pnpm add <package-name>
```

To add a dev dependency:

```bash
pnpm add -D <package-name>
```
