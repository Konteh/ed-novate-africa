"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Clock,
  MapPin,
  Search,
  SearchX,
  Star,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState, PageHeader, Tag } from "@/components/app/ui-bits";
import { courses, modeLabels, tracks, trackById } from "@/lib/data";
import { usePlatform } from "@/lib/platform-store";
import type { DeliveryMode } from "@/lib/types";
import { cn } from "@/lib/utils";

const modeFilters: { value: DeliveryMode | "all"; label: string }[] = [
  { value: "all", label: "All ways to learn" },
  { value: "onsite", label: "Onsite" },
  { value: "live", label: "Live tutor-led" },
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

  const clear = () => {
    setQuery("");
    setTrack("all");
    setMode("all");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Step 2 · Learning Studio"
        title="Nine courses, three ways to learn"
        description="Mastery-based: a module closes when you can do the thing, not when the week ends. Every course is available onsite, live with a tutor, or self-paced unless noted."
      />

      <div className="rounded-2xl bg-white p-4 ring-1 ring-navy-100 sm:p-5">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-navy-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a course, a skill or a track — try “SQL” or “payments”"
            className="h-11 pl-9"
            aria-label="Search courses"
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
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

        <div className="mt-3 flex flex-wrap gap-1.5 border-t border-navy-100 pt-3">
          {modeFilters.map((m) => (
            <FilterPill
              key={m.value}
              active={mode === m.value}
              onClick={() => setMode(m.value)}
              label={m.label}
              tone="gold"
            />
          ))}
        </div>
      </div>

      <div className="flex items-baseline justify-between">
        <p className="text-[0.85rem] font-medium text-navy-500">
          {filtered.length} course{filtered.length === 1 ? "" : "s"}
          {compass ? (
            <>
              {" · "}
              <span className="text-gold-600">
                Compass recommended {trackById(compass.trackId).name}
              </span>
            </>
          ) : null}
        </p>
        {track !== "all" || mode !== "all" || query ? (
          <Button variant="ghost" onClick={clear} className="h-8 text-navy-500">
            Clear filters
          </Button>
        ) : null}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="Nothing matches that combination yet"
          body="The catalogue is nine courses deep in this prototype. Try a broader track, or clear the delivery filter — some courses do not run onsite."
          action={
            <Button onClick={clear} className="h-10 bg-navy-900 px-4">
              Clear the filters
            </Button>
          }
        />
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
                  "group flex flex-col rounded-2xl bg-white p-5 ring-1 transition-all hover:-translate-y-1 hover:shadow-[0_20px_44px_-26px_rgba(13,33,55,0.4)]",
                  recommended ? "ring-2 ring-gold-300" : "ring-navy-100",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <Tag tone="gold">{trackById(course.track).name}</Tag>
                  {enrolled ? (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-teal-100 px-2 py-1 text-[0.68rem] font-bold tracking-wide text-teal-700 uppercase">
                      <Check className="size-2.5" strokeWidth={4} />
                      Enrolled
                    </span>
                  ) : recommended ? (
                    <span className="shrink-0 rounded-full bg-gold-400 px-2 py-1 text-[0.68rem] font-bold tracking-wide text-navy-900 uppercase">
                      Recommended
                    </span>
                  ) : null}
                </div>

                <h3 className="mt-3.5 font-heading text-[1.1rem] leading-snug font-bold text-navy-900">
                  {course.title}
                </h3>
                <p className="mt-2 flex-1 text-[0.87rem] leading-relaxed text-navy-500">
                  {course.blurb}
                </p>

                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[0.76rem] font-medium text-navy-500">
                  <span className="flex items-center gap-1.5">
                    <Clock className="size-3.5 text-navy-300" />
                    {course.weeks} weeks · {course.hoursPerWeek}h/wk
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="size-3.5 text-navy-300" />
                    {course.learners.toLocaleString()} learners
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Star className="size-3.5 text-gold-400" />
                    {course.rating.toFixed(1)}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {course.modes.map((m) => (
                    <Tag key={m} tone="outline" className="text-[0.68rem]">
                      {modeLabels[m]}
                    </Tag>
                  ))}
                  <Tag tone="outline" className="text-[0.68rem]">
                    {course.level}
                  </Tag>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-navy-100 pt-3.5">
                  <span className="flex items-center gap-1.5 text-[0.78rem] font-semibold text-navy-700">
                    <MapPin className="size-3.5 text-navy-300" />
                    {course.openRoles} open roles matched
                  </span>
                  <ArrowRight className="size-4 text-navy-300 transition-transform group-hover:translate-x-0.5 group-hover:text-navy-700" />
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
  tone = "navy",
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  tone?: "navy" | "gold";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full px-3 py-1.5 text-[0.79rem] font-medium transition-colors",
        active
          ? tone === "gold"
            ? "bg-gold-400 text-navy-900"
            : "bg-navy-900 text-white"
          : "bg-navy-50 text-navy-600 hover:bg-navy-100",
      )}
    >
      {label}
    </button>
  );
}
