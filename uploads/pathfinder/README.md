# Pathfinder

A weekly job-search agent for students. Fewer, better, you decide.

This is the runnable web app: real accounts (email + password), onboarding, the weekly report with per-job Focus / Assist / Managed modes, the job workspace with story-cited materials, a tracker, the vault and settings — all on the **Pathfinder Design System** (Broadsheet base + Pathfinder semantic layer).

## Run it

```bash
npm install        # or pnpm install
npm run dev        # http://localhost:3000
```

That's it. Accounts and data live in a local SQLite file at `data/pathfinder.db` (created on first run). Sign up, finish the three onboarding steps, and your first report is generated from 20 seeded postings.

For production: copy `.env.example` to `.env` and set a long random `SESSION_SECRET`.

## Where things are

| Path | What |
| --- | --- |
| `styles/tokens.css` | Design tokens (light on `:root`, dark under `[data-theme="dark"]` and `prefers-color-scheme`). Generated from the design system's `tokens.json`. |
| `styles/bundle.css` | Component classes (`.pf-mode`, `.pf-reason`, `.pf-job`, `.pf-story`, `.pf-para`, `.btn`, `.tag`, `.card`, …). Copied from the design system. |
| `styles/app.css` | Page layout only. Every color/size/radius is a `var(--…)`. |
| `components/ui.tsx` | The signature components as React: `ModeSwitch`, `ReasonTag`, `DeadlineBadge`, `MatchRing`, `Tag`, `StoryChip`, `StateCard`. Same class names and `data-*` attributes as the design system, so the CSS applies unchanged. |
| `components/ReportView.tsx` | Weekly report: list + detail panel (bottom sheet on mobile), filters, keyboard `J/K 1 2 S ?`. |
| `components/Workspace.tsx` | Job workspace: Strategy / Materials / Submit / Activity. Uncited paragraphs get the amber underline and block submit. |
| `components/TrackerView.tsx` | Kanban (drag between columns) + table. |
| `components/Onboarding.tsx`, `VaultView.tsx` | Directions → résumés → stories; the vault edits the same data. |
| `app/(auth)/*` | Sign-up, sign-in, sign-out (server actions, bcrypt, signed cookie). |
| `app/(app)/actions.ts` | Every write: decide a mode, regenerate, save materials, statuses, settings. |
| `lib/db.ts` | SQLite schema (created on boot). |
| `lib/report.ts` | The pipeline, mocked: scoring, reason tags, report generation, materials drafting. **Replace these functions with the worker + LLM calls** — the UI won't change. |
| `lib/seed.ts` | 20 example postings and the default directions. |
| `middleware.ts` | Redirects signed-out users to `/login`. |

## Editing the UI

- Colors, spacing, radii: change the token in the design system, regenerate `tokens.css` (or edit `tokens.css` directly for a quick try).
- A component's look: `styles/bundle.css` (keep the class names).
- A screen's layout: `styles/app.css` + the component file.
- Copy and labels: in the component files; the reason-tag labels are in `components/ui.tsx` (`REASON_LABEL`).

## What is mocked (and where the real thing goes)

| Mocked now | Real version |
| --- | --- |
| `lib/seed.ts` postings | Worker fetching Greenhouse / Lever / Ashby JSON + school packs |
| `generateReport()` rule-based score + tags | Embeddings + Claude rerank |
| `ensureMaterials()` paragraph assembly | Claude drafting from the Story Bank, with `storyIds` citations |
| Résumé "summary" text box | PDF upload + parsing |
| "Autofill with extension" (disabled) | Browser extension, Phase 2 |
| Managed mode (locked) | Playwright submit on Greenhouse / Lever / Ashby, Phase 3 |
| SQLite | Supabase Postgres (swap `lib/db.ts`, keep the queries) |
