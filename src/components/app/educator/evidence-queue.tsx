"use client";

import { useState } from "react";
import {
  Check,
  ClipboardCheck,
  FileText,
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
  const { evidenceStatus, sentFeedback, reviewEvidence, resetDemo } =
    usePlatform();

  const queued = evidenceQueue.filter(
    (item) => evidenceStatus[item.id] === "queued",
  );
  const reviewed = evidenceQueue.filter(
    (item) => evidenceStatus[item.id] !== "queued",
  );

  // Derived rather than synced, so an item leaving the queue after review
  // falls through to the next one without an effect.
  const [pickedId, setPickedId] = useState<string | null>(null);
  const selected = queued.find((i) => i.id === pickedId) ?? queued[0] ?? null;
  const selectedId = selected?.id ?? null;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Evidence queue"
        title="Review, verify, and send the feedback yourself"
        description="AI drafts the feedback against the published rubric. You edit it and decide the outcome — nothing enters a learner's passport without a named human signing it off."
        action={
          reviewed.length ? (
            <Button variant="outline" onClick={resetDemo} className="h-10">
              <RotateCcw className="size-3.5" />
              Reset the queue
            </Button>
          ) : undefined
        }
      />

      {queued.length === 0 ? (
        <EmptyState
          icon={ClipboardCheck}
          title="Queue cleared — nothing is waiting on you"
          body={`You reviewed ${reviewed.length} submission${reviewed.length === 1 ? "" : "s"} and the feedback has gone out. Reset the queue to walk through the review flow again.`}
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button onClick={resetDemo} className="h-10 bg-navy-900 px-4">
                <RotateCcw className="size-3.5" />
                Reset the demo queue
              </Button>
              <LinkButton
                href="/educator/intelligence"
                variant="outline"
                className="h-10"
              >
                See the regional picture
              </LinkButton>
            </div>
          }
        />
      ) : (
        <div className="grid gap-5 xl:grid-cols-[20rem_1fr] xl:items-start">
          {/* Queue list */}
          <Panel className="p-0! xl:sticky xl:top-6">
            <div className="border-b border-navy-100 px-4 py-3.5">
              <p className="text-[0.9rem] font-bold text-navy-900">
                {queued.length} waiting
              </p>
              <p className="text-[0.76rem] text-navy-500">
                Oldest submission first
              </p>
            </div>
            <ul className="divide-y divide-navy-100">
              {queued.map((item) => {
                const learner = learnerById(item.learnerId);
                const unmet = item.rubric.filter((r) => !r.met).length;
                const active = item.id === selectedId;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => setPickedId(item.id)}
                      aria-current={active}
                      className={cn(
                        "w-full px-4 py-3.5 text-left transition-colors",
                        active
                          ? "bg-navy-900"
                          : "hover:bg-navy-50/70",
                      )}
                    >
                      <p
                        className={cn(
                          "text-[0.87rem] font-bold",
                          active ? "text-white" : "text-navy-900",
                        )}
                      >
                        {learner?.name}
                      </p>
                      <p
                        className={cn(
                          "mt-0.5 text-[0.78rem] leading-snug",
                          active ? "text-navy-200" : "text-navy-500",
                        )}
                      >
                        {item.competency}
                      </p>
                      <p
                        className={cn(
                          "mt-1.5 text-[0.72rem]",
                          active ? "text-navy-300" : "text-navy-400",
                        )}
                      >
                        {item.submitted} ·{" "}
                        {unmet
                          ? `${unmet} unmet`
                          : "all criteria met"}
                      </p>
                    </button>
                  </li>
                );
              })}
            </ul>
            {reviewed.length ? (
              <div className="border-t border-navy-100 px-4 py-3">
                <p className="text-[0.75rem] text-navy-400">
                  {reviewed.length} already reviewed this session
                </p>
              </div>
            ) : null}
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
          <PanelTitle
            title="Reviewed this session"
            hint="What you sent, and the outcome the learner's passport now shows."
          />
          <ul className="space-y-2.5">
            {reviewed.map((item) => {
              const learner = learnerById(item.learnerId);
              const outcome = evidenceStatus[item.id];
              return (
                <li
                  key={item.id}
                  className="rounded-xl p-4 ring-1 ring-navy-100"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[0.9rem] font-bold text-navy-900">
                      {learner?.name} — {item.competency}
                    </p>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-[0.66rem] font-bold tracking-wide uppercase",
                        outcome === "verified"
                          ? "bg-teal-100 text-teal-700"
                          : "bg-gold-100 text-gold-700",
                      )}
                    >
                      {outcome === "verified" ? "Verified" : "Returned"}
                    </span>
                  </div>
                  {sentFeedback[item.id] ? (
                    <p className="mt-2.5 border-l-2 border-navy-200 pl-3 text-[0.84rem] leading-relaxed whitespace-pre-line text-navy-600">
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
  onSubmit: (
    id: string,
    outcome: "verified" | "returned",
    feedback: string,
  ) => void;
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
      toast.info("Draft regenerated", {
        description:
          "Prototype: the draft is pre-written for this submission rather than generated live.",
      });
    }, 800);
  };

  const send = (outcome: "verified" | "returned") => {
    if (feedback.trim().length < 40) {
      toast.error("Write something the learner can act on", {
        description:
          "A returned submission with two words of feedback costs more time than it saves.",
      });
      return;
    }
    onSubmit(itemId, outcome, feedback.trim());
    toast.success(
      outcome === "verified"
        ? `${item.competency} verified for ${learner?.name}`
        : `Returned to ${learner?.name} with your notes`,
      {
        description:
          outcome === "verified"
            ? "It is now a verified line in their Skills Passport, with your name on it."
            : "They keep the submission and can resubmit against the same rubric.",
      },
    );
  };

  return (
    <div className="space-y-5">
      <Panel>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Tag tone="gold">{item.competency}</Tag>
              <Tag tone="outline">{course?.title}</Tag>
            </div>
            <h2 className="mt-3 font-heading text-[1.25rem] leading-snug font-bold text-navy-900">
              {item.title}
            </h2>
            <p className="mt-1.5 text-[0.82rem] text-navy-500">
              {learner?.name} · {learner?.cohort} · submitted {item.submitted}
            </p>
          </div>
        </div>

        <p className="mt-4 text-[0.9rem] leading-relaxed text-navy-600">
          {item.summary}
        </p>

        <div className="mt-4">
          <p className="eyebrow text-navy-400">Attachments</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {item.artefacts.map((artefact) => (
              <li
                key={artefact}
                className="flex items-center gap-1.5 rounded-lg bg-navy-50 px-2.5 py-1.5 text-[0.79rem] text-navy-700"
              >
                <Paperclip className="size-3.5 text-navy-400" />
                {artefact}
              </li>
            ))}
          </ul>
        </div>
      </Panel>

      <Panel>
        <PanelTitle
          title="Rubric"
          hint="Published to learners before they submit, so nothing here is a surprise."
        />
        <ul className="space-y-2.5">
          {item.rubric.map((criterion) => (
            <li
              key={criterion.criterion}
              className={cn(
                "flex gap-3 rounded-xl p-3.5 ring-1",
                criterion.met
                  ? "bg-teal-100/30 ring-teal-100"
                  : "bg-gold-50 ring-gold-200",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full",
                  criterion.met
                    ? "bg-teal-500 text-white"
                    : "bg-gold-400 text-navy-900",
                )}
              >
                {criterion.met ? (
                  <Check className="size-3" strokeWidth={4} />
                ) : (
                  <X className="size-3" strokeWidth={4} />
                )}
              </span>
              <div>
                <p className="text-[0.88rem] font-bold text-navy-900">
                  {criterion.criterion}
                </p>
                <p className="mt-1 text-[0.84rem] leading-relaxed text-navy-600">
                  {criterion.note}
                </p>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[0.82rem] text-navy-500">
          {unmet.length === 0
            ? "All criteria met. The draft below recommends verifying."
            : `${unmet.length} criteri${unmet.length === 1 ? "on" : "a"} unmet. The draft below recommends returning it with what to change.`}
        </p>
      </Panel>

      <Panel>
        <PanelTitle
          title="Feedback to send"
          hint="AI-drafted from the rubric. Edit it freely — the learner sees what you send, not the draft."
          action={
            <Button
              variant="outline"
              onClick={regenerate}
              disabled={regenerating}
              className="h-9"
            >
              {regenerating ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Sparkles className="size-3.5" />
              )}
              Redraft
            </Button>
          }
        />

        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.7rem] font-bold tracking-wide uppercase",
              edited
                ? "bg-navy-100 text-navy-700"
                : "bg-gold-100 text-gold-700",
            )}
          >
            {edited ? (
              <>
                <FileText className="size-3" />
                Edited by you
              </>
            ) : (
              <>
                <Sparkles className="size-3" />
                AI draft, unedited
              </>
            )}
          </span>
          {edited ? (
            <button
              type="button"
              onClick={() => {
                setFeedback(item.aiDraft);
                setEdited(false);
              }}
              className="inline-flex items-center gap-1.5 text-[0.78rem] font-medium text-navy-500 hover:text-navy-800"
            >
              <Undo2 className="size-3.5" />
              Restore the draft
            </button>
          ) : null}
        </div>

        <Textarea
          value={feedback}
          onChange={(e) => {
            setFeedback(e.target.value);
            setEdited(true);
          }}
          rows={12}
          aria-label="Feedback to send"
          className="leading-relaxed"
        />
        <p className="mt-2 text-[0.75rem] text-navy-400">
          {feedback.trim().split(/\s+/).filter(Boolean).length} words · sent
          under your name, {course?.tutor}
        </p>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Button
            onClick={() => send("verified")}
            className={cn(
              "h-11 flex-1 font-semibold",
              suggestedOutcome === "verified"
                ? "bg-teal-500 text-white hover:bg-teal-700"
                : "bg-navy-50 text-navy-800 hover:bg-navy-100",
            )}
          >
            <Check className="size-4" />
            Verify the competency
          </Button>
          <Button
            onClick={() => send("returned")}
            className={cn(
              "h-11 flex-1 font-semibold",
              suggestedOutcome === "returned"
                ? "bg-gold-400 text-navy-900 hover:bg-gold-300"
                : "bg-navy-50 text-navy-800 hover:bg-navy-100",
            )}
          >
            <Undo2 className="size-4" />
            Return for changes
          </Button>
        </div>
        <p className="mt-3 text-[0.78rem] leading-relaxed text-navy-400">
          Recommended:{" "}
          <span className="font-semibold text-navy-600">
            {suggestedOutcome === "verified"
              ? "verify"
              : "return for changes"}
          </span>
          . You can override it — the rubric informs the decision, it does not
          make it.
        </p>
      </Panel>
    </div>
  );
}
