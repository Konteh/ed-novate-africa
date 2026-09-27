import { courses, trackById } from "./data";
import type { DeliveryMode, TrackId } from "./types";

export interface CompassQuestion {
  id: string;
  prompt: string;
  nudge: string;
  options: { value: string; label: string; hint?: string }[];
}

export const compassQuestions: CompassQuestion[] = [
  {
    id: "interest",
    prompt: "What excites you about tech?",
    nudge:
      "Pick the one closest to true. We are narrowing, not deciding — you can change it later.",
    options: [
      { value: "data", label: "Working with data" },
      { value: "software", label: "Building things people use" },
      { value: "security", label: "Keeping systems safe" },
      { value: "cloud", label: "Keeping services running" },
      { value: "fintech", label: "Money and payments" },
      { value: "business", label: "Growing a business online" },
      { value: "climate", label: "Farms, water and climate" },
      { value: "ai", label: "Using AI tools well" },
    ],
  },
  {
    id: "start",
    prompt: "Where are you starting from?",
    nudge:
      "Be honest here. The recommendation changes a lot depending on your answer, and nobody sees this but you and your tutor.",
    options: [
      { value: "school", label: "Still in secondary school" },
      { value: "fresh", label: "Finished school, no experience yet" },
      { value: "self-taught", label: "I have taught myself some of this" },
      { value: "switching", label: "Working, and want to switch" },
      { value: "graduate", label: "Graduated, still looking for work" },
    ],
  },
  {
    id: "mode",
    prompt: "How do you learn best?",
    nudge:
      "There is no better answer. Onsite learners finish fastest, self-paced learners finish most often around a job.",
    options: [
      {
        value: "onsite",
        label: "Onsite, with classmates",
        hint: "In a hub classroom with a tutor",
      },
      {
        value: "live",
        label: "Live online, with a tutor",
        hint: "Scheduled sessions you join from home",
      },
      {
        value: "self-paced",
        label: "On my own, at my own pace",
        hint: "Work through it whenever you can",
      },
    ],
  },
  {
    id: "time",
    prompt: "How much time can you really give each week?",
    nudge:
      "Not the time you wish you had. The time you actually have, on a normal week.",
    options: [
      { value: "under5", label: "Under 5 hours" },
      { value: "5to10", label: "5 to 10 hours" },
      { value: "10to20", label: "10 to 20 hours" },
      { value: "full", label: "Full-time" },
    ],
  },
  {
    id: "goal",
    prompt: "What would make this worth it?",
    nudge: "The thing you would tell your family you were doing this for.",
    options: [
      { value: "job", label: "A job within a year" },
      { value: "promote", label: "A promotion where I already work" },
      { value: "own", label: "Starting something of my own" },
      { value: "study", label: "Getting into further study" },
    ],
  },
];

export const reflections: Record<string, Record<string, string>> = {
  interest: {
    data: "Good — data work is the widest door in the region right now, and it rewards patience more than it rewards maths.",
    software:
      "That means building for phones on metered data, which is a harder craft than it looks and a rarer one to hire.",
    security:
      "Defenders are short everywhere. It is also the one track where writing clearly matters as much as the technical work.",
    cloud:
      "Keeping things running is unglamorous and almost never unemployed. Worth knowing that up front.",
    fintech:
      "Payments is the sector moving fastest here, and operations roles open earlier than engineering ones.",
    business:
      "Growth work suits people who like talking to customers. It is also the fastest track to earning something on the side.",
    climate:
      "Field data is undervalued and underserved. Fewer people compete for it, and the work is visible in your own community.",
    ai: "Useful, with one caveat: AI literacy on its own is thin. It works best sitting on top of another skill.",
  },
  start: {
    school:
      "Then we should not start you on anything that assumes a job. Foundations first, and keep the hours light.",
    fresh:
      "That is the most common answer we get, and it is not a disadvantage — every foundation course assumes exactly this.",
    "self-taught":
      "Then the useful thing we can give you is verification. You may already have the skill and no way to prove it.",
    switching:
      "Switching while working is the hardest version of this. We will pick a pace you can survive.",
    graduate:
      "A degree with no evidence attached is the exact gap the Skills Passport was built for.",
  },
  mode: {
    onsite:
      "Noted. Onsite cohorts have the highest completion rate we see, so if you can reach a hub, take it.",
    live: "Live sessions give you the tutor without the travel. Attendance is what makes or breaks it.",
    "self-paced":
      "Self-paced is the right call around other commitments, as long as you submit evidence on a rhythm.",
  },
  time: {
    under5:
      "Under five hours is real, and it means a shorter course rather than a stretched one.",
    "5to10":
      "That is enough for a foundation course at its intended pace. No stretching needed.",
    "10to20": "That is comfortable. You will likely finish ahead of your cohort.",
    full: "Full-time changes things — you can stack a second course straight after the first.",
  },
  goal: {
    job: "Then we work backwards from what employers verify, not from what is interesting to study.",
    promote:
      "Then the evidence matters more than the certificate. Your manager needs to see the artefact.",
    own: "Then you need the skill and the customer side of it. We will keep that in view.",
    study:
      "Then a verified record helps twice: admissions and the job after it.",
  },
};

const adjacency: Record<TrackId, TrackId[]> = {
  data: ["ai", "climate"],
  software: ["cloud", "ai"],
  security: ["cloud", "fintech"],
  cloud: ["software", "security"],
  fintech: ["data", "security"],
  business: ["ai", "data"],
  climate: ["data", "business"],
  ai: ["data", "business"],
};

export interface Recommendation {
  trackId: TrackId;
  primarySlug: string;
  alternateSlugs: string[];
  mode: DeliveryMode;
  reasons: string[];
  openQuestion: string;
}

const levelOrder = { Foundation: 0, Intermediate: 1, Advanced: 2 } as const;

export function recommend(
  answers: Record<string, string>,
): Recommendation {
  const trackId = (answers.interest ?? "data") as TrackId;
  const mode = (answers.mode ?? "live") as DeliveryMode;
  const track = trackById(trackId);

  const inTrack = [...courses]
    .filter((c) => c.track === trackId)
    .sort((a, b) => levelOrder[a.level] - levelOrder[b.level]);

  const preferMode = inTrack.filter((c) => c.modes.includes(mode));
  const primary = (preferMode[0] ?? inTrack[0] ?? courses[0]).slug;

  const alternates = [
    ...inTrack.filter((c) => c.slug !== primary).map((c) => c.slug),
    ...adjacency[trackId]
      .flatMap((t) => courses.filter((c) => c.track === t))
      .filter((c) => c.modes.includes(mode))
      .map((c) => c.slug),
  ].slice(0, 2);

  const primaryCourse = courses.find((c) => c.slug === primary)!;
  const experienced =
    answers.start === "self-taught" || answers.start === "switching";

  const reasons = [
    `You chose ${track.name.toLowerCase()}, and ${primaryCourse.title} is the entry point with ${primaryCourse.openRoles} open roles matched to it across the region today.`,
    primaryCourse.modes.includes(mode)
      ? `It runs in the way you said you learn best — ${
          mode === "onsite"
            ? `onsite at ${primaryCourse.hub}`
            : mode === "live"
              ? "live with a tutor on a fixed schedule"
              : "fully self-paced"
        }.`
      : `It does not run ${mode === "onsite" ? "onsite" : "in your preferred mode"} yet, so we have put you in the closest available option and flagged it for your tutor.`,
    answers.time === "under5"
      ? `At under five hours a week, expect ${Math.ceil(
          (primaryCourse.weeks * primaryCourse.hoursPerWeek) / 4,
        )} weeks rather than the standard ${primaryCourse.weeks}. That is fine — mastery is the gate, not the calendar.`
      : `At ${primaryCourse.hoursPerWeek} hours a week it runs ${primaryCourse.weeks} weeks, and you said you have the time for that.`,
    experienced
      ? "Because you have taught yourself some of this, module 1 will be offered as a challenge assessment — pass it and you skip straight to module 2 with the competency verified."
      : "Every module ends in an artefact a human tutor reviews, so your passport fills up as you go rather than at the end.",
  ];

  const openQuestions: Record<string, string> = {
    job: `Before you enrol: name one employer you would actually want to work for in ${
      mode === "onsite" ? "the Greater Banjul Area" : "the region"
    }. If you cannot name one, that is the more useful problem to solve first.`,
    promote:
      "Before you enrol: what would your manager need to see you do differently for this to count? Write it down now and check it against module 3.",
    own: "Before you enrol: who is the first person who would pay you for this, and what would they be paying for? A course is much easier when that name is real.",
    study:
      "Before you enrol: which programme are you aiming at, and does it accept verified evidence alongside grades? Ask them — it changes what we should prioritise.",
  };

  return {
    trackId,
    primarySlug: primary,
    alternateSlugs: alternates,
    mode,
    reasons,
    openQuestion: openQuestions[answers.goal ?? "job"],
  };
}
