"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  Check,
  Handshake,
  Info,
  MapPin,
  Send,
  Sparkles,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/app/link-button";
import {
  EmptyState,
  PageHeader,
  Panel,
  PanelTitle,
  StatTile,
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
    const inGambia = employer?.country === "The Gambia";
    if (scope === "gambia" && !inGambia) return false;
    if (onlyStrong && score < 60) return false;
    return true;
  });

  const strongCount = scored.filter((s) => s.score >= 60).length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Step 4 · Talent Bridge"
        title="A straight line to employers"
        description="Employers search verified competencies, not degree names. Every match below shows which of your verified skills did the work — and which one is missing."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile
          label="Strong matches"
          value={strongCount}
          sub="60% or more of the screening competencies verified"
          icon={Sparkles}
          tone="gold"
        />
        <StatTile
          label="Introductions in progress"
          value={applications.length}
          sub="An employer has your passport and the match reason"
          icon={Handshake}
          tone="navy"
        />
        <StatTile
          label="Roles open to you"
          value={scored.length}
          sub="Across The Gambia and five ECOWAS countries"
          icon={BriefcaseBusiness}
        />
      </div>

      <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 ring-1 ring-navy-100 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex gap-1.5">
          {scopes.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setScope(s.value)}
              aria-pressed={scope === s.value}
              className={cn(
                "rounded-full px-3.5 py-2 text-[0.82rem] font-medium transition-colors",
                scope === s.value
                  ? "bg-navy-900 text-white"
                  : "bg-navy-50 text-navy-600 hover:bg-navy-100",
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
        <label className="flex cursor-pointer items-center gap-2.5 text-[0.85rem] font-medium text-navy-700">
          <span
            className={cn(
              "relative h-5 w-9 rounded-full transition-colors",
              onlyStrong ? "bg-navy-900" : "bg-navy-200",
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 size-4 rounded-full bg-white transition-all",
                onlyStrong ? "left-4.5" : "left-0.5",
              )}
            />
          </span>
          <input
            type="checkbox"
            checked={onlyStrong}
            onChange={(e) => setOnlyStrong(e.target.checked)}
            className="sr-only"
          />
          Strong matches only
        </label>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={BriefcaseBusiness}
          title="No roles match those filters right now"
          body="Widen the search to the whole region, or turn off the strong-match filter. New openings are posted by partner employers every week in this prototype."
          action={
            <Button
              onClick={() => {
                setScope("region");
                setOnlyStrong(false);
              }}
              className="h-10 bg-navy-900 px-4"
            >
              Search across ECOWAS
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {visible.map(({ role, held, score }) => {
            const employer = employerById(role.employerId);
            const application = applicationFor(role.id);
            const missing = role.requires.filter((s) => !held.includes(s));
            return (
              <Panel key={role.id} className="p-5 sm:p-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-heading text-[1.15rem] font-bold text-navy-900">
                        {role.title}
                      </h3>
                      {application ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-teal-100 px-2.5 py-1 text-[0.68rem] font-bold tracking-wide text-teal-700 uppercase">
                          <Check className="size-2.5" strokeWidth={4} />
                          {stageLabels[application.stage]}
                        </span>
                      ) : score >= 60 ? (
                        <span className="rounded-full bg-gold-400 px-2.5 py-1 text-[0.68rem] font-bold tracking-wide text-navy-900 uppercase">
                          Strong match
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5 text-[0.82rem] text-navy-500">
                      <span className="flex items-center gap-1.5 font-semibold text-navy-700">
                        <Building2 className="size-3.5 text-navy-300" />
                        {employer?.name}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="size-3.5 text-navy-300" />
                        {role.location} · {role.mode}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Wallet className="size-3.5 text-navy-300" />
                        {role.salaryGMD}
                      </span>
                      <span>Posted {role.posted}</span>
                    </div>

                    <p className="mt-3.5 text-[0.87rem] leading-relaxed text-navy-500">
                      {employer?.blurb}
                    </p>

                    <div className="mt-4">
                      <p className="eyebrow text-navy-400">
                        Screening competencies
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {role.requires.map((skill) => {
                          const has = held.includes(skill);
                          return (
                            <Tag
                              key={skill}
                              tone={has ? "teal" : "outline"}
                              className="text-[0.72rem]"
                            >
                              {has ? "✓ " : "○ "}
                              {skill}
                            </Tag>
                          );
                        })}
                      </div>
                    </div>

                    <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-navy-50/70 p-3.5">
                      <Info className="mt-0.5 size-4 shrink-0 text-navy-400" />
                      <div>
                        <p className="text-[0.78rem] font-bold tracking-wide text-navy-700 uppercase">
                          Why you were matched
                        </p>
                        <p className="mt-1 text-[0.87rem] leading-relaxed text-navy-600">
                          {role.rationale}
                        </p>
                        {missing.length ? (
                          <p className="mt-2 text-[0.83rem] leading-relaxed text-navy-500">
                            <span className="font-semibold text-navy-700">
                              Still missing:
                            </span>{" "}
                            {missing.join(", ")}. You can apply anyway — the
                            introduction says plainly what is verified and what
                            is not.
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col items-center gap-4 lg:w-44">
                    <MatchDial score={score} />
                    {application ? (
                      <div className="w-full rounded-xl bg-teal-100/60 p-3.5 text-center ring-1 ring-teal-100">
                        <p className="text-[0.8rem] font-bold text-teal-700">
                          {stageLabels[application.stage]}
                        </p>
                        <p className="mt-1 text-[0.74rem] text-navy-500">
                          Sent {application.appliedOn}
                        </p>
                      </div>
                    ) : (
                      <Button
                        onClick={() => {
                          apply(role.id);
                          toast.success(
                            `Introduction sent to ${employer?.name}`,
                            {
                              description:
                                "They receive your verified passport entries and the match reason — nothing else.",
                            },
                          );
                        }}
                        className="h-11 w-full bg-gold-400 font-semibold text-navy-900 hover:bg-gold-300"
                      >
                        <Send className="size-3.5" />
                        Ask for an intro
                      </Button>
                    )}
                    <p className="text-center text-[0.72rem] leading-snug text-navy-400">
                      Employers see verified entries only.
                    </p>
                  </div>
                </div>
              </Panel>
            );
          })}
        </div>
      )}

      <Panel className="bg-navy-50/50">
        <PanelTitle
          title="Raise your match score"
          hint="The fastest way to move a match from amber to green is usually one more verified competency, not a new course."
        />
        <div className="flex flex-wrap gap-2">
          <LinkButton
            variant="outline"
            href="/student/passport"
            className="h-10"
          >
            Submit outstanding evidence
            <ArrowRight className="size-3.5" />
          </LinkButton>
          <LinkButton
            variant="outline"
            href="/student/studio"
            className="h-10"
          >
            Find a course that adds the missing skill
            <ArrowRight className="size-3.5" />
          </LinkButton>
        </div>
      </Panel>
    </div>
  );
}

function MatchDial({ score }: { score: number }) {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const tone =
    score >= 60 ? "text-teal-500" : score >= 34 ? "text-gold-400" : "text-navy-300";

  return (
    <div className="relative grid size-24 place-items-center">
      <svg viewBox="0 0 80 80" className="size-24 -rotate-90">
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          strokeWidth="7"
          className="stroke-navy-100"
        />
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - score / 100)}
          className={cn("stroke-current transition-all duration-700", tone)}
        />
      </svg>
      <div className="absolute text-center">
        <p className="font-heading text-[1.35rem] leading-none font-extrabold text-navy-900">
          {score}%
        </p>
        <p className="mt-0.5 text-[0.62rem] font-bold tracking-wide text-navy-400 uppercase">
          match
        </p>
      </div>
    </div>
  );
}
