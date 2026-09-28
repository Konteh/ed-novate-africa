"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, MapPin } from "lucide-react";
import { AuthDialog } from "@/components/auth-dialog";
import { FeaturedCourses } from "@/components/landing/featured-courses";
import { HeroDemo } from "@/components/landing/hero-demo";
import { Wordmark, WordmarkLight } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/app/link-button";
import { usePlatform } from "@/lib/platform-store";
import { journeySteps, modeBlurbs, modeLabels, tracks } from "@/lib/data";
import type { DeliveryMode, Role } from "@/lib/types";
import { cn } from "@/lib/utils";

const hubs = ["Kanifing", "Banjul", "Serrekunda", "Janjanbureh"];

const modes: DeliveryMode[] = ["onsite", "live", "self-paced"];

const audiences = [
  {
    role: "student" as Role,
    title: "For students",
    lead: "Learn with a plan",
    points: [
      "A path picked for your situation",
      "Onsite, live, or at your own pace",
      "A record employers can check",
    ],
    cta: "Enter as a student",
  },
  {
    role: "educator" as Role,
    title: "For educators",
    lead: "Teach where the gaps are",
    points: [
      "One roster for every learner",
      "Review evidence, then send the feedback",
      "Demand by skill, across ECOWAS",
    ],
    cta: "Enter as an educator",
  },
];

const navLinks = [
  { href: "#courses", label: "Courses" },
  { href: "#journey", label: "How it works" },
  { href: "#audiences", label: "Who it’s for" },
];

const footerLearn = [
  { href: "/student/compass?demo=student", label: "Career Compass" },
  { href: "/student/studio?demo=student", label: "Learning Studio" },
  { href: "/student/passport?demo=student", label: "Skills Passport" },
  { href: "/student/bridge?demo=student", label: "Talent Bridge" },
];

const footerTeach = [
  { href: "/educator/roster?demo=educator", label: "Cohort roster" },
  { href: "/educator/evidence?demo=educator", label: "Evidence queue" },
  { href: "/educator/intelligence?demo=educator", label: "Regional intelligence" },
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

  const step = journeySteps[activeStep];

  return (
    <div className="flex flex-col bg-white">
      <header className="sticky top-0 z-40 border-b border-ink-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-5">
          <Link
            href="/"
            aria-label="Ednovate Labs home"
            className="rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-blue-500/45"
          >
            <Wordmark />
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-ink-600 transition-colors hover:bg-ink-100 hover:text-ink-900"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {session ? (
              <LinkButton
                href={session.role === "student" ? "/student" : "/educator"}
              >
                Open the platform
                <ArrowRight />
              </LinkButton>
            ) : (
              <>
                <Button variant="ghost" onClick={() => openAuth("student")}>
                  Sign in
                </Button>
                <Button onClick={() => openAuth("student")}>Get started</Button>
              </>
            )}
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-ink-200">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,var(--color-blue-100),transparent_58%)]"
        />
        <div className="relative mx-auto grid w-full max-w-6xl gap-12 px-5 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-20">
          <div>
            <h1 className="max-w-xl text-[2.5rem] leading-[1.05] font-semibold tracking-[-0.025em] text-balance sm:text-[3.35rem]">
              Learn the skill.
              <span className="block text-blue-700">Show the proof.</span>
              Get hired.
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-ink-600 sm:text-[1.05rem]">
              Ednovate Labs trains learners in The Gambia and across ECOWAS. A
              counsellor helps you choose a course, a tutor checks the work, and
              employers hire from that record.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="xl" onClick={() => openAuth("student")}>
                I’m a student
                <ArrowRight />
              </Button>
              <Button
                size="xl"
                variant="outline"
                onClick={() => openAuth("educator")}
              >
                I’m an educator
              </Button>
            </div>

            <p className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-ink-500">
              <MapPin className="size-4 text-blue-600" />
              {hubs.map((hub) => (
                <span key={hub} className="font-medium text-ink-700">
                  {hub}
                </span>
              ))}
            </p>
          </div>

          <HeroDemo />
        </div>
      </section>

      <section className="border-b border-ink-200 bg-ink-50/70">
        <div className="mx-auto grid w-full max-w-6xl divide-y divide-ink-200 px-5 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {modes.map((mode, i) => (
            <div key={mode} className="py-6 sm:px-6 sm:py-8 sm:first:pl-0 sm:last:pr-0">
              <p className="text-xs font-medium text-blue-700 tabular-nums">
                0{i + 1}
              </p>
              <h2 className="mt-1 text-base font-semibold">{modeLabels[mode]}</h2>
              <p className="mt-1 text-sm leading-relaxed text-ink-600">
                {modeBlurbs[mode]}
              </p>
            </div>
          ))}
        </div>
      </section>

      <FeaturedCourses />

      <section className="border-b border-ink-200 py-12">
        <div className="mx-auto w-full max-w-6xl px-5">
          <h2 className="text-sm font-medium text-ink-500">Eight tracks</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {tracks.map((track) => (
              <Link
                key={track.id}
                href={`/student/studio?demo=student&track=${track.id}`}
                className="rounded-full border border-ink-200 bg-white px-3.5 py-2 text-sm font-medium text-ink-700 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800"
              >
                {track.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="journey" className="bg-blue-950 py-16 text-white sm:py-20">
        <div className="mx-auto w-full max-w-6xl px-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="text-2xl font-semibold tracking-[-0.01em] text-white sm:text-[1.85rem]">
              Five steps, one record
            </h2>
            <p className="max-w-sm text-sm leading-relaxed text-blue-200">
              Each step writes into the next. Nothing resets when a course ends.
            </p>
          </div>

          <div
            role="tablist"
            aria-label="Journey steps"
            className="mt-8 grid gap-2 sm:grid-cols-3 lg:grid-cols-5"
          >
            {journeySteps.map((item, i) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={i === activeStep}
                onClick={() => setActiveStep(i)}
                className={cn(
                  "rounded-xl border px-4 py-3.5 text-left transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-gold-300/70",
                  i === activeStep
                    ? "border-gold-300/70 bg-white/10"
                    : "border-white/10 hover:border-white/25 hover:bg-white/5",
                )}
              >
                <span
                  className={cn(
                    "text-xs font-medium tabular-nums",
                    i === activeStep ? "text-gold-300" : "text-blue-300",
                  )}
                >
                  0{i + 1}
                </span>
                <span className="mt-1.5 block text-sm font-semibold text-white">
                  {item.name}
                </span>
                <span className="mt-0.5 block text-xs text-blue-300">
                  {item.short}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-4 flex flex-col gap-5 rounded-xl border border-white/10 bg-white/5 px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p
              key={step.id}
              className="animate-fade-up max-w-2xl text-[0.95rem] leading-relaxed text-blue-50"
            >
              {step.detail}
            </p>
            <Button
              variant="accent"
              size="lg"
              className="shrink-0"
              onClick={() =>
                openAuth(step.id === "intelligence" ? "educator" : "student")
              }
            >
              Open {step.name}
              <ArrowRight />
            </Button>
          </div>
        </div>
      </section>

      <section id="audiences" className="bg-ink-50/70 py-16 sm:py-20">
        <div className="mx-auto grid w-full max-w-6xl gap-4 px-5 md:grid-cols-2">
          {audiences.map((audience) => (
            <div
              key={audience.role}
              className={cn(
                "flex flex-col rounded-xl border border-ink-200 bg-white p-7 shadow-card",
                audience.role === "student"
                  ? "border-t-4 border-t-blue-600"
                  : "border-t-4 border-t-gold-400",
              )}
            >
              <p className="text-xs font-medium text-ink-500">{audience.title}</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-[-0.015em]">
                {audience.lead}
              </h2>
              <ul className="mt-5 flex-1 space-y-3">
                {audience.points.map((point) => (
                  <li
                    key={point}
                    className="flex items-start gap-2.5 text-sm leading-relaxed text-ink-700"
                  >
                    <Check
                      className="mt-0.5 size-4 shrink-0 text-ok-600"
                      strokeWidth={2.5}
                    />
                    {point}
                  </li>
                ))}
              </ul>
              <Button
                variant={audience.role === "student" ? "default" : "outline"}
                size="lg"
                className="mt-7 self-start"
                onClick={() => openAuth(audience.role)}
              >
                {audience.cta}
                <ArrowRight />
              </Button>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-ink-200 bg-blue-950">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-5 px-5 py-12 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white sm:text-2xl">
              Five questions. A course to start with.
            </h2>
            <p className="mt-1.5 text-sm text-blue-200">
              Career Compass takes about four minutes.
            </p>
          </div>
          <Button variant="accent" size="xl" onClick={() => openAuth("student")}>
            Start Career Compass
            <ArrowRight />
          </Button>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-blue-950 pb-10 text-blue-300">
        <div className="mx-auto grid w-full max-w-6xl gap-8 border-t border-white/10 px-5 pt-10 sm:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <WordmarkLight />
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-blue-200">
              A guided path from choosing a course to getting hired.
            </p>
          </div>
          <FooterColumn title="Learn" links={footerLearn} />
          <FooterColumn title="Teach" links={footerTeach} />
        </div>
        <div className="mx-auto mt-8 flex w-full max-w-6xl flex-col gap-3 px-5 text-xs text-blue-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Ednovate Labs</p>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => openAuth("student")}
              className="transition-colors hover:text-white"
            >
              Student sign in
            </button>
            <button
              type="button"
              onClick={() => openAuth("educator")}
              className="transition-colors hover:text-white"
            >
              Educator sign in
            </button>
          </div>
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

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <p className="text-sm font-medium text-white">{title}</p>
      <ul className="mt-3 space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-blue-100 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
