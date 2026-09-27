"use client";

import { ArrowRight } from "lucide-react";
import { LinkButton } from "@/components/app/link-button";
import { Panel, PanelTitle, StatRow, Tag } from "@/components/app/ui-bits";
import {
  countryDemand,
  courseBySlug,
  educatorProfile,
  evidenceQueue,
  learnerById,
  learners,
  skillGapData,
} from "@/lib/data";
import { usePlatform } from "@/lib/platform-store";
import { cn } from "@/lib/utils";

const riskStyles = {
  "on-track": "bg-ok-50 text-ok-600",
  watch: "bg-warn-50 text-warn-600",
  "at-risk": "bg-destructive/10 text-destructive",
} as const;

const riskLabels = {
  "on-track": "On track",
  watch: "Watch",
  "at-risk": "At risk",
} as const;

export function EducatorOverview() {
  const { evidenceStatus } = usePlatform();

  const queued = evidenceQueue.filter((item) => evidenceStatus[item.id] === "queued");
  const needsAttention = learners.filter((l) => l.risk !== "on-track");
  const averageProgress = Math.round(
    learners.reduce((s, l) => s + l.progress, 0) / learners.length,
  );
  const widestGap = [...skillGapData].sort(
    (a, b) => b.roles - b.verified - (a.roles - a.verified),
  )[0];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[1.45rem] leading-tight font-semibold sm:text-[1.6rem]">
            Good evening, {educatorProfile.name.split(" ")[0]}.
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            {educatorProfile.title} · {educatorProfile.cohorts} active cohorts
          </p>
        </div>
        {queued.length ? (
          <LinkButton href="/educator/evidence" variant="accent">
            Review {queued.length} submission{queued.length === 1 ? "" : "s"}
            <ArrowRight />
          </LinkButton>
        ) : null}
      </div>

      <StatRow
        items={[
          { label: "Waiting on you", value: queued.length },
          { label: "Active learners", value: learners.length },
          { label: "Average progress", value: `${averageProgress}%` },
          { label: "Widest skill gap", value: widestGap.roles - widestGap.verified },
        ]}
      />

      <Panel>
        <PanelTitle
          title={queued.length ? "Evidence waiting on you" : "Evidence queue is clear"}
          action={
            <LinkButton
              variant="ghost"
              size="sm"
              href={queued.length ? "/educator/evidence" : "/educator/roster"}
            >
              {queued.length ? "Open queue" : "Check the roster"}
            </LinkButton>
          }
        />
        {queued.length ? (
          <ul className="divide-y divide-ink-200">
            {queued.slice(0, 3).map((item) => {
              const learner = learnerById(item.learnerId);
              const course = courseBySlug(item.courseSlug);
              const unmet = item.rubric.filter((r) => !r.met).length;
              return (
                <li
                  key={item.id}
                  className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="mt-0.5 text-xs text-ink-500">
                      {learner?.name} · {course?.title} · {item.submitted}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <Tag>{item.competency}</Tag>
                      <Tag tone={unmet ? "outline" : "ok"}>
                        {unmet ? `${unmet} unmet` : "Rubric met"}
                      </Tag>
                    </div>
                  </div>
                  <LinkButton href="/educator/evidence" size="sm" className="shrink-0">
                    Review
                  </LinkButton>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="px-5 py-8 text-center text-sm text-ink-500">
            Every submission has been reviewed and sent back.
          </p>
        )}
      </Panel>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel>
          <PanelTitle
            title="Needs a conversation"
            action={
              <LinkButton variant="ghost" size="sm" href="/educator/roster">
                Full roster
              </LinkButton>
            }
          />
          <ul className="divide-y divide-ink-200">
            {needsAttention.map((learner) => (
              <li key={learner.id} className="px-5 py-3.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-navy-800 text-xs font-semibold text-white">
                      {learner.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{learner.name}</p>
                      <p className="truncate text-xs text-ink-500">
                        Last active {learner.lastActive}
                      </p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
                      riskStyles[learner.risk],
                    )}
                  >
                    {riskLabels[learner.risk]}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-ink-600">
                  {learner.note}
                </p>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel>
          <PanelTitle
            title="Widest demand gaps"
            action={
              <LinkButton variant="ghost" size="sm" href="/educator/intelligence">
                Dashboard
              </LinkButton>
            }
          />
          <ul className="divide-y divide-ink-200">
            {[...countryDemand]
              .sort((a, b) => b.gap - a.gap)
              .slice(0, 5)
              .map((country) => (
                <li key={country.code} className="flex items-center gap-3 px-5 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{country.country}</p>
                    <p className="truncate text-xs text-ink-500">
                      {country.openRoles} roles · {country.topSkill}
                    </p>
                  </div>
                  <div className="flex w-24 shrink-0 items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink-200">
                      <div
                        className="h-full rounded-full bg-gold-400"
                        style={{ width: `${country.gap}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium tabular-nums">
                      {country.gap}%
                    </span>
                  </div>
                </li>
              ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
