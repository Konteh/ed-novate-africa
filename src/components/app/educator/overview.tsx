"use client";

import {
  ArrowRight,
  ClipboardCheck,
  Globe2,
  TriangleAlert,
  Users,
} from "lucide-react";
import { LinkButton } from "@/components/app/link-button";
import {
  Panel,
  PanelTitle,
  StatTile,
  Tag,
} from "@/components/app/ui-bits";
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
  "on-track": "bg-teal-100 text-teal-700",
  watch: "bg-gold-100 text-gold-700",
  "at-risk": "bg-destructive/10 text-destructive",
} as const;

const riskLabels = {
  "on-track": "On track",
  watch: "Watch",
  "at-risk": "At risk",
} as const;

export function EducatorOverview() {
  const { evidenceStatus } = usePlatform();

  const queued = evidenceQueue.filter(
    (item) => evidenceStatus[item.id] === "queued",
  );
  const needsAttention = learners.filter((l) => l.risk !== "on-track");
  const averageProgress = Math.round(
    learners.reduce((s, l) => s + l.progress, 0) / learners.length,
  );
  const widestGap = [...skillGapData].sort(
    (a, b) => b.roles - b.verified - (a.roles - a.verified),
  )[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow text-gold-600">Your cohorts</p>
          <h1 className="mt-2 font-heading text-[1.7rem] leading-tight font-extrabold text-navy-900 sm:text-[2rem]">
            Good evening, {educatorProfile.name.split(" ")[0]}.
          </h1>
          <p className="mt-2.5 text-[0.95rem] text-navy-500">
            {educatorProfile.title} · {educatorProfile.location} ·{" "}
            {educatorProfile.cohorts} active cohorts
          </p>
        </div>
        <LinkButton
          href="/educator/evidence"
          className="h-10 bg-gold-400 px-4 font-semibold text-navy-900 hover:bg-gold-300"
        >
          Clear the evidence queue
          <ArrowRight className="size-3.5" />
        </LinkButton>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Waiting on you"
          value={queued.length}
          sub="Submissions blocked on a review, not on a learner"
          icon={ClipboardCheck}
          tone="navy"
        />
        <StatTile
          label="Active learners"
          value={learners.length}
          sub={`${averageProgress}% average mastery progress`}
          icon={Users}
        />
        <StatTile
          label="Need attention"
          value={needsAttention.length}
          sub="Flagged by attendance or submission gaps"
          icon={TriangleAlert}
          tone="gold"
        />
        <StatTile
          label="Widest regional gap"
          value={`${widestGap.roles - widestGap.verified}`}
          sub={`${widestGap.skill}: ${widestGap.roles} roles, ${widestGap.verified} verified learners`}
          icon={Globe2}
          tone="teal"
        />
      </div>

      {queued.length ? (
        <Panel>
          <PanelTitle
            title="Evidence waiting on your review"
            hint="AI drafts the feedback against the published rubric. You edit it and decide — nothing is verified automatically."
            action={
              <LinkButton
                href="/educator/evidence"
                variant="outline"
                className="h-9"
              >
                Open the queue
              </LinkButton>
            }
          />
          <ul className="space-y-2.5">
            {queued.slice(0, 3).map((item) => {
              const learner = learnerById(item.learnerId);
              const course = courseBySlug(item.courseSlug);
              const unmet = item.rubric.filter((r) => !r.met).length;
              return (
                <li
                  key={item.id}
                  className="flex flex-col gap-3 rounded-xl p-4 ring-1 ring-navy-100 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="text-[0.92rem] font-bold text-navy-900">
                      {item.title}
                    </p>
                    <p className="mt-1 text-[0.79rem] text-navy-500">
                      {learner?.name} · {course?.title} · submitted{" "}
                      {item.submitted}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <Tag tone="gold" className="text-[0.68rem]">
                        {item.competency}
                      </Tag>
                      <Tag
                        tone={unmet ? "outline" : "teal"}
                        className="text-[0.68rem]"
                      >
                        {unmet
                          ? `${unmet} rubric criteri${unmet === 1 ? "on" : "a"} unmet`
                          : "All rubric criteria met"}
                      </Tag>
                    </div>
                  </div>
                  <LinkButton
                    href="/educator/evidence"
                    className="h-9 shrink-0 bg-navy-900 px-3.5 font-semibold hover:bg-navy-800"
                  >
                    Review
                  </LinkButton>
                </li>
              );
            })}
          </ul>
        </Panel>
      ) : (
        <Panel className="bg-teal-100/30 ring-teal-100">
          <PanelTitle
            title="Your evidence queue is clear"
            hint="Every submission has been reviewed and the feedback sent. Learners are now waiting on themselves, not on you."
          />
          <LinkButton href="/educator/roster" variant="outline" className="h-9">
            Check on the roster instead
          </LinkButton>
        </Panel>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel>
          <PanelTitle
            title="Learners who need a conversation"
            hint="Flagged automatically, but the platform will not message them for you."
            action={
              <LinkButton
                href="/educator/roster"
                variant="ghost"
                className="h-8 text-navy-600"
              >
                Full roster
              </LinkButton>
            }
          />
          <ul className="space-y-2.5">
            {needsAttention.map((learner) => (
              <li
                key={learner.id}
                className="rounded-xl p-3.5 ring-1 ring-navy-100"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-navy-800 font-heading text-[0.72rem] font-bold text-white">
                      {learner.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                    <div>
                      <p className="text-[0.88rem] font-bold text-navy-900">
                        {learner.name}
                      </p>
                      <p className="text-[0.75rem] text-navy-500">
                        {learner.location} · last active {learner.lastActive}
                      </p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2.5 py-1 text-[0.66rem] font-bold tracking-wide uppercase",
                      riskStyles[learner.risk],
                    )}
                  >
                    {riskLabels[learner.risk]}
                  </span>
                </div>
                <p className="mt-2.5 text-[0.83rem] leading-relaxed text-navy-600">
                  {learner.note}
                </p>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel>
          <PanelTitle
            title="Where demand is running ahead of supply"
            hint="The five countries with the widest gap between open roles and verified learners."
            action={
              <LinkButton
                href="/educator/intelligence"
                variant="ghost"
                className="h-8 text-navy-600"
              >
                Full dashboard
              </LinkButton>
            }
          />
          <ul className="space-y-2">
            {[...countryDemand]
              .sort((a, b) => b.gap - a.gap)
              .slice(0, 5)
              .map((country) => (
                <li
                  key={country.code}
                  className="flex items-center gap-3 rounded-lg bg-navy-50/60 px-3.5 py-2.5"
                >
                  <span className="w-8 shrink-0 font-mono text-[0.75rem] font-bold text-navy-400">
                    {country.code}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[0.85rem] font-semibold text-navy-800">
                      {country.country}
                    </p>
                    <p className="text-[0.74rem] text-navy-500">
                      {country.openRoles} roles · {country.topSkill}
                    </p>
                  </div>
                  <div className="flex w-28 shrink-0 items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-navy-100">
                      <div
                        className="h-full rounded-full bg-gold-400"
                        style={{ width: `${country.gap}%` }}
                      />
                    </div>
                    <span className="font-heading text-[0.78rem] font-bold text-navy-800">
                      {country.gap}%
                    </span>
                  </div>
                </li>
              ))}
          </ul>
          <p className="mt-4 text-[0.78rem] leading-relaxed text-navy-400">
            Gap is the share of open roles with no verified learner matched to
            the screening competency.
          </p>
        </Panel>
      </div>

      <Panel className="bg-navy-50/50">
        <p className="text-[0.87rem] leading-relaxed text-navy-600">
          <span className="font-semibold text-navy-900">
            Why this dashboard exists.
          </span>{" "}
          Every submission, verification and employer match feeds the regional
          picture anonymously. It is the same data your learners generate by
          working — you are just the first person who gets to act on it.
        </p>
        <p className="mt-3 text-[0.78rem] text-navy-400">
          Prototype — every figure on this page is illustrative demo data.
        </p>
      </Panel>
    </div>
  );
}
