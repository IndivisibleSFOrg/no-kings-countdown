# DR-0003 — Branching and Deployment Strategy

**Status:** Accepted (amended 2026-04-07)
**Date:** 2026-03-13
**Amended:** 2026-04-07
**Deciders:** Reece

---

## Context

The project is a statically generated Nuxt site. As of the 2026-04-07 amendment, the repo hosts two civic-action sites from a single codebase, each on its own long-lived branch and deployed to its own domain.

### Deployment targets

| Branch | Domain | Purpose |
| --- | --- | --- |
| `main` (production) | `goodtroubledaily.org` | Good Trouble Daily — production site; updated on `2.x.y` release tags |
| `main` (integration) | `main.goodtroubledaily.org` | Reflects current state of `main`; used for review before tagging |
| `no-kings-countdown` | `nokingscountdown.org` | No Kings Countdown — historical archive; tracks the branch head |
| PR previews | ephemeral URL | Per-PR preview; URL posted as PR comment |

### Branching model

The repo has two long-lived branches:

- **`main`** — active development branch for the Good Trouble Daily platform. Short-lived feature branches are cut from `main`, named `{type}/{issue-number}-{short-kebab-description}`, and merged back via merge commit.
- **`no-kings-countdown`** — historical archive branch for the No Kings Countdown site. Accepts only bug fixes and minor content updates. Every push to this branch updates `nokingscountdown.org` directly; there is no separate tag-triggered deploy.

### Tag versioning

Tags serve two distinct purposes:

1. **GTD release tags** (`2.x.y`, `3.x.y`, …) — mark a production release of Good Trouble Daily; drive the in-app `appVersion` via `git describe`, populate `releaseVersionIndex` via `git for-each-ref`, and trigger the Vercel production deploy to `goodtroubledaily.org`. Major version 2 onwards.
2. **NKC tags** (`1.x.y`) — historical release markers on the `no-kings-countdown` branch. Used for version metadata only; do not trigger any deploy workflow.
3. **Non-semver tags** — used for other product surfaces such as in-app feature tour anchors; these must never trigger a production deploy.

The production tag pattern `2.*.*` (glob) matches only major-version-2-and-above tags, ensuring `1.x.y` NKC tags never trigger a GTD production deploy.

### Vercel project — single project, two roles

Both sites share one Vercel project. Only `2.x.y`-tagged releases on `main` occupy the Vercel "production" slot, which maps to `goodtroubledaily.org` via the project's production domain assignment. `nokingscountdown.org` is routed via `vercel alias set` from the `no-kings-countdown` branch workflow, and requires only SSL provisioning in the project's domain list.

The consequence: `nokingscountdown.org` always uses Vercel's Preview-tier environment variables. This is acceptable — the NKC site is a historical archive and its production configuration is static.

### The Vercel integration problem

Vercel's native GitHub integration is branch-based. It has no first-class understanding of tags. The only available workaround — an "Ignored Build Step" shell script configured in the Vercel dashboard — can be made to work, but it places critical deploy logic in an invisible UI text field outside version control. That is not acceptable.

### Build environment constraint

The Nuxt build resolves two pieces of version metadata at build time using git commands:

- `git describe --always --tags` for `appVersion`
- `git for-each-ref refs/tags` to build `releaseVersionIndex`

Both require a full git history with all tags present. Vercel's own build environment does not guarantee access to git tags. All deploy workflows therefore run the build on the GitHub Actions runner — using `vercel build` (which invokes `pnpm generate`) with `fetch-depth: 0` and `fetch-tags: true` — and upload the pre-built output to Vercel with `vercel deploy --prebuilt`. Vercel does no rebuilding of its own.

---

## Decision

Disable Vercel's native GitHub integration entirely (`"github": { "enabled": false }` in `vercel.json`) and drive all deployments from GitHub Actions.

### Workflows

| Workflow | Trigger | Target | Deployed to |
| --- | --- | --- | --- |
| `deploy-production.yml` | Push of tag matching `2.*.*` | Vercel production | `goodtroubledaily.org` |
| `deploy-main.yml` | Push to `main` | Vercel preview, aliased | `main.goodtroubledaily.org` |
| `deploy-nkc-branch.yml` | Push to `no-kings-countdown` | Vercel preview, aliased | `nokingscountdown.org` |
| `deploy-preview.yml` | PR opened, synchronized, or reopened | Vercel preview | ephemeral URL (posted as PR comment) |

The production workflow uses `vercel deploy --prebuilt --prod`; the others use `vercel deploy --prebuilt` (preview environment). The branch workflows additionally run `vercel alias set` to pin each deployment to its stable domain.

Non-semver tags and `1.x.y` NKC tags do not trigger a production deploy.

### GitHub Pages

`nuxtjs_deploy.yml` (GitHub Pages) is disabled. Vercel is the sole production host as of the 1.4.0 release (2026-03-13).

### Secrets required

All Vercel workflows depend on three repository secrets:

- `VERCEL_TOKEN` — API token for the Vercel CLI
- `VERCEL_ORG_ID` — Vercel organization ID
- `VERCEL_PROJECT_ID` — Vercel project ID (single project serves both branches)
