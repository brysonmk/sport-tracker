# Sports Tracker

A soccer league tracker for rec and pickup groups. Create a league without signing up,
record matches (score, scorers, assists), and everyone gets standings, player stats and
live scores on their phone.

> Status: under construction. See [docs/PROGRESS.md](docs/PROGRESS.md).

## Local setup

Requirements: Node 24 (see `.nvmrc`), Docker.

```bash
npm install                 # also generates the Prisma client
cp .env.example .env        # local defaults work as-is
docker compose up -d        # Postgres 17 on localhost:5433
npm run db:migrate          # apply migrations
npm run db:seed             # demo league; prints its public and admin links
npm run dev                 # http://localhost:3000
```

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | Generate route types, then `tsc --noEmit` |
| `npm test` | Vitest unit tests (`npm run test:watch` to watch) |
| `npm run db:migrate` | Create/apply Prisma migrations in development |
| `npm run db:seed` | Replace the demo league |
| `npm run db:reset` | Drop the local database, re-apply migrations, re-seed |

## Docs

- [docs/PLAN.md](docs/PLAN.md): architecture and milestones
- [docs/DECISIONS.md](docs/DECISIONS.md): every choice and why
- [docs/PROGRESS.md](docs/PROGRESS.md): done / in progress / next

## How it was built

Built by an AI coding agent (Claude Code) working from the brief in
[CLAUDE.md](CLAUDE.md), in small commits with one pull request per milestone. Each
choice and its reason is logged in [docs/DECISIONS.md](docs/DECISIONS.md), and CI checks
lint, types, unit tests, migrations and the build on every pull request.
