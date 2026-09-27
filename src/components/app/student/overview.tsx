"use client";

import Link from "next/link";
import { ArrowRight, Check, ChevronRight } from "lucide-react";
import { LinkButton } from "@/components/app/link-button";
import {
  Panel,
  PanelTitle,
  StatRow,
  StatusPill,
  Tag,
} from "@/components/app/ui-bits";
import {
  courseBySlug,
  employerById,
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
  const matches = openRoles.filter((r) => r.trackFit === matchTrack).slice(0, 2);

  const nextAction = !compass
    ? {
        title: "Find your track",
        body: "Five questions, then a course picked for you.",
        href: "/student/compass",
        cta: "Start Career Compass",
      }
    : inReview > 0
      ? {
          title: `${inReview} submission${inReview > 1 ? "s" : ""} with your tutor`,
          body: "Reviewed within two working days.",
          href: "/student/passport",
          cta: "Open passport",
        }
      : {
          title: "Employers are hiring for your skills",
          body: "Every match shows the reason it was made.",
          href: "/student/bridge",
          cta: "See matches",
        };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[1.45rem] leading-tight font-semibold sm:text-[1.6rem]">
            Good to see you, {studentProfile.name.split(" ")[0]}.
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            {studentProfile.cohort} · {studentProfile.location}
          </p>
        </div>
        <LinkButton href="/student/studio" variant="outline">
          Browse courses
        </LinkButton>
      </div>

      <StatRow
        items={[
          { label: "Verified skills", value: verified },
          { label: "With your tutor", value: inReview },
          { label: "Employer views", value: employerViews },
          {
            label: "Open matches",
            value: matches.length + applications.length,
          },
        ]}
      />

      <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-5">
          <div className="flex flex-col gap-4 rounded-xl bg-navy-900 p-6 text-white sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">
                {nextAction.title}
              </h2>
              <p className="mt-1 text-sm text-navy-200">{nextAction.body}</p>
            </div>
            <LinkButton
              href={nextAction.href}
              variant="accent"
              size="lg"
              className="shrink-0"
            >
              {nextAction.cta}
              <ArrowRight />
            </LinkButton>
          </div>

          {course && primary ? (
            <Panel>
              <PanelTitle
                title="Current course"
                action={
                  <LinkButton
                    variant="ghost"
                    size="sm"
                    href={`/student/studio/${course.slug}`}
                  >
                    Open
                    <ChevronRight />
                  </LinkButton>
                }
              />
              <div className="p-5">
                <h3 className="text-base font-semibold">{course.title}</h3>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  <Tag>{trackById(course.track).name}</Tag>
                  <Tag tone="outline">{course.level}</Tag>
                  <Tag tone="outline">
                    {primary.mode === "onsite"
                      ? course.hub
                      : primary.mode === "live"
                        ? "Live tutor-led"
                        : "Self-paced"}
                  </Tag>
                </div>

                <div className="mt-5 flex items-baseline justify-between text-sm">
                  <span className="text-ink-500">Mastery progress</span>
                  <span className="font-semibold tabular-nums">
                    {primary.progress}%
                  </span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink-200">
                  <div
                    className="h-full rounded-full bg-navy-800 transition-[width] duration-500"
                    style={{ width: `${primary.progress}%` }}
                  />
                </div>
              </div>

              <ul className="divide-y divide-ink-200 border-t border-ink-200">
                {course.modules.map((module, i) => {
                  const done =
                    i < Math.floor((course.modules.length * primary.progress) / 100);
                  return (
                    <li
                      key={module.name}
                      className="flex items-center gap-3 px-5 py-2.5"
                    >
                      <span
                        className={cn(
                          "grid size-5 shrink-0 place-items-center rounded-full text-[0.65rem] font-semibold",
                          done ? "bg-ok-50 text-ok-600" : "bg-ink-100 text-ink-500",
                        )}
                      >
                        {done ? <Check className="size-3" strokeWidth={3} /> : i + 1}
                      </span>
                      <span
                        className={cn(
                          "flex-1 truncate text-sm",
                          done ? "text-ink-500" : "text-ink-900",
                        )}
                      >
                        {module.name}
                      </span>
                      {!done ? (
                        <span className="shrink-0 text-xs text-ink-400">
                          {module.hours}h
                        </span>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </Panel>
          ) : null}
        </div>

        <div className="space-y-5">
          <Panel>
            <PanelTitle
              title="Skills Passport"
              action={
                <LinkButton variant="ghost" size="sm" href="/student/passport">
                  All
                  <ChevronRight />
                </LinkButton>
              }
            />
            <ul className="divide-y divide-ink-200">
              {passport.slice(0, 5).map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-center justify-between gap-3 px-5 py-3"
                >
                  <span className="truncate text-sm">{entry.competency}</span>
                  <StatusPill status={entry.status} />
                </li>
              ))}
            </ul>
          </Panel>

          <Panel>
            <PanelTitle
              title="Roles for your track"
              action={
                <LinkButton variant="ghost" size="sm" href="/student/bridge">
                  All
                  <ChevronRight />
                </LinkButton>
              }
            />
            <ul className="divide-y divide-ink-200">
              {matches.map((role) => {
                const employer = employerById(role.employerId);
                return (
                  <li key={role.id}>
                    <Link
                      href="/student/bridge"
                      className="block px-5 py-3.5 transition-colors hover:bg-ink-50"
                    >
                      <p className="text-sm font-semibold">{role.title}</p>
                      <p className="mt-0.5 text-xs text-ink-500">
                        {employer?.name} · {role.location}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {role.requires.map((skill) => {
                          const held = passport.some(
                            (p) =>
                              p.competency === skill && p.status === "verified",
                          );
                          return (
                            <Tag key={skill} tone={held ? "ok" : "outline"}>
                              {skill}
                            </Tag>
                          );
                        })}
                      </div>
                    </Link>
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
