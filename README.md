# Ednovate Labs — prototype

An interactive prototype of **Ednovate Labs**, an edtech platform for The Gambia and the wider ECOWAS region. It pairs an AI career counsellor with hybrid courses, a verified skills passport, and direct employer connections — so learners get a real path, and educators get the data to close real gaps.

This started as a Claude artifact that was a landing page and a login modal. The five steps of the journey were named there but not built; this repository builds them.

Everything runs client-side. There is no backend, no database and no API keys — the whole world lives in `src/lib/data.ts` and a persisted browser store, so the prototype can be handed to someone with a single URL.

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

## What is in it

### Student journey

| Route | What it does |
| --- | --- |
| `/student` | Progress across the five-step path, current course, passport summary and a context-aware next action |
| `/student/compass` | **Career Compass** — a counsellor that asks five questions, reflects on each answer, then recommends a track and a first course with its reasoning and one question to sit with |
| `/student/studio` | **Learning Studio** — nine courses, searchable and filterable by track and delivery mode |
| `/student/studio/[slug]` | Course syllabus, mastery-tracked modules, delivery-mode choice and enrolment |
| `/student/passport` | **Skills Passport** — verified competencies with their artefacts, evidence submission, and a toggle showing exactly what an employer sees |
| `/student/bridge` | **Talent Bridge** — employer matches scored against verified competencies, each with the reason it was made and what is still missing |

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

- **One typeface, one accent.** Inter throughout. A neutral `ink` scale carries text, borders and surfaces; navy is reserved for the brand, the sidebar and primary actions; gold marks a single accent per view. Status is limited to three quiet tones — verified, in review, not started.
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
    platform-store.tsx      the persisted client store behind every interaction
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
