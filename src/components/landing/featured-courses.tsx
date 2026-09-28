import Link from "next/link";
import { ArrowRight, Clock, MapPin, Star, Users } from "lucide-react";

import { LinkButton } from "@/components/app/link-button";
import { courses, modeLabels, trackById } from "@/lib/data";

/** One per track, chosen to show the spread rather than the most popular. */
const featured = [
  "data-analytics-foundations",
  "front-end-web-development",
  "mobile-money-and-fintech-operations",
];

export function FeaturedCourses() {
  const picks = featured
    .map((slug) => courses.find((c) => c.slug === slug))
    .filter((c): c is (typeof courses)[number] => Boolean(c));

  return (
    <section id="courses" className="border-b border-ink-200 py-16 sm:py-20">
      <div className="mx-auto w-full max-w-6xl px-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-[-0.01em] sm:text-[1.85rem]">
              Courses running now
            </h2>
            <p className="mt-2 max-w-md text-ink-600">
              Nine courses across eight tracks, each one available onsite, live
              with a tutor, or at your own pace.
            </p>
          </div>
          <LinkButton
            href="/student/studio?demo=student"
            variant="outline"
            size="lg"
          >
            See all nine
            <ArrowRight />
          </LinkButton>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {picks.map((course) => {
            const track = trackById(course.track);
            return (
              <Link
                key={course.slug}
                href={`/student/studio/${course.slug}?demo=student`}
                className="card-link group flex flex-col rounded-xl border border-ink-200 bg-white p-5 shadow-card"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-xs font-medium text-blue-700">
                    {track?.name}
                  </span>
                  <span className="shrink-0 rounded-full bg-ink-100 px-2 py-0.5 text-xs font-medium text-ink-600">
                    {course.level}
                  </span>
                </div>

                <h3 className="mt-3 text-[1.05rem] leading-snug font-semibold group-hover:text-blue-700">
                  {course.title}
                </h3>
                <p className="mt-1.5 flex-1 text-sm leading-relaxed text-ink-600">
                  {course.blurb}
                </p>

                <dl className="mt-4 grid grid-cols-2 gap-y-2 border-t border-ink-200 pt-4 text-xs text-ink-500">
                  <div className="flex items-center gap-1.5">
                    <Clock className="size-3.5 text-ink-400" />
                    <dd>
                      {course.weeks} weeks · {course.hoursPerWeek}h/wk
                    </dd>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="size-3.5 text-ink-400" />
                    <dd className="tabular-nums">{course.learners} learners</dd>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Star className="size-3.5 text-gold-500" />
                    <dd className="tabular-nums">{course.rating}</dd>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="size-3.5 text-ink-400" />
                    <dd className="truncate">
                      {course.hub.replace("Ednovate Lab, ", "")}
                    </dd>
                  </div>
                </dl>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {course.modes.map((mode) => (
                    <span
                      key={mode}
                      className="rounded-full border border-ink-200 px-2 py-0.5 text-[0.7rem] font-medium text-ink-600"
                    >
                      {modeLabels[mode]}
                    </span>
                  ))}
                </div>

                <p className="mt-4 flex items-center gap-1 text-sm font-medium text-blue-700">
                  {course.openRoles} roles want these skills
                  <ArrowRight className="size-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
