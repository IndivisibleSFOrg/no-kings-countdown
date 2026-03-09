# Contributing

## GitHub Issues & PR Workflow

### Issue-Driven Development
- All feature and bug fix work MUST be tied to a GitHub issue. If no issue exists for the requested work, create one before beginning.
- Each issue and PR should be as small as reasonable while still delivering discrete value — a working feature, a meaningful risk reduction, a self-contained refactor. If implementation reveals a second distinct problem worth fixing, open a new issue rather than expanding the current scope.
- Before starting work on an issue, the contributor MUST:
  1. Scan open GitHub issues for explicit prerequisites and topically related work in the same component area, label, or milestone. Raise any concerns about order of operations or opportunities to consolidate effort before proceeding.
  2. Read the issue and any linked issues, documents, or prior PRs
  3. Identify and surface any ambiguities before planning
  4. Present a concise implementation plan (affected files, approach, any tradeoffs)
  5. Wait for explicit approval before writing any code

### Branching
- All work happens in a feature branch, never directly on `main`
- Branch names follow the pattern `{issue-number}-{short-kebab-description}` (e.g., `57-analytics-provider-layer`)
- Branch is created from the latest `main` before starting work
- After creating the branch, run `gh issue develop <number> --name <branch-name>` to link the branch to the issue in GitHub's Development sidebar
- If `main` advances while the branch is in progress, rebase the branch onto the latest `main` before opening the PR for merge

### Commits
- Commits to the feature branch may be made freely as work progresses
- No contributor may commit directly to `main` without explicit maintainer instruction
- Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/) format: `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `test:`, etc. (e.g., `feat: add PostHog provider adapter`)
- If the reason for a change is not self-evident from the diff, include a commit message body explaining the rationale
- Temporary debug code (console.log, test flags, etc.) MUST be removed before the final commit

### Pull Requests
- Open a **draft PR** immediately when the branch is created, before implementation begins. This surfaces in-progress work and establishes the branch→PR→issue chain early.
- Post a comment on the issue if a significant decision point is reached, a constraint not in the plan is discovered, or the approach changes from what was approved. The issue thread is the record of *why* the implementation looks the way it does.
- Before converting from draft to ready-for-review, ALL of the following must pass:
  - Pre-commit hooks
  - Type check (`pnpm typecheck`)
  - Production build (`pnpm generate`)
- Convert to ready-for-review only when all checks pass and debug code is removed
- PR description MUST include:
  - `Closes #<issue-number>` (auto-closes the issue on merge)
  - Summary of changes
  - Testing notes
- A review must be requested and acknowledged before merging. In a solo workflow this step may be waived explicitly, but it must not be silently skipped.
- **Merges require explicit maintainer authorization.** Approval of the work ("looks good", "nice work") does not constitute merge authorization. Merge authorization must be unambiguous: *"merge it"*, *"go ahead and merge"*, *"merge and close"*, *"approved, merge"*, or equivalent.

### Merging
- The author MAY optionally clean up branch commits via interactive rebase and force push before the merge. This is entirely optional.
- Merge using a **merge commit** (`gh pr merge --merge`). Never use GitHub's squash merge button (it misattributes commits to the merger) or the rebase merge button.
- After merge, delete the feature branch and confirm the issue is closed
- **Post-merge**: confirm CI passes on `main`. If it fails, a direct hotfix commit to `main` is permitted without a new branch or PR — this is the only exception to the no-commits-to-main rule. Note the hotfix in a comment on the original issue.


### Command Line Interactions for Agents
- gh is generally available and logged in. If it isn't, alert and stop.
- When interacting with command line tools, consider whether command line arguments are likely to be mangled by the shell; use here docs when available and particularly for message bodies.
- Some commands invoke pagers automatically (e.g., gh); consider invoking without paging or piping to cat

## Code Style

Config: `eslint.config.ts` using [`@antfu/eslint-config`](https://github.com/antfu/eslint-config).

- **Vue SFC block order:** `<template>` → `<script>` → `<style>` (enforced by lint)
- **Indent:** 2 spaces · **Quotes:** single · **Semicolons:** none
- `ts/no-unsafe-assignment` is disabled — `JSON.parse` and `localStorage` patterns are acceptable
- `node/prefer-global/process` is disabled — `process.env` is idiomatic in Nuxt configs