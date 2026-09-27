"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Check,
  ChevronDown,
  Clock,
  GraduationCap,
  MapPin,
  Star,
  Users,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/app/link-button";
import {
  Panel,
  PanelTitle,
  StatusPill,
  Tag,
} from "@/components/app/ui-bits";
import {
  employerById,
  modeBlurbs,
  modeLabels,
  openRoles,
  trackById,
} from "@/lib/data";
import { usePlatform } from "@/lib/platform-store";
import type { Course, DeliveryMode } from "@/lib/types";
import { cn } from "@/lib/utils";

export function CourseDetail({ course }: { course: Course }) {
  const { enroll, enrollmentFor, passport, compass } = usePlatform();
  const enrollment = enrollmentFor(course.slug);
  const [mode, setMode] = useState<DeliveryMode>(
    enrollment?.mode ?? compass?.mode ?? course.modes[0],
  );
  const [openModule, setOpenModule] = useState<number | null>(0);

  const available = course.modes.includes(mode);
  const relatedRoles = openRoles
    .filter((r) => r.trackFit === course.track)
    .slice(0, 3);

  const statusFor = (skill: string) =>
    passport.find((p) => p.competency === skill)?.status ?? "not-started";

  const handleEnroll = () => {
    enroll(course.slug, mode);
    toast.success(`You are enrolled in ${course.title}`, {
      description: `${modeLabels[mode]} · ${course.weeks} weeks · ${course.tutor} is your tutor.`,
    });
  };

  return (
    <div className="space-y-6">
      <LinkButton
        variant="ghost"
        href="/student/studio"
        className="h-8 -ml-2 text-navy-500"
      >
        <ArrowLeft className="size-3.5" />
        All courses
      </LinkButton>

      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-navy-800 to-navy-950 p-6 text-white sm:p-8">
        <span
          aria-hidden
          className="absolute -top-20 -right-16 size-56 rounded-full bg-gold-400/15 blur-3xl"
        />
        <div className="relative">
          <div className="flex flex-wrap items-center gap-2">
            <span className="eyebrow rounded-full bg-gold-400/20 px-2.5 py-1 text-gold-200">
              {trackById(course.track).name}
            </span>
            <span className="eyebrow rounded-full bg-white/10 px-2.5 py-1 text-navy-100">
              {course.level}
            </span>
            {enrollment ? (
              <span className="eyebrow inline-flex items-center gap-1 rounded-full bg-teal-500/20 px-2.5 py-1 text-teal-200">
                <Check className="size-2.5" strokeWidth={4} />
                Enrolled
              </span>
            ) : null}
          </div>

          <h1 className="mt-4 max-w-2xl font-heading text-[1.9rem] leading-tight font-extrabold sm:text-[2.3rem]">
            {course.title}
          </h1>
          <p className="mt-3 max-w-2xl text-[1rem] leading-relaxed text-navy-200">
            {course.description}
          </p>

          <dl className="mt-7 grid grid-cols-2 gap-5 sm:grid-cols-4">
            <HeroStat
              icon={Clock}
              label="Length"
              value={`${course.weeks} weeks`}
              sub={`${course.hoursPerWeek} hours a week`}
            />
            <HeroStat
              icon={Users}
              label="Learners"
              value={course.learners.toLocaleString()}
              sub={`Rated ${course.rating.toFixed(1)} / 5`}
            />
            <HeroStat
              icon={MapPin}
              label="Open roles"
              value={String(course.openRoles)}
              sub="Matched to this course"
            />
            <HeroStat
              icon={Wallet}
              label="Fee"
              value={`D${course.feeGMD.toLocaleString()}`}
              sub={course.scholarship}
            />
          </dl>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr] lg:items-start">
        <div className="space-y-5">
          <Panel>
            <PanelTitle
              title="What you will work through"
              hint={`${course.modules.length} modules, ${course.modules.reduce(
                (s, m) => s + m.hours,
                0,
              )} hours of graded work. Each one ends in an artefact your tutor reviews.`}
            />
            <ul className="space-y-2">
              {course.modules.map((module, i) => {
                const open = openModule === i;
                return (
                  <li
                    key={module.name}
                    className="overflow-hidden rounded-xl ring-1 ring-navy-100"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenModule(open ? null : i)}
                      aria-expanded={open}
                      className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-navy-50/60"
                    >
                      <span
                        className={cn(
                          "grid size-7 shrink-0 place-items-center rounded-full font-heading text-[0.75rem] font-bold",
                          enrollment && i < 4
                            ? "bg-teal-500 text-white"
                            : "bg-navy-100 text-navy-600",
                        )}
                      >
                        {enrollment && i < 4 ? (
                          <Check className="size-3" strokeWidth={4} />
                        ) : (
                          i + 1
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[0.92rem] font-bold text-navy-900">
                          {module.name}
                        </span>
                        <span className="mt-0.5 block text-[0.78rem] text-navy-400">
                          {module.hours} hours ·{" "}
                          {module.competencies.length} competenc
                          {module.competencies.length === 1 ? "y" : "ies"}
                        </span>
                      </span>
                      <ChevronDown
                        className={cn(
                          "size-4 shrink-0 text-navy-400 transition-transform",
                          open && "rotate-180",
                        )}
                      />
                    </button>
                    {open ? (
                      <div className="border-t border-navy-100 bg-navy-50/40 px-4 py-4 pl-14">
                        <p className="text-[0.87rem] leading-relaxed text-navy-600">
                          {module.summary}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {module.competencies.map((c) => (
                            <Tag key={c} className="text-[0.7rem]">
                              {c}
                            </Tag>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </Panel>

          <Panel>
            <PanelTitle
              title="Competencies this adds to your passport"
              hint="Each one needs an artefact a tutor signs off. Nothing is awarded for attendance."
              action={
                <LinkButton
                  variant="outline"
                  href="/student/passport"
                  className="h-9"
                >
                  <BadgeCheck className="size-3.5" />
                  Passport
                </LinkButton>
              }
            />
            <ul className="grid gap-2 sm:grid-cols-2">
              {course.skills.map((skill) => (
                <li
                  key={skill}
                  className="flex items-center justify-between gap-2 rounded-lg bg-navy-50/60 px-3 py-2.5"
                >
                  <span className="truncate text-[0.85rem] font-medium text-navy-800">
                    {skill}
                  </span>
                  <StatusPill status={statusFor(skill)} />
                </li>
              ))}
            </ul>
          </Panel>

          <Panel>
            <PanelTitle
              title="Roles this course is matched to"
              hint="Live openings whose screening competencies overlap this syllabus."
            />
            <ul className="space-y-2.5">
              {relatedRoles.map((role) => {
                const employer = employerById(role.employerId);
                return (
                  <li key={role.id}>
                    <Link
                      href="/student/bridge"
                      className="flex items-center justify-between gap-3 rounded-xl p-3.5 ring-1 ring-navy-100 transition-colors hover:bg-navy-50/60"
                    >
                      <span className="min-w-0">
                        <span className="block text-[0.9rem] font-bold text-navy-900">
                          {role.title}
                        </span>
                        <span className="mt-0.5 block truncate text-[0.78rem] text-navy-500">
                          {employer?.name} · {role.location} · {role.salaryGMD}
                        </span>
                      </span>
                      <ArrowRight className="size-4 shrink-0 text-navy-300" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Panel>
        </div>

        <div className="space-y-5 lg:sticky lg:top-6">
          <Panel>
            <PanelTitle
              title={enrollment ? "Your enrolment" : "Choose how you learn"}
              hint={
                enrollment
                  ? `Enrolled ${enrollment.enrolledOn}. You can switch delivery mode once per module.`
                  : "Three ways to take the same course. Pick the one you can actually sustain."
              }
            />

            <div className="space-y-2">
              {(["onsite", "live", "self-paced"] as DeliveryMode[]).map((m) => {
                const offered = course.modes.includes(m);
                return (
                  <button
                    key={m}
                    type="button"
                    disabled={!offered}
                    onClick={() => setMode(m)}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-xl p-3.5 text-left ring-1 transition-all",
                      !offered && "cursor-not-allowed opacity-45",
                      mode === m && offered
                        ? "bg-navy-900 ring-navy-900"
                        : "bg-white ring-navy-200 hover:bg-navy-50/60",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 grid size-4.5 shrink-0 place-items-center rounded-full ring-1",
                        mode === m && offered
                          ? "bg-gold-400 ring-gold-400"
                          : "ring-navy-300",
                      )}
                    >
                      {mode === m && offered ? (
                        <Check
                          className="size-2.5 text-navy-900"
                          strokeWidth={4}
                        />
                      ) : null}
                    </span>
                    <span className="min-w-0">
                      <span
                        className={cn(
                          "block text-[0.88rem] font-bold",
                          mode === m && offered
                            ? "text-white"
                            : "text-navy-900",
                        )}
                      >
                        {modeLabels[m]}
                      </span>
                      <span
                        className={cn(
                          "mt-0.5 block text-[0.78rem] leading-snug",
                          mode === m && offered
                            ? "text-navy-200"
                            : "text-navy-500",
                        )}
                      >
                        {offered
                          ? m === "onsite"
                            ? course.hub
                            : modeBlurbs[m]
                          : "Not offered for this course yet"}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            <Button
              onClick={handleEnroll}
              disabled={!available}
              className={cn(
                "mt-4 h-11 w-full font-semibold",
                enrollment
                  ? "bg-navy-50 text-navy-800 hover:bg-navy-100"
                  : "bg-gold-400 text-navy-900 hover:bg-gold-300",
              )}
            >
              {enrollment
                ? enrollment.mode === mode
                  ? "You are enrolled"
                  : `Switch to ${modeLabels[mode].toLowerCase()}`
                : `Enrol — ${modeLabels[mode]}`}
            </Button>

            {enrollment ? (
              <div className="mt-4 space-y-2 border-t border-navy-100 pt-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-[0.8rem] font-semibold text-navy-600">
                    Mastery progress
                  </span>
                  <span className="font-heading text-[0.9rem] font-bold text-navy-900">
                    {enrollment.progress}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-navy-100">
                  <div
                    className="h-full rounded-full bg-navy-800"
                    style={{ width: `${enrollment.progress}%` }}
                  />
                </div>
              </div>
            ) : null}
          </Panel>

          <Panel>
            <PanelTitle title="Your tutor" />
            <div className="flex items-center gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-navy-800 font-heading text-[0.85rem] font-bold text-white">
                {course.tutor
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </span>
              <div>
                <p className="text-[0.92rem] font-bold text-navy-900">
                  {course.tutor}
                </p>
                <p className="text-[0.79rem] text-navy-500">
                  {course.tutorTitle}
                </p>
              </div>
            </div>
            <p className="mt-3.5 flex items-start gap-2 text-[0.82rem] leading-relaxed text-navy-500">
              <GraduationCap className="mt-0.5 size-3.5 shrink-0 text-navy-300" />
              Reviews submitted evidence within two working days and writes the
              feedback themselves — AI drafts it, a human sends it.
            </p>
            <p className="mt-2.5 flex items-start gap-2 text-[0.82rem] leading-relaxed text-navy-500">
              <Star className="mt-0.5 size-3.5 shrink-0 text-gold-400" />
              {course.rating.toFixed(1)} average from{" "}
              {course.learners.toLocaleString()} learners on this course.
            </p>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function HeroStat({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 text-[0.72rem] font-semibold tracking-wide text-navy-300 uppercase">
        <Icon className="size-3" />
        {label}
      </dt>
      <dd className="mt-1.5 font-heading text-[1.25rem] leading-none font-extrabold text-white">
        {value}
      </dd>
      <dd className="mt-1.5 text-[0.74rem] leading-snug text-navy-300">
        {sub}
      </dd>
    </div>
  );
}
