# AWS POCs Monorepo - Code Guidelines

## Language Requirements

### TypeScript Only
**All code in this project MUST be written in TypeScript (.ts/.tsx files).**

- No JavaScript files (.js/.jsx) are permitted in the source code
- Use `.ts` for general code and `.tsx` for React components
- All project configurations (vite.config.ts, etc.) must be TypeScript
- Build outputs may be JavaScript, but source code is always TypeScript

## TypeScript Configuration

### Compiler Settings
- Target: ES2020
- Module: ESNext
- ModuleResolution: bundler
- Strict mode enabled
- TypeScript version: ^5.3.0

### Import Rules
- Use TypeScript paths for imports without file extensions (e.g., `from '../lib/stack'`)
- Do NOT use `.js` extensions in import statements
- Use relative paths for local imports

## CDK Projects

### Entry Point
- Use `tsx` (not `ts-node`) as the TypeScript runtime for CDK applications
- The `cdk.json` file references: `npx tsx cdk/bin/app.ts`

### Stack Structure
```
cdk/
  bin/
    app.ts           # Entry point - instantiates stacks
  lib/
    *.ts            # Stack and construct definitions
    index.ts        # Exports public interfaces
```

### Best Practices
- Export public interfaces and classes from `lib/index.ts`
- Use proper typing for all CDK props interfaces
- Include stack outputs for important values (bucket names, URLs, etc.)
- Use L2/L3 constructs instead of L1 (Cfn*) when possible

## Monorepo Structure

- Uses pnpm workspaces for dependency management
- Each project is self-contained with its own package.json
- Shared dev dependencies in root package.json

## Development Commands

```bash
# Build all projects
pnpm build

# CDK operations (run from project root)
pnpm cdk:synth   # Synthesize CloudFormation template
pnpm cdk:deploy  # Deploy to AWS
pnpm cdk:diff    # See pending changes
pnpm cdk:destroy # Tear down stack
```
