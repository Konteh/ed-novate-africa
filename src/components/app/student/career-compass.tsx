"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  CircleHelp,
  Compass,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/app/link-button";
import { Panel, PageHeader, Tag } from "@/components/app/ui-bits";
import {
  compassQuestions,
  recommend,
  reflections,
} from "@/lib/compass";
import { courseBySlug, modeLabels, trackById } from "@/lib/data";
import { usePlatform } from "@/lib/platform-store";
import { cn } from "@/lib/utils";

type Turn =
  | { kind: "question"; questionId: string }
  | { kind: "answer"; questionId: string; value: string; label: string }
  | { kind: "reflection"; questionId: string; text: string };

function replay(answers: Record<string, string>): Turn[] {
  const turns: Turn[] = [];
  for (const question of compassQuestions) {
    const value = answers[question.id];
    turns.push({ kind: "question", questionId: question.id });
    if (!value) break;
    const option = question.options.find((o) => o.value === value);
    turns.push({
      kind: "answer",
      questionId: question.id,
      value,
      label: option?.label ?? value,
    });
    const reflection = reflections[question.id]?.[value];
    if (reflection) {
      turns.push({ kind: "reflection", questionId: question.id, text: reflection });
    }
  }
  return turns;
}

export function CareerCompass() {
  const { compass, setCompass, enroll } = usePlatform();
  const [turns, setTurns] = useState<Turn[]>(() =>
    compass
      ? replay(compass.answers)
      : [{ kind: "question", questionId: compassQuestions[0].id }],
  );
  const [answers, setAnswers] = useState<Record<string, string>>(
    () => compass?.answers ?? {},
  );
  const [thinking, setThinking] = useState(false);
  const [showResult, setShowResult] = useState(Boolean(compass));
  const endRef = useRef<HTMLDivElement>(null);

  const step = Object.keys(answers).length;
  const current =
    step < compassQuestions.length ? compassQuestions[step] : null;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [turns, thinking, showResult]);

  const choose = (questionId: string, value: string, label: string) => {
    const nextAnswers = { ...answers, [questionId]: value };
    setAnswers(nextAnswers);
    setTurns((t) => [...t, { kind: "answer", questionId, value, label }]);
    setThinking(true);

    window.setTimeout(() => {
      const reflection = reflections[questionId]?.[value];
      setTurns((t) => [
        ...t,
        ...(reflection
          ? [{ kind: "reflection" as const, questionId, text: reflection }]
          : []),
      ]);
      const nextIndex = Object.keys(nextAnswers).length;
      if (nextIndex < compassQuestions.length) {
        setTurns((t) => [
          ...t,
          { kind: "question", questionId: compassQuestions[nextIndex].id },
        ]);
        setThinking(false);
      } else {
        window.setTimeout(() => {
          const result = recommend(nextAnswers);
          setCompass({ ...result, answers: nextAnswers });
          setThinking(false);
          setShowResult(true);
        }, 900);
      }
    }, 850);
  };

  const restart = () => {
    setCompass(null);
    setAnswers({});
    setTurns([{ kind: "question", questionId: compassQuestions[0].id }]);
    setShowResult(false);
  };

  const result = compass;
  const primaryCourse = result ? courseBySlug(result.primarySlug) : undefined;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Step 1 · Career Compass"
        title="A counsellor that asks, not just answers"
        description="Five questions about your background, your constraints and what you actually want. It recommends a track and a first course — and tells you the reasoning, so you can disagree with it."
        action={
          result || step > 0 ? (
            <Button variant="outline" onClick={restart} className="h-10">
              <RotateCcw className="size-3.5" />
              Start over
            </Button>
          ) : undefined
        }
      />

      <div className="grid gap-5 lg:grid-cols-[1.15fr_1fr] lg:items-start">
        {/* Conversation */}
        <Panel className="p-0! ring-navy-100">
          <div className="flex items-center gap-2.5 border-b border-navy-100 px-5 py-4">
            <span className="grid size-8 place-items-center rounded-full bg-navy-900 text-gold-300">
              <Compass className="size-4" />
            </span>
            <div>
              <p className="text-[0.9rem] font-bold text-navy-900">
                Career Compass
              </p>
              <p className="text-[0.75rem] text-navy-400">
                {result
                  ? "Conversation complete"
                  : `Question ${Math.min(step + 1, 5)} of 5`}
              </p>
            </div>
            <div className="ml-auto flex gap-1">
              {compassQuestions.map((q, i) => (
                <span
                  key={q.id}
                  className={cn(
                    "h-1.5 w-5 rounded-full transition-colors",
                    i < step ? "bg-teal-500" : i === step ? "bg-gold-400" : "bg-navy-100",
                  )}
                />
              ))}
            </div>
          </div>

          <div className="max-h-[32rem] space-y-4 overflow-y-auto px-5 py-5">
            {turns.map((turn, i) => {
              if (turn.kind === "answer") {
                return (
                  <div key={i} className="flex justify-end">
                    <span className="animate-rise max-w-[85%] rounded-xl rounded-br-sm bg-navy-900 px-3.5 py-2.5 text-[0.85rem] font-medium text-white">
                      {turn.label}
                    </span>
                  </div>
                );
              }

              if (turn.kind === "reflection") {
                return (
                  <Bubble key={i}>
                    <p className="text-navy-700">{turn.text}</p>
                  </Bubble>
                );
              }

              const question = compassQuestions.find(
                (q) => q.id === turn.questionId,
              )!;
              const answered = answers[question.id];
              return (
                <div key={i} className="space-y-3">
                  <Bubble>
                    <p className="font-semibold text-navy-900">
                      {question.prompt}
                    </p>
                    <p className="mt-1 text-navy-500">{question.nudge}</p>
                  </Bubble>
                  {!answered ? (
                    <div className="flex flex-wrap gap-2 pl-10">
                      {question.options.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() =>
                            choose(question.id, option.value, option.label)
                          }
                          className="group rounded-xl bg-white px-3.5 py-2 text-left ring-1 ring-navy-200 transition-all hover:-translate-y-0.5 hover:bg-navy-900 hover:ring-navy-900"
                        >
                          <span className="block text-[0.83rem] font-medium text-navy-800 group-hover:text-white">
                            {option.label}
                          </span>
                          {option.hint ? (
                            <span className="mt-0.5 block text-[0.72rem] text-navy-400 group-hover:text-navy-200">
                              {option.hint}
                            </span>
                          ) : null}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}

            {thinking ? (
              <Bubble>
                <span className="flex gap-1 py-1">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="size-1.5 animate-bounce rounded-full bg-navy-400"
                      style={{ animationDelay: `${i * 120}ms` }}
                    />
                  ))}
                </span>
              </Bubble>
            ) : null}

            {result && !current ? (
              <Bubble>
                <p className="font-semibold text-navy-900">
                  That is enough to give you a real answer.
                </p>
                <p className="mt-1 text-navy-600">
                  I have put the recommendation beside this conversation, with
                  the reasoning attached so you can push back on any part of it.
                </p>
              </Bubble>
            ) : null}

            <div ref={endRef} />
          </div>
        </Panel>

        {/* Result */}
        <div className="space-y-4">
          {!showResult || !result || !primaryCourse ? (
            <Panel className="border border-dashed border-navy-200 bg-navy-50/40 ring-0">
              <div className="flex flex-col items-center py-10 text-center">
                <span className="grid size-12 place-items-center rounded-full bg-white text-navy-400 ring-1 ring-navy-100">
                  <Sparkles className="size-5" />
                </span>
                <h3 className="mt-4 font-heading text-[1.05rem] font-bold text-navy-900">
                  Your recommendation appears here
                </h3>
                <p className="mt-2 max-w-sm text-[0.87rem] leading-relaxed text-navy-500">
                  Answer the five questions on the left. Nothing is saved to
                  your record until you choose to enrol.
                </p>
              </div>
            </Panel>
          ) : (
            <>
              <div className="animate-rise overflow-hidden rounded-2xl bg-gradient-to-br from-navy-800 to-navy-950 p-6 text-white">
                <p className="eyebrow text-gold-300">Recommended track</p>
                <h2 className="mt-2.5 flex items-center gap-2 font-heading text-[1.6rem] leading-tight font-extrabold">
                  {trackById(result.trackId).name}
                  <Check className="size-5 text-teal-300" strokeWidth={3.5} />
                </h2>
                <p className="mt-2 text-[0.92rem] leading-relaxed text-navy-200">
                  {trackById(result.trackId).tagline}
                </p>
                <div className="mt-5 rounded-xl bg-white/5 p-4 ring-1 ring-white/10">
                  <p className="eyebrow text-navy-300">Start here</p>
                  <p className="mt-1.5 font-heading text-[1.1rem] font-bold">
                    {primaryCourse.title}
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-1.5 text-[0.72rem]">
                    <span className="rounded-full bg-white/10 px-2 py-0.5">
                      {modeLabels[result.mode]}
                    </span>
                    <span className="rounded-full bg-white/10 px-2 py-0.5">
                      {primaryCourse.weeks} weeks
                    </span>
                    <span className="rounded-full bg-gold-400/20 px-2 py-0.5 text-gold-200">
                      {primaryCourse.openRoles} open roles
                    </span>
                  </div>
                  <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                    <Button
                      onClick={() => enroll(primaryCourse.slug, result.mode)}
                      className="h-10 bg-gold-400 px-4 font-semibold text-navy-900 hover:bg-gold-300"
                    >
                      Enrol {modeLabels[result.mode].toLowerCase()}
                    </Button>
                    <LinkButton
                      variant="ghost"
                      href={`/student/studio/${primaryCourse.slug}`}
                      className="h-10 text-navy-100 hover:bg-white/10"
                    >
                      Read the syllabus
                      <ArrowRight className="size-3.5" />
                    </LinkButton>
                  </div>
                </div>
              </div>

              <Panel>
                <h3 className="font-heading text-[1rem] font-bold text-navy-900">
                  Why this, for you
                </h3>
                <ul className="mt-3.5 space-y-3">
                  {result.reasons.map((reason, i) => (
                    <li key={i} className="flex gap-2.5">
                      <span className="mt-1.5 grid size-4 shrink-0 place-items-center rounded-full bg-teal-100 text-teal-700">
                        <Check className="size-2.5" strokeWidth={4} />
                      </span>
                      <p className="text-[0.87rem] leading-relaxed text-navy-600">
                        {reason}
                      </p>
                    </li>
                  ))}
                </ul>
              </Panel>

              <div className="rounded-2xl bg-gold-50 p-5 ring-1 ring-gold-200">
                <p className="eyebrow flex items-center gap-1.5 text-gold-700">
                  <CircleHelp className="size-3.5" />
                  A question to sit with
                </p>
                <p className="mt-2.5 text-[0.9rem] leading-relaxed text-navy-800">
                  {result.openQuestion}
                </p>
              </div>

              <Panel>
                <h3 className="font-heading text-[1rem] font-bold text-navy-900">
                  Also worth considering
                </h3>
                <p className="mt-1 text-[0.83rem] text-navy-500">
                  Close to your answers, and open to you without repeating work.
                </p>
                <ul className="mt-4 space-y-2.5">
                  {result.alternateSlugs.map((slug) => {
                    const course = courseBySlug(slug);
                    if (!course) return null;
                    return (
                      <li key={slug}>
                        <Link
                          href={`/student/studio/${slug}`}
                          className="flex items-start justify-between gap-3 rounded-xl p-3.5 ring-1 ring-navy-100 transition-all hover:bg-navy-50/60"
                        >
                          <span>
                            <span className="block text-[0.88rem] font-bold text-navy-900">
                              {course.title}
                            </span>
                            <span className="mt-1 block text-[0.78rem] text-navy-500">
                              {course.blurb}
                            </span>
                            <span className="mt-2 flex flex-wrap gap-1.5">
                              <Tag tone="outline" className="text-[0.68rem]">
                                {trackById(course.track).name}
                              </Tag>
                              <Tag tone="outline" className="text-[0.68rem]">
                                {course.level}
                              </Tag>
                            </span>
                          </span>
                          <ArrowRight className="mt-1 size-4 shrink-0 text-navy-300" />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </Panel>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Bubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-rise flex items-start gap-2.5">
      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-navy-900 text-white">
        <Sparkles className="size-3.5" />
      </span>
      <div className="max-w-[85%] rounded-xl rounded-tl-sm bg-navy-50 px-3.5 py-2.5 text-[0.85rem] leading-relaxed">
        {children}
      </div>
    </div>
  );
}
