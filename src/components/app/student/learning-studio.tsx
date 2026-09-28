"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Search, SearchX, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState, PageHeader, Panel, Tag } from "@/components/app/ui-bits";
import { courses, modeLabels, tracks, trackById } from "@/lib/data";
import { usePlatform } from "@/lib/platform-store";
import type { DeliveryMode } from "@/lib/types";
import { cn } from "@/lib/utils";

const modeFilters: { value: DeliveryMode | "all"; label: string }[] = [
  { value: "all", label: "Any mode" },
  { value: "onsite", label: "Onsite" },
  { value: "live", label: "Live" },
  { value: "self-paced", label: "Self-paced" },
];

export function LearningStudio() {
  const { isEnrolled, compass } = usePlatform();
  const [query, setQuery] = useState("");
  const [track, setTrack] = useState<string>("all");
  const [mode, setMode] = useState<DeliveryMode | "all">("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return courses.filter((course) => {
      if (track !== "all" && course.track !== track) return false;
      if (mode !== "all" && !course.modes.includes(mode)) return false;
      if (!q) return true;
      return (
        course.title.toLowerCase().includes(q) ||
        course.blurb.toLowerCase().includes(q) ||
        course.skills.some((s) => s.toLowerCase().includes(q)) ||
        trackById(course.track).name.toLowerCase().includes(q)
      );
    });
  }, [query, track, mode]);

  const dirty = track !== "all" || mode !== "all" || query !== "";

  const clear = () => {
    setQuery("");
    setTrack("all");
    setMode("all");
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Learning Studio" />

      <div className="space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search courses and skills"
            className="h-10 bg-white pl-9"
            aria-label="Search courses"
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
          <FilterPill
            active={track === "all"}
            onClick={() => setTrack("all")}
            label="All tracks"
          />
          {tracks.map((t) => (
            <FilterPill
              key={t.id}
              active={track === t.id}
              onClick={() => setTrack(t.id)}
              label={t.name}
            />
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {modeFilters.map((m) => (
            <FilterPill
              key={m.value}
              active={mode === m.value}
              onClick={() => setMode(m.value)}
              label={m.label}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-500">
          {filtered.length} course{filtered.length === 1 ? "" : "s"}
        </p>
        {dirty ? (
          <Button variant="ghost" size="sm" onClick={clear}>
            Clear filters
          </Button>
        ) : null}
      </div>

      {filtered.length === 0 ? (
        <Panel>
          <EmptyState
            icon={SearchX}
            title="No courses match those filters"
            action={
              <Button size="sm" onClick={clear}>
                Clear filters
              </Button>
            }
          />
        </Panel>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((course) => {
            const enrolled = isEnrolled(course.slug);
            const recommended = compass?.primarySlug === course.slug;
            return (
              <Link
                key={course.slug}
                href={`/student/studio/${course.slug}`}
                className={cn(
                  "card-link group flex flex-col rounded-xl border bg-white p-5 shadow-card",
                  recommended ? "border-gold-300" : "border-ink-200",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <Tag>{trackById(course.track).name}</Tag>
                  {enrolled ? (
                    <Tag tone="ok" className="gap-1">
                      <Check className="size-3" strokeWidth={3} />
                      Enrolled
                    </Tag>
                  ) : recommended ? (
                    <Tag tone="accent">Recommended</Tag>
                  ) : null}
                </div>

                <h3 className="mt-3 text-base leading-snug font-semibold">
                  {course.title}
                </h3>
                <p className="mt-1.5 flex-1 text-sm leading-relaxed text-ink-500">
                  {course.blurb}
                </p>

                <p className="mt-4 text-xs text-ink-500">
                  {course.weeks} weeks · {course.level} ·{" "}
                  {course.modes.map((m) => modeLabels[m]).join(", ")}
                </p>

                <div className="mt-3.5 flex items-center justify-between border-t border-ink-200 pt-3.5">
                  <span className="text-xs font-medium text-ink-600">
                    {course.openRoles} open roles
                  </span>
                  <ArrowRight className="size-4 text-ink-400 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-ink-800" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FilterPill({
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
        "shrink-0 rounded-full border px-3 py-1.5 text-[0.8rem] font-medium transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-blue-500/45",
        active
          ? "border-blue-600 bg-blue-600 text-white"
          : "border-ink-200 bg-white text-ink-600 hover:border-ink-300 hover:text-ink-900",
      )}
    >
      {label}
    </button>
  );
}
