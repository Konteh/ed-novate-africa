"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Compass, RotateCcw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/app/link-button";
import { Panel, PanelTitle, PageHeader, Tag } from "@/components/app/ui-bits";
import { compassQuestions, recommend, reflections } from "@/lib/compass";
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
  const current = step < compassQuestions.length ? compassQuestions[step] : null;

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
        ...(reflection ? [{ kind: "reflection" as const, questionId, text: reflection }] : []),
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
    <div className="space-y-5">
      <PageHeader
        title="Career Compass"
        action={
          result || step > 0 ? (
            <Button variant="outline" onClick={restart}>
              <RotateCcw />
              Start over
            </Button>
          ) : undefined
        }
      />

      <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr] lg:items-start">
        <Panel className="flex flex-col lg:min-h-[30rem]">
          <div className="flex items-center gap-2.5 border-b border-ink-200 px-5 py-3">
            <span className="grid size-7 place-items-center rounded-full bg-blue-600 text-gold-300">
              <Compass className="size-3.5" />
            </span>
            <p className="text-sm font-semibold">Career Compass</p>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs text-ink-500 tabular-nums">
                {result ? "Done" : `${Math.min(step + 1, 5)} / 5`}
              </span>
              <span className="flex gap-1">
                {compassQuestions.map((q, i) => (
                  <span
                    key={q.id}
                    className={cn(
                      "h-1 w-4 rounded-full transition-colors duration-300",
                      i < step ? "bg-ok-600" : i === step ? "bg-gold-400" : "bg-ink-200",
                    )}
                  />
                ))}
              </span>
            </div>
          </div>

          <div className="max-h-[32rem] flex-1 space-y-4 overflow-y-auto p-5">
            {turns.map((turn, i) => {
              if (turn.kind === "answer") {
                return (
                  <div key={i} className="flex justify-end">
                    <span className="animate-fade-up max-w-[85%] rounded-xl rounded-br-sm bg-blue-600 px-3.5 py-2.5 text-sm font-medium text-white">
                      {turn.label}
                    </span>
                  </div>
                );
              }

              if (turn.kind === "reflection") {
                return (
                  <Bubble key={i}>
                    <p className="text-ink-700">{turn.text}</p>
                  </Bubble>
                );
              }

              const question = compassQuestions.find((q) => q.id === turn.questionId)!;
              const answered = answers[question.id];
              return (
                <div key={i} className="space-y-3">
                  <Bubble>
                    <p className="font-medium text-ink-900">{question.prompt}</p>
                  </Bubble>
                  {!answered ? (
                    <div className="flex flex-wrap gap-2 pl-9.5">
                      {question.options.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => choose(question.id, option.value, option.label)}
                          className="rounded-lg border border-ink-200 bg-white px-3.5 py-2 text-left text-sm font-medium text-ink-800 transition-colors duration-150 outline-none hover:border-blue-600 hover:bg-blue-600 hover:text-white focus-visible:ring-2 focus-visible:ring-blue-500/45"
                        >
                          {option.label}
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
                      className="size-1.5 animate-bounce rounded-full bg-ink-400"
                      style={{ animationDelay: `${i * 120}ms` }}
                    />
                  ))}
                </span>
              </Bubble>
            ) : null}

            {result && !current ? (
              <Bubble>
                <p className="text-ink-700">
                  That&rsquo;s enough for a real answer — it&rsquo;s on the right.
                </p>
              </Bubble>
            ) : null}

            <div ref={endRef} />
          </div>
        </Panel>

        <div className="space-y-5">
          {!showResult || !result || !primaryCourse ? (
            <Panel className="grid place-items-center px-6 py-16 lg:min-h-[30rem]">
              <div className="text-center">
                <Sparkles className="mx-auto size-5 text-ink-400" />
                <h3 className="mt-3 text-sm font-semibold">
                  Your recommendation appears here
                </h3>
                <p className="mt-1 text-sm text-ink-500">
                  Answer five questions to see it.
                </p>
              </div>
            </Panel>
          ) : (
            <>
              <div className="animate-fade-up rounded-xl bg-blue-950 p-6 text-white">
                <p className="text-xs text-blue-300">Recommended track</p>
                <h2 className="mt-1 text-[1.4rem] leading-tight font-semibold text-white">
                  {trackById(result.trackId).name}
                </h2>

                <div className="mt-5 rounded-lg bg-white/5 p-4">
                  <p className="text-xs text-blue-300">Start here</p>
                  <p className="mt-1 text-base font-semibold">{primaryCourse.title}</p>
                  <div className="mt-2.5 flex flex-wrap gap-1.5 text-xs">
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
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      variant="accent"
                      onClick={() => {
                        enroll(primaryCourse.slug, result.mode);
                        toast.success(`Enrolled in ${primaryCourse.title}`);
                      }}
                    >
                      Enrol {modeLabels[result.mode].toLowerCase()}
                    </Button>
                    <LinkButton
                      variant="ghost"
                      href={`/student/studio/${primaryCourse.slug}`}
                      className="text-blue-100 hover:bg-white/10 hover:text-white"
                    >
                      Syllabus
                      <ArrowRight />
                    </LinkButton>
                  </div>
                </div>
              </div>

              <Panel>
                <PanelTitle title="Why this, for you" />
                <ul className="space-y-3 p-5">
                  {result.reasons.map((reason, i) => (
                    <li key={i} className="flex gap-2.5">
                      <Check
                        className="mt-0.5 size-4 shrink-0 text-ok-600"
                        strokeWidth={2.5}
                      />
                      <p className="text-sm leading-relaxed text-ink-600">{reason}</p>
                    </li>
                  ))}
                </ul>
              </Panel>

              <div className="rounded-xl border border-gold-200 bg-gold-100/40 p-5">
                <p className="text-xs font-medium text-gold-700">
                  A question to sit with
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-800">
                  {result.openQuestion}
                </p>
              </div>

              <Panel>
                <PanelTitle title="Also worth considering" />
                <ul className="divide-y divide-ink-200">
                  {result.alternateSlugs.map((slug) => {
                    const course = courseBySlug(slug);
                    if (!course) return null;
                    return (
                      <li key={slug}>
                        <Link
                          href={`/student/studio/${slug}`}
                          className="flex items-start justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-ink-50"
                        >
                          <span className="min-w-0">
                            <span className="block text-sm font-medium">
                              {course.title}
                            </span>
                            <span className="mt-1.5 flex flex-wrap gap-1.5">
                              <Tag tone="outline">{trackById(course.track).name}</Tag>
                              <Tag tone="outline">{course.level}</Tag>
                            </span>
                          </span>
                          <ArrowRight className="mt-0.5 size-4 shrink-0 text-ink-400" />
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
    <div className="animate-fade-up flex items-start gap-2.5">
      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-blue-600 text-white">
        <Sparkles className="size-3.5" />
      </span>
      <div className="max-w-[85%] rounded-xl rounded-tl-sm bg-ink-100 px-3.5 py-2.5 text-sm leading-relaxed">
        {children}
      </div>
    </div>
  );
}
