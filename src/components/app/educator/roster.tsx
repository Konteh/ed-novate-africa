"use client";

import { useMemo, useState } from "react";
import { Search, SearchX, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LinkButton } from "@/components/app/link-button";
import {
  EmptyState,
  PageHeader,
  Panel,
  StatTile,
} from "@/components/app/ui-bits";
import { courseBySlug, learners, modeLabels } from "@/lib/data";
import type { Learner } from "@/lib/types";
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

const cohorts = ["All cohorts", ...new Set(learners.map((l) => l.cohort))];

export function CohortRoster() {
  const [query, setQuery] = useState("");
  const [cohort, setCohort] = useState("All cohorts");
  const [risk, setRisk] = useState<Learner["risk"] | "all">("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return learners.filter((learner) => {
      if (cohort !== "All cohorts" && learner.cohort !== cohort) return false;
      if (risk !== "all" && learner.risk !== risk) return false;
      if (!q) return true;
      return (
        learner.name.toLowerCase().includes(q) ||
        learner.location.toLowerCase().includes(q) ||
        learner.cohort.toLowerCase().includes(q)
      );
    });
  }, [query, cohort, risk]);

  const clear = () => {
    setQuery("");
    setCohort("All cohorts");
    setRisk("all");
  };

  const avg = filtered.length
    ? Math.round(filtered.reduce((s, l) => s + l.progress, 0) / filtered.length)
    : 0;
  const verifiedTotal = filtered.reduce((s, l) => s + l.verified, 0);
  const pendingTotal = filtered.reduce((s, l) => s + l.pending, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Cohort roster"
        title="Every learner's progress in one place"
        description="Mastery progress, verified competencies and what is outstanding. Flags are automatic; the conversation is still yours to have."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile
          label="Learners shown"
          value={filtered.length}
          sub={`${avg}% average mastery progress`}
          icon={Users}
        />
        <StatTile
          label="Verified competencies"
          value={verifiedTotal}
          sub="Signed off across this selection"
          tone="teal"
        />
        <StatTile
          label="Submissions pending"
          value={pendingTotal}
          sub="Waiting on a review from you"
          tone="gold"
        />
      </div>

      <div className="space-y-3 rounded-2xl bg-white p-4 ring-1 ring-navy-100 sm:p-5">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-navy-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a learner, a town or a cohort"
            className="h-11 pl-9"
            aria-label="Search learners"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {cohorts.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCohort(c)}
              aria-pressed={cohort === c}
              className={cn(
                "rounded-full px-3 py-1.5 text-[0.79rem] font-medium transition-colors",
                cohort === c
                  ? "bg-navy-900 text-white"
                  : "bg-navy-50 text-navy-600 hover:bg-navy-100",
              )}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5 border-t border-navy-100 pt-3">
          {(["all", "on-track", "watch", "at-risk"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRisk(r)}
              aria-pressed={risk === r}
              className={cn(
                "rounded-full px-3 py-1.5 text-[0.79rem] font-medium transition-colors",
                risk === r
                  ? "bg-gold-400 text-navy-900"
                  : "bg-navy-50 text-navy-600 hover:bg-navy-100",
              )}
            >
              {r === "all" ? "Everyone" : riskLabels[r]}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No learners match that filter"
          body="Try a different cohort, or clear the risk filter. This prototype roster holds ten learners across five cohorts."
          action={
            <Button onClick={clear} className="h-10 bg-navy-900 px-4">
              Clear the filters
            </Button>
          }
        />
      ) : (
        <>
          {/* Desktop table */}
          <Panel className="hidden overflow-hidden p-0! lg:block">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-navy-100 bg-navy-50/60">
                  {[
                    "Learner",
                    "Cohort & course",
                    "Delivery",
                    "Mastery progress",
                    "Passport",
                    "Last active",
                    "Flag",
                  ].map((head) => (
                    <th
                      key={head}
                      className="px-4 py-3 text-[0.72rem] font-bold tracking-wide text-navy-500 uppercase"
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((learner) => {
                  const course = courseBySlug(learner.courseSlug);
                  return (
                    <tr
                      key={learner.id}
                      className="border-b border-navy-100 last:border-0 hover:bg-navy-50/40"
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-navy-800 font-heading text-[0.7rem] font-bold text-white">
                            {learner.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                          <div>
                            <p className="text-[0.87rem] font-bold text-navy-900">
                              {learner.name}
                            </p>
                            <p className="text-[0.74rem] text-navy-500">
                              {learner.location}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-[0.82rem] font-medium text-navy-800">
                          {learner.cohort}
                        </p>
                        <p className="text-[0.74rem] text-navy-500">
                          {course?.title}
                        </p>
                      </td>
                      <td className="px-4 py-3.5 text-[0.8rem] text-navy-600">
                        {modeLabels[learner.mode]}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-navy-100">
                            <div
                              className={cn(
                                "h-full rounded-full",
                                learner.progress >= 60
                                  ? "bg-teal-500"
                                  : learner.progress >= 35
                                    ? "bg-gold-400"
                                    : "bg-destructive",
                              )}
                              style={{ width: `${learner.progress}%` }}
                            />
                          </div>
                          <span className="font-heading text-[0.8rem] font-bold text-navy-900">
                            {learner.progress}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-[0.8rem] text-navy-600">
                        <span className="font-semibold text-teal-700">
                          {learner.verified}
                        </span>{" "}
                        verified
                        {learner.pending ? (
                          <span className="text-gold-700">
                            {" "}
                            · {learner.pending} pending
                          </span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3.5 text-[0.8rem] text-navy-500">
                        {learner.lastActive}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-1 text-[0.66rem] font-bold tracking-wide uppercase",
                            riskStyles[learner.risk],
                          )}
                        >
                          {riskLabels[learner.risk]}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Panel>

          {/* Mobile cards */}
          <div className="space-y-3 lg:hidden">
            {filtered.map((learner) => {
              const course = courseBySlug(learner.courseSlug);
              return (
                <Panel key={learner.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-navy-800 font-heading text-[0.75rem] font-bold text-white">
                        {learner.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                      <div>
                        <p className="text-[0.9rem] font-bold text-navy-900">
                          {learner.name}
                        </p>
                        <p className="text-[0.75rem] text-navy-500">
                          {learner.location} · {modeLabels[learner.mode]}
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
                  <p className="mt-3 text-[0.8rem] text-navy-600">
                    {course?.title}
                  </p>
                  <div className="mt-3 flex items-center gap-2.5">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-navy-100">
                      <div
                        className="h-full rounded-full bg-navy-800"
                        style={{ width: `${learner.progress}%` }}
                      />
                    </div>
                    <span className="font-heading text-[0.8rem] font-bold text-navy-900">
                      {learner.progress}%
                    </span>
                  </div>
                  <p className="mt-3 text-[0.8rem] text-navy-500">
                    {learner.verified} verified · {learner.pending} pending ·
                    last active {learner.lastActive}
                  </p>
                  <p className="mt-2.5 border-t border-navy-100 pt-2.5 text-[0.82rem] leading-relaxed text-navy-600">
                    {learner.note}
                  </p>
                </Panel>
              );
            })}
          </div>
        </>
      )}

      <Panel className="bg-navy-50/50">
        <p className="text-[0.87rem] leading-relaxed text-navy-600">
          <span className="font-semibold text-navy-900">
            Pending is on you, not them.
          </span>{" "}
          A learner marked pending has already done the work and is waiting for
          a review. Clearing the queue is usually the fastest way to move a
          cohort.
        </p>
        <div className="mt-4">
          <LinkButton
            href="/educator/evidence"
            variant="outline"
            className="h-9"
          >
            Open the evidence queue
          </LinkButton>
        </div>
      </Panel>
    </div>
  );
}
