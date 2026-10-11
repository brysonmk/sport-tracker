# Decisions

Every non-obvious choice made while building Sports Tracker, with the reason.
Newest entries go at the bottom of each section. If you disagree with one, change it
and note why here.

## Owner answers (asked once, 2026-10-10; not to be asked again)

| # | Question | Answer |
|---|----------|--------|
| 1 | Which sport? | **Soccer** |
| 2 | Is there a real group that could use it? | **No real group yet.** Build for a generic rec/pickup league; real feedback comes later. |
| 3 | Will you create Vercel and Neon accounts when needed? | **Yes.** Exact steps will be given at M4; secrets go in `.env` / Vercel settings by the owner. |

Consequences:
- Soccer means a match event is a goal (optionally with an assist), and standings use
  3 points for a win, 1 for a draw, 0 for a loss.
- No real group means no real names anywhere: all seed data is invented and labelled as
  demo data.

## Process

- **Repo location.** The session started in an unrelated folder, so the repo was cloned to
  `~/Developer/sport-tracker` (owner chose this). All work happens there.
- **No AI co-author trailers in commits or PR bodies.** The owner asked for no
  Co-Authored-By trailer on commits in other repos ("for all future commits"), so commits
  here follow the same rule. The README's "How it was built" section is where the build
  process is described, because the brief asks for it.
