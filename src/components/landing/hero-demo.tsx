"use client";

import { useEffect, useState } from "react";
import {
  BadgeCheck,
  BriefcaseBusiness,
  Check,
  Compass,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const options = [
  "Working with data",
  "Building things people use",
  "Keeping systems safe",
  "Money and payments",
];

const stages = [
  { label: "Career Compass", icon: Compass },
  { label: "Skills Passport", icon: BadgeCheck },
  { label: "Talent Bridge", icon: BriefcaseBusiness },
];

export function HeroDemo() {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setStage((s) => (s + 1) % 3);
    }, 3800);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="relative">
      <div
        aria-hidden
        className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-to-br from-navy-100 via-navy-50 to-gold-50"
      />
      <div
        aria-hidden
        className="absolute -top-5 -right-4 -z-10 size-28 rounded-full bg-gold-200/70 blur-2xl"
      />

      <div className="overflow-hidden rounded-2xl bg-white shadow-[0_24px_60px_-28px_rgba(13,33,55,0.4)] ring-1 ring-navy-900/10">
        <div className="flex items-center justify-between border-b border-navy-100 bg-navy-50/60 px-4 py-3">
          <div className="flex items-center gap-1.5">
            {stages.map((s, i) => (
              <button
                key={s.label}
                type="button"
                onClick={() => setStage(i)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.7rem] font-semibold transition-all",
                  i === stage
                    ? "bg-navy-900 text-white"
                    : "text-navy-400 hover:bg-white hover:text-navy-700",
                )}
              >
                <s.icon className="size-3" />
                <span className={cn(i === stage ? "inline" : "hidden sm:inline")}>
                  {s.label}
                </span>
              </button>
            ))}
          </div>
          <span className="flex items-center gap-1 rounded-full bg-teal-100 px-2 py-0.5 text-[0.65rem] font-bold tracking-wide text-teal-700 uppercase">
            <Check className="size-2.5" strokeWidth={4} />
            Verified
          </span>
        </div>

        <div className="min-h-[19rem] p-5">
          {stage === 0 ? (
            <div key="s0" className="animate-rise space-y-4">
              <div className="flex items-start gap-2.5">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-navy-900 text-white">
                  <Sparkles className="size-3.5" />
                </span>
                <div className="rounded-xl rounded-tl-sm bg-navy-50 px-3.5 py-2.5 text-[0.82rem] leading-relaxed text-navy-800">
                  <p className="font-semibold">What excites you about tech?</p>
                  <p className="mt-1 text-navy-500">
                    Pick the one closest to true. We will narrow it down together.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pl-9">
                {options.map((option, i) => (
                  <span
                    key={option}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-[0.78rem] font-medium ring-1 transition-all",
                      i === 0
                        ? "bg-navy-900 text-white ring-navy-900"
                        : "bg-white text-navy-500 ring-navy-200",
                    )}
                  >
                    {option}
                    {i === 0 ? (
                      <Check className="ml-1.5 inline size-3" strokeWidth={3} />
                    ) : null}
                  </span>
                ))}
              </div>
              <div className="ml-9 rounded-xl border border-dashed border-navy-200 bg-white p-3.5">
                <p className="eyebrow text-navy-400">Recommended track</p>
                <p className="mt-1.5 flex items-center gap-2 font-heading text-lg font-bold text-navy-900">
                  Data Analytics
                  <Check
                    className="size-4 text-teal-500"
                    strokeWidth={3.5}
                  />
                </p>
                <p className="mt-1 text-[0.78rem] text-navy-500">
                  Start with Data Analytics Foundations, onsite in Kanifing —
                  12 weeks, 37 open roles matched to it today.
                </p>
              </div>
            </div>
          ) : null}

          {stage === 1 ? (
            <div key="s1" className="animate-rise space-y-3">
              <div className="flex items-center justify-between">
                <p className="eyebrow text-navy-400">Skills Passport</p>
                <span className="text-[0.72rem] font-medium text-navy-400">
                  ENA-GM-2026-04182
                </span>
              </div>
              {[
                { skill: "Data profiling", state: "Verified" },
                { skill: "Data cleaning", state: "Verified" },
                { skill: "SQL querying", state: "Verified" },
                { skill: "Dashboard design", state: "In review" },
                { skill: "Data storytelling", state: "Not started" },
              ].map((row) => (
                <div
                  key={row.skill}
                  className="flex items-center justify-between rounded-lg bg-navy-50/70 px-3 py-2.5"
                >
                  <span className="text-[0.82rem] font-medium text-navy-800">
                    {row.skill}
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[0.68rem] font-bold tracking-wide uppercase",
                      row.state === "Verified" &&
                        "bg-teal-100 text-teal-700",
                      row.state === "In review" &&
                        "bg-gold-100 text-gold-700",
                      row.state === "Not started" &&
                        "bg-navy-100 text-navy-400",
                    )}
                  >
                    {row.state}
                  </span>
                </div>
              ))}
              <p className="pt-1 text-[0.75rem] text-navy-400">
                Each verified line is an artefact a tutor reviewed — not a
                certificate name.
              </p>
            </div>
          ) : null}

          {stage === 2 ? (
            <div key="s2" className="animate-rise space-y-3">
              <p className="eyebrow text-navy-400">Matched to a job</p>
              <div className="rounded-xl bg-navy-900 p-4 text-white">
                <p className="font-heading text-base font-bold">
                  Junior Data Analyst
                </p>
                <p className="mt-0.5 text-[0.8rem] text-navy-200">
                  Banjul Data Collective · Hybrid · Banjul
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {["SQL querying", "Data cleaning", "Dashboard design"].map(
                    (s, i) => (
                      <span
                        key={s}
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[0.68rem] font-semibold",
                          i < 2
                            ? "bg-teal-500/20 text-teal-100"
                            : "bg-gold-400/20 text-gold-200",
                        )}
                      >
                        {s}
                      </span>
                    ),
                  )}
                </div>
                <div className="mt-3.5 flex items-center gap-2 border-t border-white/10 pt-3">
                  <span className="font-heading text-2xl font-bold text-gold-300">
                    94%
                  </span>
                  <span className="text-[0.75rem] leading-tight text-navy-200">
                    competency match, with the
                    <br />
                    reason attached to the introduction
                  </span>
                </div>
              </div>
              <p className="text-[0.78rem] leading-relaxed text-navy-500">
                &ldquo;Three of the four competencies they screen on are already
                verified in your passport, including the SQL work signed off in
                week 9.&rdquo;
              </p>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-3 flex justify-center gap-1.5">
        {stages.map((s, i) => (
          <button
            key={s.label}
            type="button"
            aria-label={`Show ${s.label}`}
            onClick={() => setStage(i)}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i === stage ? "w-7 bg-navy-800" : "w-1.5 bg-navy-200",
            )}
          />
        ))}
      </div>
    </div>
  );
}
