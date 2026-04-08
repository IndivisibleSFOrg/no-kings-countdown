# Good Trouble Daily

**[goodtroubledaily.org](https://goodtroubledaily.org)** — A daily civic action calendar that helps people build a lasting habit of resistance. Incubated in [Indivisible SF](https://indivisiblesf.org/) and built by volunteers.

One action, completable in under 15 minutes, every day: calling a representative, sharing a message, supporting an organization, or showing up locally. Progress is tracked privately in your browser — nothing is sent to any server.

## What Kinds of Actions are Available?

- **Completable in under 15 minutes** — no lengthy commitments or sign-ups required
- **Concrete and specific** — a clear task with a defined end state ("call your senator about X", not "get involved")
- **Broadly accessible** — relevant to people across the US, requiring no special skills, background, or prior experience with activism
- **Tied to the resistance** — focused on democratic norms, anti-authoritarianism, or civic engagement
- **Varied in type** — contacting representatives, sharing on social media, showing up locally, supporting organizations

## For Developers

**Stack:** Vue 3 · Nuxt 3 (static generation) · Tailwind CSS  
**Issues:** [GitHub Issues](https://github.com/IndivisibleSFOrg/good-trouble-daily/issues)

### How It Works

- Action data lives in a Google Sheet published as a CSV; the app fetches and caches it for 10 minutes
- Completion state is stored in `localStorage` under `isf-completed-actions` (a JSON array of `YYYY-MM-DD` strings)
- Statically generated and deployed to Vercel — no backend, no database

### Setup

```bash
pnpm install      # install dependencies
pnpm dev          # start dev server at http://localhost:3000
pnpm generate     # build static site
pnpm preview      # preview production build
pnpm typecheck    # type-check with vue-tsc
pnpm lint         # ESLint check
pnpm lint:fix     # ESLint auto-fix
pnpm lint:css     # Stylelint check
pnpm lint:css:fix # Stylelint auto-fix
```

### Deployment

All deployments run via GitHub Actions (Vercel's native GitHub integration is disabled). Each branch and tag pattern maps to a distinct Vercel deployment:

| Trigger | Deployed to |
| --- | --- |
| Push of tag matching `2.*.*` | `goodtroubledaily.org` (Vercel production) |
| Push to `main` | `preview.goodtroubledaily.org` |
| Push of tag matching `1.*.*` | `nokingscountdown.org` |
| Push to `no-kings-countdown` | `preview.nokingscountdown.org` |
| PR opened / synchronized | ephemeral preview URL (posted as PR comment) |

### Contributing Code

1. Fork the repo and create a feature branch
2. Reference the relevant GitHub issue in your branch name or commit message
3. Before opening for review, ensure `pnpm typecheck`, `pnpm generate`, and pre-commit hooks all pass
4. Open a pull request against `main`

## Contributing Actions

We welcome action suggestions for this and future campaigns. [Submit an action idea →](https://forms.gle/2Zic21S9eiaLqVPR7)

Actions should meet the criteria listed above. We review all submissions and may follow up with questions.

## License

MIT
