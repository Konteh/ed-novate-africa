"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Check, Network, Target } from "lucide-react";
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
  { value: "9", label: "courses" },
  { value: "3", label: "ways to learn" },
  { value: "12", label: "ECOWAS countries" },
];

const value = [
  {
    icon: Target,
    title: "A path, not a guess",
    body: "An AI counsellor recommends real courses for your situation.",
  },
  {
    icon: BadgeCheck,
    title: "Proof, not a certificate",
    body: "Every skill is backed by work a tutor checked and signed.",
  },
  {
    icon: Network,
    title: "A line to employers",
    body: "Verified skills are matched to roles that are open now.",
  },
];

const audiences = [
  {
    role: "student" as Role,
    title: "For students",
    lead: "Learn with a plan",
    points: [
      "A path picked for you",
      "Onsite, live or self-paced",
      "Skills employers can verify",
    ],
    cta: "Enter as a student",
  },
  {
    role: "educator" as Role,
    title: "For educators",
    lead: "Teach where the gaps are",
    points: [
      "One roster, every learner",
      "Review evidence with drafted feedback",
      "Regional demand data",
    ],
    cta: "Enter as an educator",
  },
];

const navLinks = [
  { href: "#value", label: "Platform" },
  { href: "#journey", label: "How it works" },
  { href: "#audiences", label: "Who it’s for" },
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
    <div className="flex flex-col">
      <p className="bg-navy-900 px-4 py-1.5 text-center text-xs text-navy-200">
        Prototype — all data shown is illustrative.
      </p>

      <header className="sticky top-0 z-40 border-b border-ink-200 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-5">
          <Link
            href="/"
            aria-label="Ed-Novate Africa home"
            className="rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-navy-500/45"
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
                <Button
                  onClick={() => openAuth("student")}
                  className="hidden sm:inline-flex"
                >
                  Get started
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <section className="border-b border-ink-200 bg-ink-50/60">
        <div className="mx-auto grid w-full max-w-6xl gap-12 px-5 py-16 lg:grid-cols-[1fr_0.92fr] lg:items-center lg:py-20">
          <div>
            <h1 className="max-w-xl text-[2.4rem] leading-[1.08] font-semibold tracking-[-0.02em] text-balance sm:text-[3.1rem]">
              From “what next?” to a job.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-ink-600 sm:text-[1.05rem]">
              An AI counsellor picks your course, a tutor verifies your work,
              and employers see the proof.
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

            <dl className="mt-10 flex flex-wrap items-baseline gap-x-8 gap-y-3">
              {stats.map((stat) => (
                <div key={stat.label} className="flex items-baseline gap-1.5">
                  <dt className="sr-only">{stat.label}</dt>
                  <dd className="text-xl font-semibold tabular-nums">
                    {stat.value}
                  </dd>
                  <dd className="text-sm text-ink-500">{stat.label}</dd>
                </div>
              ))}
            </dl>
          </div>

          <HeroDemo />
        </div>
      </section>

      <section id="value" className="border-b border-ink-200 py-16">
        <div className="mx-auto w-full max-w-6xl px-5">
          <h2 className="text-2xl font-semibold sm:text-[1.75rem]">
            Three problems, one platform
          </h2>
          <div className="mt-8 grid gap-px overflow-hidden rounded-xl border border-ink-200 bg-ink-200 sm:grid-cols-3">
            {value.map((item) => (
              <div key={item.title} className="bg-white p-6">
                <span className="grid size-9 place-items-center rounded-lg bg-ink-100 text-navy-700">
                  <item.icon className="size-4.5" />
                </span>
                <h3 className="mt-4 text-base font-semibold">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-600">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="journey" className="bg-navy-950 py-16 text-white">
        <div className="mx-auto w-full max-w-6xl px-5">
          <h2 className="text-2xl font-semibold text-white sm:text-[1.75rem]">
            The five-step journey
          </h2>

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
                    ? "border-gold-300/60 bg-white/10"
                    : "border-white/10 hover:border-white/20 hover:bg-white/5",
                )}
              >
                <span
                  className={cn(
                    "text-xs font-medium tabular-nums",
                    i === activeStep ? "text-gold-300" : "text-navy-300",
                  )}
                >
                  {i + 1}
                </span>
                <span className="mt-1.5 block text-sm font-semibold text-white">
                  {item.name}
                </span>
                <span className="mt-0.5 block text-xs text-navy-300">
                  {item.short}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-4 flex flex-col gap-4 rounded-xl border border-white/10 bg-white/5 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
            <p
              key={step.id}
              className="animate-fade-up max-w-2xl text-sm leading-relaxed text-navy-100"
            >
              {step.detail}
            </p>
            <Button
              variant="accent"
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

      <section id="audiences" className="py-16">
        <div className="mx-auto grid w-full max-w-6xl gap-5 px-5 sm:grid-cols-2">
          {audiences.map((audience) => (
            <div
              key={audience.role}
              className="flex flex-col rounded-xl border border-ink-200 bg-white p-7 shadow-card"
            >
              <p className="text-xs font-medium text-ink-500">
                {audience.title}
              </p>
              <h2 className="mt-1 text-xl font-semibold">{audience.lead}</h2>
              <ul className="mt-5 flex-1 space-y-2.5">
                {audience.points.map((point) => (
                  <li
                    key={point}
                    className="flex items-center gap-2.5 text-sm text-ink-700"
                  >
                    <Check
                      className="size-4 shrink-0 text-ok-600"
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

      <footer className="border-t border-ink-200 bg-navy-950 py-10 text-navy-300">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-5 sm:flex-row sm:items-center sm:justify-between">
          <WordmarkLight />
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
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
