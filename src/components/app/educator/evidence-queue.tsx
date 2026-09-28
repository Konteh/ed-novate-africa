"use client";

import { useState } from "react";
import {
  Check,
  ClipboardCheck,
  Loader2,
  Paperclip,
  RotateCcw,
  Sparkles,
  Undo2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { LinkButton } from "@/components/app/link-button";
import {
  EmptyState,
  PageHeader,
  Panel,
  PanelTitle,
  Tag,
} from "@/components/app/ui-bits";
import { courseBySlug, evidenceQueue, learnerById } from "@/lib/data";
import { usePlatform } from "@/lib/platform-store";
import { cn } from "@/lib/utils";

export function EvidenceQueue() {
  const { evidenceStatus, sentFeedback, reviewEvidence, resetDemo } = usePlatform();

  const queued = evidenceQueue.filter((item) => evidenceStatus[item.id] === "queued");
  const reviewed = evidenceQueue.filter((item) => evidenceStatus[item.id] !== "queued");

  // Derived rather than synced, so an item leaving the queue after review
  // falls through to the next one without an effect.
  const [pickedId, setPickedId] = useState<string | null>(null);
  const selected = queued.find((i) => i.id === pickedId) ?? queued[0] ?? null;
  const selectedId = selected?.id ?? null;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Evidence queue"
        action={
          reviewed.length ? (
            <Button variant="outline" onClick={resetDemo}>
              <RotateCcw />
              Reset queue
            </Button>
          ) : undefined
        }
      />

      {queued.length === 0 ? (
        <Panel>
          <EmptyState
            icon={ClipboardCheck}
            title="Nothing waiting on you"
            body={`You reviewed ${reviewed.length} submission${reviewed.length === 1 ? "" : "s"} and the feedback has gone out.`}
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Button size="sm" onClick={resetDemo}>
                  <RotateCcw />
                  Reset queue
                </Button>
                <LinkButton href="/educator/intelligence" variant="outline" size="sm">
                  Regional picture
                </LinkButton>
              </div>
            }
          />
        </Panel>
      ) : (
        <div className="grid gap-5 xl:grid-cols-[19rem_1fr] xl:items-start">
          <Panel className="overflow-hidden xl:sticky xl:top-6">
            <PanelTitle title={`${queued.length} waiting`} />
            <ul className="divide-y divide-ink-200">
              {queued.map((item) => {
                const learner = learnerById(item.learnerId);
                const unmet = item.rubric.filter((r) => !r.met).length;
                const active = item.id === selectedId;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => setPickedId(item.id)}
                      aria-current={active ? "true" : undefined}
                      className={cn(
                        "w-full px-5 py-3.5 text-left transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-blue-500/45 focus-visible:-outline-offset-2",
                        active ? "bg-blue-950" : "hover:bg-ink-50",
                      )}
                    >
                      <p
                        className={cn(
                          "text-sm font-medium",
                          active ? "text-white" : "text-ink-900",
                        )}
                      >
                        {learner?.name}
                      </p>
                      <p
                        className={cn(
                          "mt-0.5 text-xs",
                          active ? "text-blue-200" : "text-ink-500",
                        )}
                      >
                        {item.competency}
                      </p>
                      <p
                        className={cn(
                          "mt-1 text-xs",
                          active ? "text-blue-300" : "text-ink-400",
                        )}
                      >
                        {item.submitted} · {unmet ? `${unmet} unmet` : "rubric met"}
                      </p>
                    </button>
                  </li>
                );
              })}
            </ul>
          </Panel>

          {selected ? (
            <ReviewPane
              key={selected.id}
              itemId={selected.id}
              onSubmit={reviewEvidence}
              alreadySent={sentFeedback[selected.id]}
            />
          ) : null}
        </div>
      )}

      {reviewed.length ? (
        <Panel>
          <PanelTitle title="Reviewed this session" />
          <ul className="divide-y divide-ink-200">
            {reviewed.map((item) => {
              const learner = learnerById(item.learnerId);
              const outcome = evidenceStatus[item.id];
              return (
                <li key={item.id} className="px-5 py-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium">
                      {learner?.name} — {item.competency}
                    </p>
                    <Tag tone={outcome === "verified" ? "ok" : "accent"}>
                      {outcome === "verified" ? "Verified" : "Returned"}
                    </Tag>
                  </div>
                  {sentFeedback[item.id] ? (
                    <p className="mt-2.5 border-l-2 border-ink-200 pl-3 text-sm leading-relaxed whitespace-pre-line text-ink-600">
                      {sentFeedback[item.id]}
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </Panel>
      ) : null}
    </div>
  );
}

function ReviewPane({
  itemId,
  onSubmit,
  alreadySent,
}: {
  itemId: string;
  onSubmit: (id: string, outcome: "verified" | "returned", feedback: string) => void;
  alreadySent?: string;
}) {
  const item = evidenceQueue.find((i) => i.id === itemId)!;
  const learner = learnerById(item.learnerId);
  const course = courseBySlug(item.courseSlug);

  const [feedback, setFeedback] = useState(alreadySent ?? item.aiDraft);
  const [edited, setEdited] = useState(Boolean(alreadySent));
  const [regenerating, setRegenerating] = useState(false);

  const unmet = item.rubric.filter((r) => !r.met);
  const suggestedOutcome = unmet.length ? "returned" : "verified";

  const regenerate = () => {
    setRegenerating(true);
    window.setTimeout(() => {
      setFeedback(item.aiDraft);
      setEdited(false);
      setRegenerating(false);
      toast.info("Draft regenerated");
    }, 800);
  };

  const send = (outcome: "verified" | "returned") => {
    if (feedback.trim().length < 40) {
      toast.error("Write something the learner can act on");
      return;
    }
    onSubmit(itemId, outcome, feedback.trim());
    toast.success(
      outcome === "verified"
        ? `${item.competency} verified for ${learner?.name}`
        : `Returned to ${learner?.name} with your notes`,
    );
  };

  return (
    <div className="space-y-5">
      <Panel>
        <div className="p-5">
          <div className="flex flex-wrap items-center gap-2">
            <Tag>{item.competency}</Tag>
            <Tag tone="outline">{course?.title}</Tag>
          </div>
          <h2 className="mt-3 text-lg leading-snug font-semibold">{item.title}</h2>
          <p className="mt-1 text-sm text-ink-500">
            {learner?.name} · {learner?.cohort} · submitted {item.submitted}
          </p>
          <p className="mt-3.5 text-sm leading-relaxed text-ink-600">{item.summary}</p>

          <ul className="mt-4 flex flex-wrap gap-2">
            {item.artefacts.map((artefact) => (
              <li
                key={artefact}
                className="flex items-center gap-1.5 rounded-lg bg-ink-100 px-2.5 py-1.5 text-xs text-ink-700"
              >
                <Paperclip className="size-3.5 text-ink-400" />
                {artefact}
              </li>
            ))}
          </ul>
        </div>
      </Panel>

      <Panel>
        <PanelTitle title="Rubric" />
        <ul className="divide-y divide-ink-200">
          {item.rubric.map((criterion) => (
            <li key={criterion.criterion} className="flex gap-3 px-5 py-3.5">
              <span
                className={cn(
                  "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full",
                  criterion.met ? "bg-ok-50 text-ok-600" : "bg-warn-50 text-warn-600",
                )}
              >
                {criterion.met ? (
                  <Check className="size-3" strokeWidth={3} />
                ) : (
                  <X className="size-3" strokeWidth={3} />
                )}
              </span>
              <div>
                <p className="text-sm font-medium">{criterion.criterion}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-ink-600">
                  {criterion.note}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel>
        <PanelTitle
          title="Feedback to send"
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={regenerate}
              disabled={regenerating}
            >
              {regenerating ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Sparkles />
              )}
              Redraft
            </Button>
          }
        />

        <div className="p-5">
          <div className="mb-2.5 flex flex-wrap items-center gap-2">
            <Tag tone={edited ? "default" : "accent"}>
              {edited ? "Edited by you" : "AI draft, unedited"}
            </Tag>
            {edited ? (
              <button
                type="button"
                onClick={() => {
                  setFeedback(item.aiDraft);
                  setEdited(false);
                }}
                className="inline-flex items-center gap-1.5 rounded-md text-xs font-medium text-ink-500 transition-colors hover:text-ink-900"
              >
                <Undo2 className="size-3.5" />
                Restore draft
              </button>
            ) : null}
          </div>

          <Textarea
            value={feedback}
            onChange={(e) => {
              setFeedback(e.target.value);
              setEdited(true);
            }}
            rows={11}
            aria-label="Feedback to send"
            className="leading-relaxed"
          />
          <p className="mt-2 text-xs text-ink-400">
            {feedback.trim().split(/\s+/).filter(Boolean).length} words · sent as{" "}
            {course?.tutor}
          </p>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Button
              size="lg"
              variant={suggestedOutcome === "verified" ? "default" : "outline"}
              className={cn(
                "flex-1",
                suggestedOutcome === "verified" &&
                  "bg-ok-600 hover:bg-ok-600/90 active:bg-ok-600",
              )}
              onClick={() => send("verified")}
            >
              <Check />
              Verify
            </Button>
            <Button
              size="lg"
              variant={suggestedOutcome === "returned" ? "accent" : "outline"}
              className="flex-1"
              onClick={() => send("returned")}
            >
              <Undo2 />
              Return for changes
            </Button>
          </div>
          <p className="mt-2.5 text-xs text-ink-400">
            Rubric suggests{" "}
            <span className="font-medium text-ink-600">
              {suggestedOutcome === "verified" ? "verifying" : "returning"}
            </span>
            . The decision is yours.
          </p>
        </div>
      </Panel>
    </div>
  );
}
