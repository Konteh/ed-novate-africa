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

const passportRows = [
  { skill: "Data profiling", state: "Verified" },
  { skill: "Data cleaning", state: "Verified" },
  { skill: "SQL querying", state: "Verified" },
  { skill: "Dashboard design", state: "In review" },
  { skill: "Data storytelling", state: "Not started" },
];

export function HeroDemo() {
  const [stage, setStage] = useState(0);
  const [paused, setPaused] = useState(false);

  // The preview cycles on its own, but hands control over for good once
  // someone picks a stage themselves.
  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => {
      setStage((s) => (s + 1) % stages.length);
    }, 4200);
    return () => window.clearInterval(timer);
  }, [paused]);

  const select = (i: number) => {
    setPaused(true);
    setStage(i);
  };

  return (
    <div>
      <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-pop">
        <div className="flex items-center gap-1 border-b border-ink-200 bg-ink-50 px-3 py-2.5">
          {stages.map((s, i) => (
            <button
              key={s.label}
              type="button"
              aria-pressed={i === stage}
              onClick={() => select(i)}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-navy-500/45",
                i === stage
                  ? "bg-navy-900 text-white"
                  : "text-ink-500 hover:bg-white hover:text-ink-800",
              )}
            >
              <s.icon className="size-3.5" />
              <span className={i === stage ? "inline" : "hidden sm:inline"}>
                {s.label}
              </span>
            </button>
          ))}
        </div>

        <div className="min-h-[18rem] p-5">
          {stage === 0 ? (
            <div key="s0" className="animate-fade-up space-y-4">
              <div className="flex items-start gap-2.5">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-navy-900 text-white">
                  <Sparkles className="size-3.5" />
                </span>
                <p className="rounded-xl rounded-tl-sm bg-ink-100 px-3.5 py-2.5 text-sm font-medium text-ink-800">
                  What excites you about tech?
                </p>
              </div>
              <div className="flex flex-wrap gap-2 pl-9.5">
                {options.map((option, i) => (
                  <span
                    key={option}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-medium",
                      i === 0
                        ? "border-navy-900 bg-navy-900 text-white"
                        : "border-ink-200 text-ink-500",
                    )}
                  >
                    {option}
                  </span>
                ))}
              </div>
              <div className="ml-9.5 rounded-xl border border-ink-200 p-4">
                <p className="text-xs text-ink-500">Recommended track</p>
                <p className="mt-1 flex items-center gap-2 text-lg font-semibold">
                  Data Analytics
                  <Check className="size-4 text-ok-600" strokeWidth={3} />
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-ink-500">
                  Start with Data Analytics Foundations, onsite in Kanifing.
                </p>
              </div>
            </div>
          ) : null}

          {stage === 1 ? (
            <div key="s1" className="animate-fade-up space-y-2">
              <div className="flex items-center justify-between pb-1">
                <p className="text-xs font-medium text-ink-500">
                  Skills Passport
                </p>
                <span className="text-xs text-ink-400 tabular-nums">
                  ENA-GM-2026-04182
                </span>
              </div>
              {passportRows.map((row) => (
                <div
                  key={row.skill}
                  className="flex items-center justify-between rounded-lg bg-ink-50 px-3 py-2.5"
                >
                  <span className="text-sm font-medium text-ink-800">
                    {row.skill}
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-medium",
                      row.state === "Verified" && "bg-ok-50 text-ok-600",
                      row.state === "In review" && "bg-warn-50 text-warn-600",
                      row.state === "Not started" && "bg-ink-200 text-ink-500",
                    )}
                  >
                    {row.state}
                  </span>
                </div>
              ))}
            </div>
          ) : null}

          {stage === 2 ? (
            <div key="s2" className="animate-fade-up space-y-3">
              <div className="rounded-xl bg-navy-900 p-5 text-white">
                <p className="text-base font-semibold">Junior Data Analyst</p>
                <p className="mt-0.5 text-xs text-navy-200">
                  Banjul Data Collective · Hybrid · Banjul
                </p>
                <div className="mt-3.5 flex flex-wrap gap-1.5">
                  {["SQL querying", "Data cleaning", "Dashboard design"].map(
                    (s, i) => (
                      <span
                        key={s}
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-medium",
                          i < 2
                            ? "bg-white/15 text-white"
                            : "bg-white/5 text-navy-300",
                        )}
                      >
                        {s}
                      </span>
                    ),
                  )}
                </div>
                <div className="mt-4 flex items-baseline gap-2 border-t border-white/10 pt-3.5">
                  <span className="text-2xl font-semibold text-gold-300 tabular-nums">
                    94%
                  </span>
                  <span className="text-xs text-navy-200">
                    competency match
                  </span>
                </div>
              </div>
              <p className="text-xs leading-relaxed text-ink-500">
                “Three of the four skills they screen on are already verified in
                your passport.”
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
            onClick={() => select(i)}
            className={cn(
              "h-1.5 rounded-full transition-all duration-200",
              i === stage ? "w-6 bg-navy-800" : "w-1.5 bg-ink-300",
            )}
          />
        ))}
      </div>
    </div>
  );
}
