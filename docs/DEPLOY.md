# Deploying to Vercel + Neon

Both have free plans that are enough for this app; no payment details are needed.
You only do the account steps once. After that, every push to `main` deploys
automatically and every pull request gets a preview URL.

How the build works: Vercel runs `npm install` (which runs `prisma generate`), then the
`vercel-build` script: `prisma migrate deploy && next build`. So database migrations are
applied on every deploy, before the new code goes live.

## Steps (about 5 minutes)

1. **Create a Vercel account.** Go to <https://vercel.com/signup> and choose
   *Continue with GitHub* (use the account that owns `brysonmk/sport-tracker`).
2. **Import the repo.** In the Vercel dashboard: *Add New… → Project → Import* next to
   `sport-tracker` (if it isn't listed, click *Adjust GitHub App Permissions* and give
   Vercel access to that repo). Leave every setting at its default (Framework: Next.js)
   and click *Deploy*. **This first deploy will fail** because there is no database
   yet. That's expected.
3. **Create the Neon database from inside Vercel.** Open the project → *Storage* tab →
   *Create Database* → *Neon* (Serverless Postgres) → accept, which creates your Neon
   account and links it to Vercel. Pick the region closest to your players (for Ottawa:
   *US East / Washington, D.C.*), plan *Free*. On the next screen keep all environments
   (Development, Preview, Production) ticked and click *Connect*.
   Vercel now stores the connection strings as environment variables
   (`DATABASE_URL`, `DATABASE_URL_UNPOOLED`, …). You never have to copy them.
4. **Redeploy.** *Deployments* tab → the failed deployment → *⋯ → Redeploy*. The build
   log should show `prisma migrate deploy` applying the migrations, then the Next.js
   build. When it says *Ready*, click *Visit*.
5. **Tell me the URL** (e.g. `https://sport-tracker-xyz.vercel.app`). It isn't a secret.
   I'll add it to the README and check the deployed app.

Optional:
- **Nicer domain**: project → *Settings → Domains* → edit the `.vercel.app` name.
- **Demo league in production** (makes the "See a demo league" button appear): in the
  Vercel project → *Storage* → your database → *Show secret* / *.env.local* tab, copy the
  `DATABASE_URL_UNPOOLED` value into a new local file `.env.neon` as
  `DATABASE_URL="…"` (`.env*` files are gitignored), then run:

  ```bash
  npx tsx --env-file=.env.neon prisma/seed.ts
  ```

  Delete `.env.neon` afterwards if you like. The seed prints the demo admin link.

## Manual setup (without the Vercel integration)

If you create the Neon project at <https://console.neon.tech> yourself instead: in
Vercel → *Settings → Environment Variables*, add `DATABASE_URL` = Neon's **pooled**
connection string and `DIRECT_URL` = the **direct** (non-pooled) one, for all
environments. Then redeploy.

## Environment variables

| Variable | Where | Purpose |
|---|---|---|
| `DATABASE_URL` | Vercel (set by the Neon integration) | Pooled connection used by the app |
| `DATABASE_URL_UNPOOLED` or `DIRECT_URL` | Vercel | Direct connection used by migrations |
| `APP_URL` | optional | Absolute base URL for share images. If unset, Vercel's production domain is used |
