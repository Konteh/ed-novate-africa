"use client";

import { useMemo, useState } from "react";
import { Search, SearchX, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  EmptyState,
  PageHeader,
  Panel,
  StatRow,
} from "@/components/app/ui-bits";
import { courseBySlug, learners, modeLabels } from "@/lib/data";
import type { Learner } from "@/lib/types";
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

  const dirty = query !== "" || cohort !== "All cohorts" || risk !== "all";

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
    <div className="space-y-5">
      <PageHeader title="Cohort roster" />

      <StatRow
        items={[
          { label: "Learners shown", value: filtered.length },
          { label: "Average progress", value: `${avg}%` },
          { label: "Verified skills", value: verifiedTotal },
          { label: "Pending review", value: pendingTotal },
        ]}
      />

      <div className="space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a learner, town or cohort"
            className="h-10 bg-white pl-9"
            aria-label="Search learners"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1.5 text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"
            >
              <X className="size-3.5" />
            </button>
          ) : null}
        </div>

        <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          {cohorts.map((c) => (
            <Pill
              key={c}
              active={cohort === c}
              onClick={() => setCohort(c)}
              label={c}
            />
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {(["all", "on-track", "watch", "at-risk"] as const).map((r) => (
            <Pill
              key={r}
              active={risk === r}
              onClick={() => setRisk(r)}
              label={r === "all" ? "Everyone" : riskLabels[r]}
            />
          ))}
          {dirty ? (
            <Button variant="ghost" size="sm" onClick={clear} className="ml-auto">
              Clear filters
            </Button>
          ) : null}
        </div>
      </div>

      {filtered.length === 0 ? (
        <Panel>
          <EmptyState
            icon={SearchX}
            title="No learners match those filters"
            action={
              <Button size="sm" onClick={clear}>
                Clear filters
              </Button>
            }
          />
        </Panel>
      ) : (
        <>
          <Panel className="hidden overflow-hidden lg:block">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-ink-200">
                  {["Learner", "Cohort", "Mode", "Progress", "Passport", "Last active", ""].map(
                    (head) => (
                      <th
                        key={head}
                        className="px-4 py-2.5 text-xs font-medium text-ink-500"
                      >
                        {head}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-200">
                {filtered.map((learner) => {
                  const course = courseBySlug(learner.courseSlug);
                  return (
                    <tr key={learner.id} className="transition-colors hover:bg-ink-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-navy-800 text-xs font-semibold text-white">
                            {learner.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                          <div>
                            <p className="text-sm font-medium">{learner.name}</p>
                            <p className="text-xs text-ink-500">{learner.location}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm">{learner.cohort}</p>
                        <p className="text-xs text-ink-500">{course?.title}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-ink-600">
                        {modeLabels[learner.mode]}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-ink-200">
                            <div
                              className={cn(
                                "h-full rounded-full",
                                learner.progress >= 60
                                  ? "bg-ok-600"
                                  : learner.progress >= 35
                                    ? "bg-gold-400"
                                    : "bg-destructive",
                              )}
                              style={{ width: `${learner.progress}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium tabular-nums">
                            {learner.progress}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-ink-600 tabular-nums">
                        {learner.verified} verified
                        {learner.pending ? ` · ${learner.pending} pending` : ""}
                      </td>
                      <td className="px-4 py-3 text-sm text-ink-500">
                        {learner.lastActive}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap",
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

          <div className="space-y-3 lg:hidden">
            {filtered.map((learner) => {
              const course = courseBySlug(learner.courseSlug);
              return (
                <Panel key={learner.id}>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-navy-800 text-xs font-semibold text-white">
                          {learner.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{learner.name}</p>
                          <p className="truncate text-xs text-ink-500">
                            {learner.location} · {modeLabels[learner.mode]}
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

                    <p className="mt-3 text-sm text-ink-600">{course?.title}</p>

                    <div className="mt-3 flex items-center gap-2.5">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink-200">
                        <div
                          className="h-full rounded-full bg-navy-800"
                          style={{ width: `${learner.progress}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium tabular-nums">
                        {learner.progress}%
                      </span>
                    </div>

                    <p className="mt-3 text-xs text-ink-500">
                      {learner.verified} verified · {learner.pending} pending · last
                      active {learner.lastActive}
                    </p>
                  </div>
                </Panel>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function Pill({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "shrink-0 rounded-full border px-3 py-1.5 text-[0.8rem] font-medium transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-navy-500/45",
        active
          ? "border-navy-900 bg-navy-900 text-white"
          : "border-ink-200 bg-white text-ink-600 hover:border-ink-300 hover:text-ink-900",
      )}
    >
      {label}
    </button>
  );
}
