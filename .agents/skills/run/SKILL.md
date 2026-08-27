---
name: run
description: Workflow for building, validating, and running the Formula 1 Management Simulator locally with full production bundle and SOP compliance checks.
---

# Formula 1 Application Run Workflow (`/run`)

This workflow defines the standard operational procedure when executing `/run` to compile, validate, and launch the Formula 1 application.

## Execution Sequence

When the user triggers `/run`, execute the following phases in order:

### 1. Build Verification

Execute a clean TypeScript build and Vite production bundle:

```bash
npm run build
```

- Compiles all TypeScript files via `tsc -b`.
- Builds optimized chunks into `/docs` (GitHub Pages distribution target).
- Ensures zero compile errors.

### 2. Governance & SOP Audit

Run the automated SOP validator:

```bash
npm run sop:validate
```

- Validates `.master/` documentation files (`MasterChangeLog.md`, `TroubleshootingLog.md`, `IdeasLog.md`, `FileManifest.md`, `SOP.md`).
- Confirms zero broken links or missing inventory.

### 3. Linting Check

Run ESLint to verify code quality:

```bash
npm run lint
```

### 4. Local Execution & Preview

Launch the Vite preview or development server:

```bash
npm run preview
```

or for live hot-reload development:

```bash
npm run dev
```

### 5. Git Synchronization (When Requested)

When the user asks to update the repository after running:

1. Check modified files: `git status`
2. Stage changes: `git add .`
3. Commit with semantic message: `git commit -m "..."`
4. Push to remote: `git push`
