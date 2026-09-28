# Ednovate Labs — prototype

An interactive prototype of **Ednovate Labs**, an edtech platform for The Gambia and the wider ECOWAS region. It pairs an AI career counsellor with hybrid courses, a verified skills passport, and direct employer connections — so learners get a real path, and educators get the data to close real gaps.

This started as a Claude artifact that was a landing page and a login modal. The five steps of the journey were named there but not built; this repository builds them.

It runs two ways from the same code. With no configuration, everything lives in `src/lib/data.ts` and a persisted browser store, so the prototype can be handed to someone with a single URL. Add Supabase credentials and the same screens read and write real Postgres rows and Storage objects — see [Connecting Supabase](#connecting-supabase).

## Running it locally

```bash
npm install
npm run dev
```

The dev server is configured in `package.json` and defaults to Next.js' port. To use the uncommon port this project was developed against:

```bash
npm run dev -- --port 43127
```

Then open [http://localhost:43127](http://localhost:43127).

## Signing in

The login is illustrative and the credentials are pre-filled, so you can press **Log in** without typing anything.

| Role | Username | Password |
| --- | --- | --- |
| Student | `student` | `student2026` |
| Educator | `educator` | `educator2026`  |

You can also skip the login entirely with a deep link, which is useful when sharing a specific screen:

- `/student?demo=student`
- `/educator?demo=educator`

**Reset the demo data** in the sidebar puts every course, submission and match back to its starting state.

## Connecting Supabase

Optional. Skip it and the app keeps working entirely in the browser; the profile page says which mode it is in.

1. Create a free project at [supabase.com](https://supabase.com).
2. Open the SQL editor and run [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql). It creates the tables, row level security policies, the two storage buckets and a trigger that gives every new sign-up a profile and a passport ID.
3. Copy `.env.example` to `.env.local` and fill in the project URL and anon key from **Project Settings → API**.
4. Restart `npm run dev`.

Both values are meant to reach the browser. Row level security is what protects the data: a learner can only read and write their own rows and their own files, and an educator — a profile with `role = 'educator'` — gets read access across the cohort plus the ability to update review fields on a passport entry.

### What is stored where

| Table | Holds |
| --- | --- |
| `profiles` | One row per auth user: name, headline, cohort, location, passport ID, avatar path |
| `enrollments` | Course, delivery mode and progress per learner |
| `compass_results` | The Career Compass recommendation and the answers behind it |
| `passport_entries` | Competencies, submitted evidence, verification state and reviewer feedback |
| `evidence_files` | A record per uploaded artefact, pointing at its Storage object |
| `applications` | Employer introductions and their stage |

| Bucket | Visibility | Limit |
| --- | --- | --- |
| `avatars` | Public, so an `<img>` needs no signed URL | 2 MB, images only |
| `evidence` | Private; the app mints one-hour signed URLs | 25 MB |

Both buckets are keyed by `<user-id>/…`, which is what makes ownership a path check in the storage policies.

### How the two modes fit together

`src/lib/backend/` is the seam. `local.ts` keeps state, the profile and uploaded files in `localStorage`, downscaling avatars so they fit the quota. `supabase.ts` talks to Postgres and Storage. `index.ts` picks one from the environment, and a Supabase call that fails — offline, expired session, missing bucket — falls back to the browser copy rather than losing a click.

## What is in it

### Student journey

| Route | What it does |
| --- | --- |
| `/student` | Progress across the five-step path, current course, passport summary and a context-aware next action |
| `/student/compass` | **Career Compass** — a counsellor that asks five questions, reflects on each answer, then recommends a track and a first course with its reasoning and one question to sit with |
| `/student/studio` | **Learning Studio** — nine courses, searchable and filterable by track and delivery mode |
| `/student/studio/[slug]` | Course syllabus, mastery-tracked modules, delivery-mode choice and enrolment |
| `/student/passport` | **Skills Passport** — verified competencies with their artefacts, evidence submission with real file uploads, and a toggle showing exactly what an employer sees |
| `/student/bridge` | **Talent Bridge** — employer matches scored against verified competencies, each with the reason it was made and what is still missing |
| `/student/profile` | Profile picture upload and the learner's own file library |

### Educator workspace

| Route | What it does |
| --- | --- |
| `/educator` | Queue depth, learners needing a conversation, and the widest regional gaps |
| `/educator/roster` | Every learner's mastery progress, passport state and automatic risk flag |
| `/educator/evidence` | **Evidence queue** — the published rubric, an AI-drafted response you edit, and a verify-or-return decision that a named human makes |
| `/educator/intelligence` | **Regional Intelligence** — verified supply against open roles by skill, the unmet-role trend, delivery-mode split, and a sortable country table across 12 ECOWAS countries |

### Design decisions worth knowing

- **Mastery, not attendance.** A module closes when a competency is demonstrated. Nothing is awarded for time served.
- **The AI asks, it does not decide.** Career Compass explains its reasoning and ends on a question. Feedback is AI-drafted but a tutor edits and sends it, and no competency is ever verified automatically.
- **One record that compounds.** The Skills Passport carries across courses rather than resetting, and employers only ever see verified entries.

### Interface conventions

- **One typeface, one accent.** Inter throughout. A neutral `ink` scale carries text, borders and surfaces. Google Blue is the brand: `blue-600` for controls, selected states and progress, `blue-950` for large dark surfaces like the sidebar and the passport header. Gold marks a single accent per view. Status is limited to three quiet tones — verified, in review, not started.
- **Say it once.** Pages lead with a title and the content itself. No kicker labels above headings, no explanatory paragraph under them, and no caption under a number that the label already explains.
- **Panels over boxes.** A `Panel` is a hairline border, a header row and a divided body. Cards are not nested inside cards, and stats sit in one divided strip rather than a row of separate tiles.
- **Everything clickable looks it.** Buttons carry hover, active and `focus-visible` states from one variant set instead of per-page classes; catalogue and list rows are whole-target links.

## Stack

- Next.js 16 (App Router) and React 19
- TypeScript, Tailwind CSS v4
- shadcn/ui on Base UI primitives
- Recharts for the regional dashboards
- lucide-react icons, sonner for toasts

## Layout

```
src/
  app/                      routes; layouts gate on the demo session
  components/
    landing/                the public overview page
    app/                    the signed-in shell and its primitives
      student/              Compass, Studio, Passport, Bridge
      educator/             roster, evidence queue, regional dashboards
    ui/                     shadcn/ui primitives
  lib/
    data.ts                 all demo data: courses, learners, employers, regional figures
    compass.ts              the counsellor's questions, reflections and recommendation logic
    platform-store.tsx      the client store behind every interaction
    backend/                local vs. Supabase persistence, chosen from the environment
    supabase/               clients, config detection and the database types
supabase/migrations/        the schema, policies and storage buckets
scripts/                    local screenshot and console-capture helpers
```

## Checks

```bash
npx tsc --noEmit    # types
npx eslint src      # lint
npm run build       # production build; every route prerenders statically
```

## A note on the data

Every course, learner, tutor, employer, salary and country figure in this repository is invented for the prototype. The employer names are fictional. The ECOWAS statistics are illustrative and are not real regional data. The prototype says so on screen wherever a number might be mistaken for a record.
