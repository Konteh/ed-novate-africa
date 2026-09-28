"use client";

import { useMemo, useState } from "react";
import { BriefcaseBusiness, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  EmptyState,
  PageHeader,
  Panel,
  StatRow,
  Tag,
} from "@/components/app/ui-bits";
import { employerById, openRoles } from "@/lib/data";
import { usePlatform } from "@/lib/platform-store";
import type { ApplicationStage } from "@/lib/types";
import { cn } from "@/lib/utils";

const stageLabels: Record<ApplicationStage, string> = {
  matched: "Matched",
  introduced: "Introduction sent",
  interviewing: "Interviewing",
  offer: "Offer",
};

const scopes = [
  { value: "gambia", label: "The Gambia" },
  { value: "region", label: "Across ECOWAS" },
] as const;

export function TalentBridge() {
  const { passport, applications, apply, applicationFor } = usePlatform();
  const [scope, setScope] = useState<"gambia" | "region">("gambia");
  const [onlyStrong, setOnlyStrong] = useState(false);

  const verifiedSkills = useMemo(
    () =>
      new Set(
        passport.filter((p) => p.status === "verified").map((p) => p.competency),
      ),
    [passport],
  );

  const scored = useMemo(
    () =>
      openRoles
        .map((role) => {
          const held = role.requires.filter((s) => verifiedSkills.has(s));
          return {
            role,
            held,
            score: Math.round((held.length / role.requires.length) * 100),
          };
        })
        .sort((a, b) => b.score - a.score),
    [verifiedSkills],
  );

  const visible = scored.filter(({ role, score }) => {
    const employer = employerById(role.employerId);
    if (scope === "gambia" && employer?.country !== "The Gambia") return false;
    if (onlyStrong && score < 60) return false;
    return true;
  });

  const strongCount = scored.filter((s) => s.score >= 60).length;

  return (
    <div className="space-y-5">
      <PageHeader title="Talent Bridge" />

      <StatRow
        items={[
          { label: "Strong matches", value: strongCount },
          { label: "Introductions sent", value: applications.length },
          { label: "Roles open to you", value: scored.length },
        ]}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1.5">
          {scopes.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setScope(s.value)}
              aria-pressed={scope === s.value}
              className={cn(
                "rounded-full border px-3 py-1.5 text-[0.8rem] font-medium transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-blue-500/45",
                scope === s.value
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-ink-200 bg-white text-ink-600 hover:border-ink-300 hover:text-ink-900",
              )}
            >
              {s.label}
            </button>
          ))}
        </div>

        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-700">
          <input
            type="checkbox"
            checked={onlyStrong}
            onChange={(e) => setOnlyStrong(e.target.checked)}
            className="peer sr-only"
          />
          <span
            className={cn(
              "relative h-5 w-9 rounded-full transition-colors duration-150 peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500/45 peer-focus-visible:ring-offset-2",
              onlyStrong ? "bg-blue-600" : "bg-ink-300",
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 size-4 rounded-full bg-white shadow-sm transition-all duration-150",
                onlyStrong ? "left-4.5" : "left-0.5",
              )}
            />
          </span>
          Strong matches only
        </label>
      </div>

      {visible.length === 0 ? (
        <Panel>
          <EmptyState
            icon={BriefcaseBusiness}
            title="No roles match those filters"
            action={
              <Button
                size="sm"
                onClick={() => {
                  setScope("region");
                  setOnlyStrong(false);
                }}
              >
                Search across ECOWAS
              </Button>
            }
          />
        </Panel>
      ) : (
        <div className="space-y-4">
          {visible.map(({ role, held, score }) => {
            const employer = employerById(role.employerId);
            const application = applicationFor(role.id);
            return (
              <Panel key={role.id}>
                <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold">{role.title}</h3>
                      {application ? (
                        <Tag tone="ok">{stageLabels[application.stage]}</Tag>
                      ) : score >= 60 ? (
                        <Tag tone="accent">Strong match</Tag>
                      ) : null}
                    </div>

                    <p className="mt-1 text-sm text-ink-500">
                      {employer?.name} · {role.location} · {role.mode} ·{" "}
                      {role.salaryGMD}
                    </p>

                    <div className="mt-3.5 flex flex-wrap gap-1.5">
                      {role.requires.map((skill) => {
                        const has = held.includes(skill);
                        return (
                          <Tag key={skill} tone={has ? "ok" : "outline"}>
                            {has ? "✓ " : ""}
                            {skill}
                          </Tag>
                        );
                      })}
                    </div>

                    <p className="mt-3.5 text-sm leading-relaxed text-ink-600">
                      {role.rationale}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-5 sm:w-40 sm:flex-col sm:gap-4">
                    <MatchDial score={score} />
                    {application ? (
                      <p className="text-center text-xs text-ink-500">
                        Sent {application.appliedOn}
                      </p>
                    ) : (
                      <Button
                        variant={score >= 60 ? "accent" : "outline"}
                        className="w-full"
                        onClick={() => {
                          apply(role.id);
                          toast.success(
                            `Introduction sent to ${employer?.name}`,
                            {
                              description:
                                "They receive your verified skills and the match reason.",
                            },
                          );
                        }}
                      >
                        <Send />
                        Ask for an intro
                      </Button>
                    )}
                  </div>
                </div>
              </Panel>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MatchDial({ score }: { score: number }) {
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const tone =
    score >= 60 ? "text-ok-600" : score >= 34 ? "text-gold-400" : "text-ink-300";

  return (
    <div className="relative grid size-20 shrink-0 place-items-center">
      <svg viewBox="0 0 80 80" className="size-20 -rotate-90">
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          strokeWidth="6"
          className="stroke-ink-200"
        />
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - score / 100)}
          className={cn("stroke-current transition-all duration-700", tone)}
        />
      </svg>
      <p className="absolute text-lg font-semibold tabular-nums">{score}%</p>
    </div>
  );
}
