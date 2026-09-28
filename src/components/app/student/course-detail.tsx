"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/app/link-button";
import { Panel, PanelTitle, StatusPill, Tag } from "@/components/app/ui-bits";
import { employerById, modeBlurbs, modeLabels, openRoles, trackById } from "@/lib/data";
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
  const relatedRoles = openRoles.filter((r) => r.trackFit === course.track).slice(0, 3);
  const modulesDone = Math.floor(
    (course.modules.length * (enrollment?.progress ?? 0)) / 100,
  );

  const statusFor = (skill: string) =>
    passport.find((p) => p.competency === skill)?.status ?? "not-started";

  const handleEnroll = () => {
    enroll(course.slug, mode);
    toast.success(`Enrolled in ${course.title}`, {
      description: `${modeLabels[mode]} · ${course.weeks} weeks · ${course.tutor} is your tutor.`,
    });
  };

  const meta = [
    { label: "Length", value: `${course.weeks} weeks` },
    { label: "Effort", value: `${course.hoursPerWeek}h a week` },
    { label: "Open roles", value: String(course.openRoles) },
    { label: "Fee", value: `D${course.feeGMD.toLocaleString()}` },
  ];

  return (
    <div className="space-y-5">
      <LinkButton variant="ghost" size="sm" href="/student/studio" className="-ml-2">
        <ArrowLeft />
        All courses
      </LinkButton>

      <div>
        <div className="flex flex-wrap items-center gap-2">
          <Tag>{trackById(course.track).name}</Tag>
          <Tag tone="outline">{course.level}</Tag>
          {enrollment ? (
            <Tag tone="ok" className="gap-1">
              <Check className="size-3" strokeWidth={3} />
              Enrolled
            </Tag>
          ) : null}
        </div>
        <h1 className="mt-3 max-w-3xl text-[1.6rem] leading-tight font-semibold sm:text-[2rem]">
          {course.title}
        </h1>
        <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-ink-600">
          {course.description}
        </p>
      </div>

      <dl className="grid grid-cols-2 divide-ink-200 overflow-hidden rounded-xl border border-ink-200 bg-white shadow-card sm:grid-cols-4 sm:divide-x">
        {meta.map((item) => (
          <div key={item.label} className="px-5 py-4">
            <dt className="text-xs font-medium text-ink-500">{item.label}</dt>
            <dd className="mt-1 text-base font-semibold">{item.value}</dd>
          </div>
        ))}
      </dl>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr] lg:items-start">
        <div className="space-y-5">
          <Panel>
            <PanelTitle title={`${course.modules.length} modules`} />
            <ul className="divide-y divide-ink-200">
              {course.modules.map((module, i) => {
                const open = openModule === i;
                const done = i < modulesDone;
                return (
                  <li key={module.name}>
                    <button
                      type="button"
                      onClick={() => setOpenModule(open ? null : i)}
                      aria-expanded={open}
                      className="flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-ink-50"
                    >
                      <span
                        className={cn(
                          "grid size-6 shrink-0 place-items-center rounded-full text-xs font-semibold",
                          done ? "bg-ok-600 text-white" : "bg-ink-100 text-ink-600",
                        )}
                      >
                        {done ? <Check className="size-3" strokeWidth={3} /> : i + 1}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium">{module.name}</span>
                        <span className="mt-0.5 block text-xs text-ink-500">
                          {module.hours} hours
                        </span>
                      </span>
                      <ChevronDown
                        className={cn(
                          "size-4 shrink-0 text-ink-400 transition-transform duration-200",
                          open && "rotate-180",
                        )}
                      />
                    </button>
                    {open ? (
                      <div className="bg-ink-50 px-5 py-4 pl-14">
                        <p className="text-sm leading-relaxed text-ink-600">
                          {module.summary}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {module.competencies.map((c) => (
                            <Tag key={c}>{c}</Tag>
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
              title="Skills you'll add"
              action={
                <LinkButton variant="ghost" size="sm" href="/student/passport">
                  Passport
                </LinkButton>
              }
            />
            <ul className="grid gap-px bg-ink-200 sm:grid-cols-2">
              {course.skills.map((skill) => (
                <li
                  key={skill}
                  className="flex items-center justify-between gap-2 bg-white px-5 py-3"
                >
                  <span className="truncate text-sm">{skill}</span>
                  <StatusPill status={statusFor(skill)} />
                </li>
              ))}
            </ul>
          </Panel>

          <Panel>
            <PanelTitle title="Roles this leads to" />
            <ul className="divide-y divide-ink-200">
              {relatedRoles.map((role) => {
                const employer = employerById(role.employerId);
                return (
                  <li key={role.id}>
                    <Link
                      href="/student/bridge"
                      className="flex items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-ink-50"
                    >
                      <span className="min-w-0">
                        <span className="block text-sm font-medium">{role.title}</span>
                        <span className="mt-0.5 block truncate text-xs text-ink-500">
                          {employer?.name} · {role.location} · {role.salaryGMD}
                        </span>
                      </span>
                      <ArrowRight className="size-4 shrink-0 text-ink-400" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Panel>
        </div>

        <div className="space-y-5 lg:sticky lg:top-6">
          <Panel>
            <PanelTitle title={enrollment ? "Your enrolment" : "How you'll learn"} />
            <div className="space-y-2 p-5">
              {(["onsite", "live", "self-paced"] as DeliveryMode[]).map((m) => {
                const offered = course.modes.includes(m);
                const picked = mode === m && offered;
                return (
                  <button
                    key={m}
                    type="button"
                    disabled={!offered}
                    aria-pressed={picked}
                    onClick={() => setMode(m)}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-lg border p-3.5 text-left transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-blue-500/45",
                      !offered && "cursor-not-allowed opacity-45",
                      picked
                        ? "border-blue-600 bg-blue-600"
                        : "border-ink-200 hover:border-ink-300 hover:bg-ink-50",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border",
                        picked ? "border-gold-400 bg-gold-400" : "border-ink-300",
                      )}
                    >
                      {picked ? (
                        <Check className="size-2.5 text-white" strokeWidth={4} />
                      ) : null}
                    </span>
                    <span className="min-w-0">
                      <span
                        className={cn(
                          "block text-sm font-medium",
                          picked ? "text-white" : "text-ink-900",
                        )}
                      >
                        {modeLabels[m]}
                      </span>
                      <span
                        className={cn(
                          "mt-0.5 block text-xs leading-snug",
                          picked ? "text-blue-200" : "text-ink-500",
                        )}
                      >
                        {offered
                          ? m === "onsite"
                            ? course.hub
                            : modeBlurbs[m]
                          : "Not offered yet"}
                      </span>
                    </span>
                  </button>
                );
              })}

              {enrollment?.mode === mode ? (
                <p className="mt-2 flex items-center justify-center gap-1.5 rounded-lg bg-ok-50 py-2.5 text-sm font-medium text-ok-600">
                  <Check className="size-4" strokeWidth={2.5} />
                  Enrolled {modeLabels[mode].toLowerCase()}
                </p>
              ) : (
                <Button
                  onClick={handleEnroll}
                  disabled={!available}
                  variant={enrollment ? "outline" : "accent"}
                  size="lg"
                  className="mt-2 w-full"
                >
                  {enrollment
                    ? `Switch to ${modeLabels[mode].toLowerCase()}`
                    : `Enrol — ${modeLabels[mode]}`}
                </Button>
              )}

              {enrollment ? (
                <div className="border-t border-ink-200 pt-4">
                  <div className="flex items-baseline justify-between text-sm">
                    <span className="text-ink-500">Mastery progress</span>
                    <span className="font-semibold tabular-nums">
                      {enrollment.progress}%
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink-200">
                    <div
                      className="h-full rounded-full bg-blue-600 transition-[width] duration-500"
                      style={{ width: `${enrollment.progress}%` }}
                    />
                  </div>
                </div>
              ) : null}
            </div>
          </Panel>

          <Panel>
            <PanelTitle title="Your tutor" />
            <div className="flex items-center gap-3 p-5">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                {course.tutor
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold">{course.tutor}</p>
                <p className="truncate text-xs text-ink-500">{course.tutorTitle}</p>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
