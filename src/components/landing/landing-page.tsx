"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  CircleCheck,
  FileText,
  Lightbulb,
  LogIn,
  Network,
  Target,
} from "lucide-react";
import { AuthDialog } from "@/components/auth-dialog";
import { HeroDemo } from "@/components/landing/hero-demo";
import { Wordmark, WordmarkLight } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/app/link-button";
import { usePlatform } from "@/lib/platform-store";
import { journeySteps } from "@/lib/data";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";

const stats = [
  { value: "9", label: "Hybrid courses" },
  { value: "3", label: "Ways to learn" },
  { value: "5", label: "Step guided path" },
  { value: "12", label: "ECOWAS countries" },
];

const problems = [
  {
    icon: Target,
    title: "A path picked for you, not guessed",
    body: "An AI counsellor asks about your background and goals, then recommends real courses — not generic advice.",
  },
  {
    icon: BadgeCheck,
    title: "Proof that travels with you",
    body: "A Skills Passport of verified projects — evidence an employer can trust, not just a certificate name.",
  },
  {
    icon: Network,
    title: "A straight line to employers",
    body: "Verified learners are matched directly to open roles at employers hiring across The Gambia and the region.",
  },
];

const habits = [
  {
    icon: CircleCheck,
    title: "Mastery-based, not time-based",
    body: "Courses adapt to what a learner already knows and adjust pacing until a competency is actually mastered — not just marked complete because a week passed.",
  },
  {
    icon: Lightbulb,
    title: "An AI that asks, not just answers",
    body: "Career Compass guides with questions instead of handing over a finished answer, so a learner builds real understanding of their own path rather than copying a recommendation.",
  },
  {
    icon: FileText,
    title: "One skills record, the whole way through",
    body: "Every verified competency, course and employer match lives in a single Skills Passport, so a learner's record compounds over time instead of resetting with each new course.",
  },
];

const audiences = [
  {
    eyebrow: "For students",
    title: "Learn with a plan, not a guess",
    points: [
      "A personalised path from an AI counsellor",
      "Onsite, live tutor-led, or self-paced courses",
      "A verified Skills Passport employers trust",
      "Direct matches to real open roles",
    ],
    cta: "Enter as a student",
    role: "student" as Role,
  },
  {
    eyebrow: "For educators",
    title: "Teach where the gaps really are",
    points: [
      "See every learner's progress in one roster",
      "Review and verify submitted evidence",
      "AI-drafted feedback you can edit and send",
      "Regional demand data to steer curriculum",
    ],
    cta: "Enter as an educator",
    role: "educator" as Role,
  },
];

export function LandingPage() {
  const [authOpen, setAuthOpen] = useState(false);
  const [role, setRole] = useState<Role>("student");
  const [activeStep, setActiveStep] = useState(0);
  const { session } = usePlatform();

  const openAuth = (nextRole: Role) => {
    setRole(nextRole);
    setAuthOpen(true);
  };

  return (
    <div className="flex flex-col">
      <div className="bg-navy-900 px-4 py-2 text-center text-[0.72rem] font-medium text-navy-200">
        Ed-Novate Africa — Prototype. Demo logins, tutor answers and match
        rationales are illustrated interactions built for this pitch.
      </div>

      <header className="sticky top-0 z-40 border-b border-navy-100 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-5">
          <Link href="/" aria-label="Ed-Novate Africa home">
            <Wordmark />
          </Link>
          <nav className="hidden items-center gap-7 text-[0.85rem] font-medium text-navy-600 lg:flex">
            <a href="#platform" className="hover:text-navy-900">
              Platform
            </a>
            <a href="#journey" className="hover:text-navy-900">
              The journey
            </a>
            <a href="#approach" className="hover:text-navy-900">
              Approach
            </a>
            <a href="#audiences" className="hover:text-navy-900">
              Who it&rsquo;s for
            </a>
          </nav>
          <div className="flex items-center gap-2">
            {session ? (
              <LinkButton
                href={session.role === "student" ? "/student" : "/educator"}
                className="h-9 bg-navy-900 px-4 font-semibold hover:bg-navy-800"
              >
                Open the platform
                <ArrowRight className="size-3.5" />
              </LinkButton>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => openAuth("student")}
                  className="h-9 px-3 font-medium text-navy-700"
                >
                  <LogIn className="size-3.5" />
                  Sign in
                </Button>
                <Button
                  onClick={() => openAuth("student")}
                  className="hidden h-9 bg-navy-900 px-4 font-semibold hover:bg-navy-800 sm:flex"
                >
                  Open the platform
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-navy-100">
        <div
          aria-hidden
          className="surface-grid absolute inset-0 opacity-70"
        />
        <div
          aria-hidden
          className="absolute -top-40 -left-32 size-[30rem] rounded-full bg-navy-100/50 blur-3xl"
        />
        <div className="relative mx-auto grid w-full max-w-6xl gap-14 px-5 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-24">
          <div>
            <p className="eyebrow text-gold-600">
              Edtech for The Gambia &amp; ECOWAS
            </p>
            <h1 className="mt-4 font-heading text-[2.6rem] leading-[1.05] font-extrabold text-navy-900 sm:text-[3.4rem]">
              From &ldquo;what next?&rdquo; to a job —{" "}
              <span className="relative whitespace-nowrap">
                <span className="relative z-10">one guided path.</span>
                <span
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 z-0 h-2.5 rounded-sm bg-gold-300/70 sm:h-3"
                />
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-[1.05rem] leading-relaxed text-navy-600">
              Ed-Novate Africa pairs an AI career counsellor with hybrid
              courses, a verified skills passport, and direct employer
              connections — so learners get a real path, and educators get the
              data to close real gaps.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                onClick={() => openAuth("student")}
                className="h-12 bg-navy-900 px-6 text-[0.95rem] font-semibold shadow-lg shadow-navy-900/15 hover:bg-navy-800"
              >
                I&rsquo;m a student
                <ArrowRight className="size-4" />
              </Button>
              <Button
                onClick={() => openAuth("educator")}
                className="h-12 bg-gold-400 px-6 text-[0.95rem] font-semibold text-navy-900 shadow-lg shadow-gold-500/20 hover:bg-gold-300"
              >
                I&rsquo;m an educator
                <ArrowRight className="size-4" />
              </Button>
            </div>

            <dl className="mt-12 grid max-w-lg grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <dt className="sr-only">{stat.label}</dt>
                  <dd className="font-heading text-3xl font-extrabold text-navy-900">
                    {stat.value}
                  </dd>
                  <dd className="mt-1 text-[0.78rem] leading-tight font-medium text-navy-500">
                    {stat.label}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <HeroDemo />
        </div>
      </section>

      {/* Problems */}
      <section id="platform" className="border-b border-navy-100 py-20">
        <div className="mx-auto w-full max-w-6xl px-5">
          <p className="eyebrow text-gold-600">What Ed-Novate Africa does</p>
          <h2 className="mt-3 max-w-2xl font-heading text-[2rem] leading-tight font-extrabold text-navy-900 sm:text-[2.4rem]">
            Three problems, one platform
          </h2>
          <p className="mt-4 max-w-2xl text-[1.02rem] leading-relaxed text-navy-600">
            Most learners don&rsquo;t lack ambition — they lack a guided path, a
            way to prove what they can do, and a route to an employer who&rsquo;s
            hiring for it.
          </p>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {problems.map((problem) => (
              <div
                key={problem.title}
                className="group rounded-2xl bg-white p-6 ring-1 ring-navy-100 transition-all hover:-translate-y-1 hover:ring-navy-200 hover:shadow-[0_18px_40px_-24px_rgba(13,33,55,0.35)]"
              >
                <span className="grid size-11 place-items-center rounded-xl bg-navy-900 text-gold-300">
                  <problem.icon className="size-5" />
                </span>
                <h3 className="mt-5 font-heading text-lg leading-snug font-bold text-navy-900">
                  {problem.title}
                </h3>
                <p className="mt-2.5 text-[0.92rem] leading-relaxed text-navy-600">
                  {problem.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Journey */}
      <section
        id="journey"
        className="border-b border-navy-100 bg-navy-950 py-20 text-white"
      >
        <div className="mx-auto w-full max-w-6xl px-5">
          <p className="eyebrow text-gold-300">How it works</p>
          <h2 className="mt-3 font-heading text-[2rem] leading-tight font-extrabold sm:text-[2.4rem]">
            The five-step journey
          </h2>
          <p className="mt-4 max-w-2xl text-[1.02rem] leading-relaxed text-navy-200">
            Every learner moves through the same guided path — and every step
            feeds data back so educators and ECOWAS can see where the real gaps
            are. Select any step to read it.
          </p>

          <div className="mt-12">
            <ol className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {journeySteps.map((step, i) => (
                <li key={step.id}>
                  <button
                    type="button"
                    onClick={() => setActiveStep(i)}
                    aria-current={i === activeStep}
                    className={cn(
                      "h-full w-full rounded-xl p-4 text-left transition-all",
                      i === activeStep
                        ? "bg-white/10 ring-1 ring-gold-300/60"
                        : "ring-1 ring-white/10 hover:bg-white/5",
                    )}
                  >
                    <span
                      className={cn(
                        "grid size-8 place-items-center rounded-full font-heading text-sm font-bold transition-colors",
                        i === activeStep
                          ? "bg-gold-400 text-navy-900"
                          : "bg-white/10 text-navy-100",
                      )}
                    >
                      {i + 1}
                    </span>
                    <span className="mt-3 block font-heading text-[0.97rem] font-bold">
                      {step.name}
                    </span>
                    <span className="mt-1 block text-[0.8rem] text-navy-300">
                      {step.short}
                    </span>
                  </button>
                </li>
              ))}
            </ol>

            <div className="mt-6 flex flex-col gap-5 rounded-2xl bg-white/5 p-6 ring-1 ring-white/10 sm:flex-row sm:items-center sm:justify-between">
              <div className="max-w-2xl">
                <p className="eyebrow text-gold-300">
                  Step {activeStep + 1} · {journeySteps[activeStep].name}
                </p>
                <p className="mt-2 text-[1rem] leading-relaxed text-navy-100">
                  {journeySteps[activeStep].detail}
                </p>
              </div>
              <Button
                onClick={() =>
                  openAuth(
                    journeySteps[activeStep].id === "intelligence"
                      ? "educator"
                      : "student",
                  )
                }
                className="h-11 shrink-0 bg-gold-400 px-5 font-semibold text-navy-900 hover:bg-gold-300"
              >
                Open {journeySteps[activeStep].name}
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Approach */}
      <section id="approach" className="border-b border-navy-100 py-20">
        <div className="mx-auto w-full max-w-6xl px-5">
          <p className="eyebrow text-gold-600">How Ed-Novate is built</p>
          <h2 className="mt-3 max-w-3xl font-heading text-[2rem] leading-tight font-extrabold text-navy-900 sm:text-[2.4rem]">
            Designed like the AI-hybrid platforms leading this space
          </h2>
          <p className="mt-4 max-w-3xl text-[1.02rem] leading-relaxed text-navy-600">
            The strongest hybrid-learning platforms share a few habits: they
            adapt to the learner instead of a fixed timetable, they coach rather
            than just answer, and they keep one record of a person&rsquo;s
            skills across everything they do. Ed-Novate is built on the same
            three habits.
          </p>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {habits.map((habit) => (
              <div
                key={habit.title}
                className="rounded-2xl bg-navy-50/70 p-6 ring-1 ring-navy-100"
              >
                <span className="grid size-11 place-items-center rounded-xl bg-white text-navy-800 ring-1 ring-navy-200">
                  <habit.icon className="size-5" />
                </span>
                <h3 className="mt-5 font-heading text-lg leading-snug font-bold text-navy-900">
                  {habit.title}
                </h3>
                <p className="mt-2.5 text-[0.92rem] leading-relaxed text-navy-600">
                  {habit.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Audiences */}
      <section id="audiences" className="py-20">
        <div className="mx-auto w-full max-w-6xl px-5">
          <p className="eyebrow text-gold-600">Built for two audiences</p>
          <h2 className="mt-3 font-heading text-[2rem] leading-tight font-extrabold text-navy-900 sm:text-[2.4rem]">
            One platform, two experiences
          </h2>

          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {audiences.map((audience) => (
              <div
                key={audience.eyebrow}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-navy-800 to-navy-950 p-7 text-white sm:p-9"
              >
                <span
                  aria-hidden
                  className={cn(
                    "absolute -top-16 -right-16 size-48 rounded-full blur-2xl",
                    audience.role === "student"
                      ? "bg-navy-500/30"
                      : "bg-gold-400/20",
                  )}
                />
                <div className="relative">
                  <span
                    className={cn(
                      "eyebrow rounded-full px-2.5 py-1",
                      audience.role === "student"
                        ? "bg-white/10 text-navy-100"
                        : "bg-gold-400/20 text-gold-200",
                    )}
                  >
                    {audience.eyebrow}
                  </span>
                  <h3 className="mt-5 font-heading text-[1.6rem] leading-tight font-extrabold sm:text-[1.85rem]">
                    {audience.title}
                  </h3>
                  <ul className="mt-6 space-y-3">
                    {audience.points.map((point) => (
                      <li key={point} className="flex items-start gap-2.5">
                        <span
                          className={cn(
                            "mt-0.5 grid size-4.5 shrink-0 place-items-center rounded-full",
                            audience.role === "student"
                              ? "bg-white/15 text-white"
                              : "bg-gold-400 text-navy-900",
                          )}
                        >
                          <Check className="size-2.5" strokeWidth={4} />
                        </span>
                        <span className="text-[0.94rem] leading-relaxed text-navy-100">
                          {point}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    onClick={() => openAuth(audience.role)}
                    className={cn(
                      "mt-8 h-11 px-5 font-semibold",
                      audience.role === "student"
                        ? "bg-white text-navy-900 hover:bg-navy-50"
                        : "bg-gold-400 text-navy-900 hover:bg-gold-300",
                    )}
                  >
                    {audience.cta}
                    <ArrowRight className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-navy-100 bg-navy-950 py-12 text-navy-300">
        <div className="mx-auto w-full max-w-6xl px-5">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <WordmarkLight />
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-[0.85rem]">
              <button
                type="button"
                onClick={() => openAuth("student")}
                className="hover:text-white"
              >
                Student sign in
              </button>
              <button
                type="button"
                onClick={() => openAuth("educator")}
                className="hover:text-white"
              >
                Educator sign in
              </button>
              <a href="#journey" className="hover:text-white">
                The journey
              </a>
            </div>
          </div>
          <p className="mt-8 max-w-3xl text-[0.78rem] leading-relaxed text-navy-400">
            Prototype note: this sign-in is illustrative — the demo login, tutor
            answers, feedback drafts and match rationales are illustrated
            interactions built for this pitch. Course, learner, employer and
            country figures are illustrative demo data, not real records.
          </p>
        </div>
      </footer>

      <AuthDialog
        open={authOpen}
        onOpenChange={setAuthOpen}
        role={role}
        onRoleChange={setRole}
      />
    </div>
  );
}
