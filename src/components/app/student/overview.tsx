"use client";

import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Check,
  Compass,
  Eye,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { LinkButton } from "@/components/app/link-button";
import {
  Panel,
  PanelTitle,
  StatTile,
  StatusPill,
  Tag,
} from "@/components/app/ui-bits";
import {
  courseBySlug,
  employerById,
  journeySteps,
  openRoles,
  studentProfile,
  trackById,
} from "@/lib/data";
import { usePlatform } from "@/lib/platform-store";
import { cn } from "@/lib/utils";

export function StudentOverview() {
  const { passport, enrollments, compass, applications } = usePlatform();

  const verified = passport.filter((p) => p.status === "verified").length;
  const inReview = passport.filter((p) => p.status === "in-review").length;
  const employerViews = passport.reduce((sum, p) => sum + p.employerViews, 0);
  const primary = enrollments[0];
  const course = primary ? courseBySlug(primary.slug) : undefined;

  const matchTrack = compass?.trackId ?? "data";
  const matches = openRoles
    .filter((r) => r.trackFit === matchTrack)
    .slice(0, 2);

  const nextAction = !compass
    ? {
        title: "Run Career Compass",
        body: "Five questions about your background and constraints, then a track and a first course with the reasoning attached.",
        href: "/student/compass",
        cta: "Start the conversation",
        icon: Compass,
      }
      : inReview > 0
      ? {
          title: `${inReview} piece${inReview > 1 ? "s" : ""} of evidence is with your tutor`,
          body: "Fatoumatta reviews submissions within two working days. You will get written feedback either way — verified, or returned with what to change.",
          href: "/student/passport",
          cta: "Open your passport",
          icon: BadgeCheck,
        }
      : {
          title: "Three employers are hiring for your verified skills",
          body: "Each match lists the reason it was made, so you know which competency did the work before you walk into the room.",
          href: "/student/bridge",
          cta: "See your matches",
          icon: BriefcaseBusiness,
        };

  const stepState = (id: string) => {
    if (id === "compass") return compass ? "done" : "now";
    if (id === "studio") return enrollments.length ? "done" : "next";
    if (id === "passport") return verified >= 3 ? "done" : "now";
    if (id === "bridge") return applications.length ? "done" : "next";
    return "next";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow text-gold-600">Your path</p>
          <h1 className="mt-2 font-heading text-[1.7rem] leading-tight font-extrabold text-navy-900 sm:text-[2rem]">
            Good to see you, {studentProfile.name.split(" ")[0]}.
          </h1>
          <p className="mt-2.5 text-[0.95rem] text-navy-500">
            {studentProfile.cohort} · {studentProfile.location} · Passport{" "}
            <span className="font-mono text-[0.85rem] text-navy-700">
              {studentProfile.passportId}
            </span>
          </p>
        </div>
        <LinkButton
          href="/student/studio"
          className="h-10 bg-navy-900 px-4 font-semibold hover:bg-navy-800"
        >
          Browse the Learning Studio
          <ArrowRight className="size-3.5" />
        </LinkButton>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Verified competencies"
          value={verified}
          sub={`${inReview} waiting on tutor review`}
          icon={BadgeCheck}
          tone="teal"
        />
        <StatTile
          label="Course progress"
          value={`${primary?.progress ?? 0}%`}
          sub={course ? course.title : "Not enrolled yet"}
          icon={GraduationCap}
        />
        <StatTile
          label="Employer views"
          value={employerViews}
          sub="Across your verified evidence"
          icon={Eye}
          tone="gold"
        />
        <StatTile
          label="Open matches"
          value={matches.length + applications.length}
          sub={`${applications.length} introduction${applications.length === 1 ? "" : "s"} in progress`}
          icon={BriefcaseBusiness}
          tone="navy"
        />
      </div>

      {/* Journey strip */}
      <Panel>
        <PanelTitle
          title="Where you are on the five-step path"
          hint="Every step feeds data back so your tutor and the regional dashboard can see where the gaps actually are."
        />
        <ol className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
          {journeySteps.map((step, i) => {
            const state = stepState(step.id);
            const locked = step.id === "intelligence";
            return (
              <li key={step.id}>
                <Link
                  href={locked ? "/student" : step.href}
                  aria-disabled={locked}
                  className={cn(
                    "flex h-full flex-col rounded-xl p-3.5 ring-1 transition-all",
                    locked
                      ? "cursor-default bg-navy-50/50 ring-navy-100"
                      : "hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-20px_rgba(13,33,55,0.45)]",
                    state === "done" && !locked && "bg-teal-100/40 ring-teal-100",
                    state === "now" && !locked && "bg-gold-50 ring-gold-200",
                    state === "next" && !locked && "bg-white ring-navy-100",
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className={cn(
                        "grid size-6 shrink-0 place-items-center rounded-full font-heading text-[0.7rem] font-bold",
                        state === "done"
                          ? "bg-teal-500 text-white"
                          : state === "now"
                            ? "bg-gold-400 text-navy-900"
                            : "bg-navy-100 text-navy-500",
                      )}
                    >
                      {state === "done" ? (
                        <Check className="size-3" strokeWidth={4} />
                      ) : (
                        i + 1
                      )}
                    </span>
                    <span className="text-[0.85rem] font-bold text-navy-900">
                      {step.name}
                    </span>
                  </span>
                  <span className="mt-2 text-[0.76rem] leading-snug text-navy-500">
                    {locked
                      ? "Educator and ministry view — your data feeds it anonymously."
                      : step.short}
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
        {/* Next action + course */}
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-navy-800 to-navy-950 p-6 text-white">
            <span
              aria-hidden
              className="absolute -top-14 -right-10 size-44 rounded-full bg-gold-400/15 blur-2xl"
            />
            <div className="relative">
              <span className="eyebrow inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-gold-200">
                <Sparkles className="size-3" />
                Do this next
              </span>
              <h2 className="mt-4 font-heading text-[1.3rem] leading-snug font-extrabold">
                {nextAction.title}
              </h2>
              <p className="mt-2.5 max-w-lg text-[0.92rem] leading-relaxed text-navy-200">
                {nextAction.body}
              </p>
              <LinkButton
                href={nextAction.href}
                className="mt-5 h-10 bg-gold-400 px-4 font-semibold text-navy-900 hover:bg-gold-300"
              >
                {nextAction.cta}
                <ArrowRight className="size-3.5" />
              </LinkButton>
            </div>
          </div>

          {course && primary ? (
            <Panel>
              <PanelTitle
                title="Current course"
                action={
                  <LinkButton
                    variant="outline"
                    href={`/student/studio/${course.slug}`}
                    className="h-9"
                  >
                    Open course
                  </LinkButton>
                }
              />
              <div className="flex flex-wrap items-center gap-2">
                <Tag tone="gold">{trackById(course.track).name}</Tag>
                <Tag tone="outline">{course.level}</Tag>
                <Tag tone="outline">
                  {primary.mode === "onsite"
                    ? course.hub
                    : primary.mode === "live"
                      ? "Live tutor-led"
                      : "Self-paced"}
                </Tag>
              </div>
              <h3 className="mt-3 font-heading text-[1.15rem] font-bold text-navy-900">
                {course.title}
              </h3>
              <p className="mt-1.5 text-[0.88rem] leading-relaxed text-navy-500">
                {course.blurb}
              </p>

              <div className="mt-5 space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-[0.8rem] font-semibold text-navy-600">
                    Mastery progress
                  </span>
                  <span className="font-heading text-[0.9rem] font-bold text-navy-900">
                    {primary.progress}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-navy-100">
                  <div
                    className="h-full rounded-full bg-navy-800 transition-all"
                    style={{ width: `${primary.progress}%` }}
                  />
                </div>
                <p className="text-[0.78rem] text-navy-400">
                  Four of five modules mastered. The capstone decision memo is
                  the last one.
                </p>
              </div>
            </Panel>
          ) : null}
        </div>

        {/* Passport + matches */}
        <div className="space-y-4">
          <Panel>
            <PanelTitle
              title="Skills Passport"
              action={
                <LinkButton
                  variant="ghost"
                  href="/student/passport"
                  className="h-8 text-navy-600"
                >
                  All entries
                </LinkButton>
              }
            />
            <ul className="space-y-2">
              {passport.slice(0, 5).map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-center justify-between gap-3 rounded-lg bg-navy-50/60 px-3 py-2.5"
                >
                  <span className="truncate text-[0.85rem] font-medium text-navy-800">
                    {entry.competency}
                  </span>
                  <StatusPill status={entry.status} />
                </li>
              ))}
            </ul>
          </Panel>

          <Panel>
            <PanelTitle
              title="Employers looking at your track"
              action={
                <LinkButton
                  variant="ghost"
                  href="/student/bridge"
                  className="h-8 text-navy-600"
                >
                  Talent Bridge
                </LinkButton>
              }
            />
            <ul className="space-y-3">
              {matches.map((role) => {
                const employer = employerById(role.employerId);
                return (
                  <li
                    key={role.id}
                    className="rounded-xl p-3.5 ring-1 ring-navy-100"
                  >
                    <p className="text-[0.92rem] font-bold text-navy-900">
                      {role.title}
                    </p>
                    <p className="mt-0.5 text-[0.78rem] text-navy-500">
                      {employer?.name} · {role.mode} · {role.location}
                    </p>
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {role.requires.map((skill) => {
                        const held = passport.some(
                          (p) =>
                            p.competency === skill && p.status === "verified",
                        );
                        return (
                          <Tag
                            key={skill}
                            tone={held ? "teal" : "outline"}
                            className="text-[0.68rem]"
                          >
                            {held ? "✓ " : ""}
                            {skill}
                          </Tag>
                        );
                      })}
                    </div>
                  </li>
                );
              })}
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}
