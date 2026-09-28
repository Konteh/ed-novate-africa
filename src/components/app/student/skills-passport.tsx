"use client";

import { useMemo, useState } from "react";
import {
  CircleAlert,
  Clock,
  Eye,
  FileUp,
  Paperclip,
  Share2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  EmptyState,
  PageHeader,
  Panel,
  StatRow,
  StatusPill,
} from "@/components/app/ui-bits";
import { courseBySlug, studentProfile, trackById } from "@/lib/data";
import { usePlatform } from "@/lib/platform-store";
import type { CompetencyStatus, PassportEntry } from "@/lib/types";
import { cn } from "@/lib/utils";

const filters: { value: CompetencyStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "verified", label: "Verified" },
  { value: "in-review", label: "In review" },
  { value: "not-started", label: "Not started" },
];

export function SkillsPassport() {
  const { passport, submitEvidence } = usePlatform();
  const [filter, setFilter] = useState<CompetencyStatus | "all">("all");
  const [employerView, setEmployerView] = useState(false);
  const [submitting, setSubmitting] = useState<PassportEntry | null>(null);

  const verified = passport.filter((p) => p.status === "verified");
  const inReview = passport.filter((p) => p.status === "in-review");
  const employerViews = passport.reduce((s, p) => s + p.employerViews, 0);

  const visible = useMemo(() => {
    const base = employerView ? verified : passport;
    return filter === "all" || employerView
      ? base
      : base.filter((p) => p.status === filter);
  }, [passport, verified, filter, employerView]);

  const copyLink = async () => {
    const url = `https://ednovatelabs.com/passport/${studentProfile.passportId}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Passport link copied");
    } catch {
      toast.error("Could not reach the clipboard", { description: url });
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Skills Passport"
        action={
          <>
            <Button variant="outline" onClick={copyLink}>
              <Share2 />
              Share
            </Button>
            <Button
              variant={employerView ? "accent" : "default"}
              onClick={() => setEmployerView((v) => !v)}
              aria-pressed={employerView}
            >
              <Eye />
              {employerView ? "My view" : "Employer view"}
            </Button>
          </>
        }
      />

      <div className="flex flex-col gap-4 rounded-xl bg-blue-950 p-6 text-white sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-white/10 text-base font-semibold text-gold-300">
            {studentProfile.initials}
          </span>
          <div>
            <p className="text-lg leading-tight font-semibold text-white">
              {studentProfile.name}
            </p>
            <p className="mt-1 text-xs text-blue-200">
              {studentProfile.cohort} · {studentProfile.location}
            </p>
          </div>
        </div>
        <div className="sm:text-right">
          <p className="text-xs text-blue-300">Passport ID</p>
          <p className="mt-1 font-mono text-sm">{studentProfile.passportId}</p>
        </div>
      </div>

      {employerView ? (
        <p className="flex items-start gap-2.5 rounded-xl border border-gold-200 bg-gold-100/40 px-4 py-3 text-sm text-ink-800">
          <Eye className="mt-0.5 size-4 shrink-0 text-gold-700" />
          Employers see verified skills only — never work in review.
        </p>
      ) : (
        <>
          <StatRow
            items={[
              { label: "Verified", value: verified.length },
              { label: "With your tutor", value: inReview.length },
              { label: "Employer views", value: employerViews },
            ]}
          />

          <div className="flex flex-wrap gap-1.5">
            {filters.map((f) => {
              const count =
                f.value === "all"
                  ? passport.length
                  : passport.filter((p) => p.status === f.value).length;
              return (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setFilter(f.value)}
                  aria-pressed={filter === f.value}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-[0.8rem] font-medium transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-blue-500/45",
                    filter === f.value
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-ink-200 bg-white text-ink-600 hover:border-ink-300 hover:text-ink-900",
                  )}
                >
                  {f.label}
                  <span
                    className={cn(
                      "ml-1.5 tabular-nums",
                      filter === f.value ? "text-blue-300" : "text-ink-400",
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}

      {visible.length === 0 ? (
        <Panel>
          <EmptyState
            icon={CircleAlert}
            title="Nothing here yet"
            action={
              <Button size="sm" onClick={() => setFilter("all")}>
                Show all
              </Button>
            }
          />
        </Panel>
      ) : (
        <div className="space-y-3">
          {visible.map((entry) => {
            const course = courseBySlug(entry.courseSlug);
            return (
              <Panel key={entry.id}>
                <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold">
                        {entry.competency}
                      </h3>
                      <StatusPill status={entry.status} />
                    </div>
                    {course ? (
                      <p className="mt-1 text-xs text-ink-500">
                        {course.title} · {trackById(course.track).name}
                      </p>
                    ) : null}

                    {entry.evidenceTitle ? (
                      <div className="mt-3.5">
                        <p className="flex items-center gap-1.5 text-sm font-medium">
                          <Paperclip className="size-3.5 text-ink-400" />
                          {entry.evidenceTitle}
                        </p>
                        <p className="mt-1.5 text-sm leading-relaxed text-ink-600">
                          {entry.evidenceSummary}
                        </p>
                      </div>
                    ) : null}
                  </div>

                  {!employerView && entry.status === "not-started" ? (
                    <Button
                      variant="accent"
                      size="sm"
                      className="shrink-0"
                      onClick={() => setSubmitting(entry)}
                    >
                      <Upload />
                      Submit evidence
                    </Button>
                  ) : null}
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-ink-200 px-5 py-3 text-xs text-ink-500">
                  {entry.status === "verified" ? (
                    <>
                      <span className="font-medium text-ok-600">
                        Verified by {entry.verifiedBy}
                      </span>
                      <span>{entry.verifiedOn}</span>
                      <span>
                        {entry.employerViews} employer view
                        {entry.employerViews === 1 ? "" : "s"}
                      </span>
                    </>
                  ) : entry.status === "in-review" ? (
                    <span className="flex items-center gap-1.5 font-medium text-warn-600">
                      <Clock className="size-3.5" />
                      Submitted {entry.submittedOn}
                    </span>
                  ) : (
                    <span>Waiting on your submission</span>
                  )}
                </div>
              </Panel>
            );
          })}
        </div>
      )}

      <SubmitEvidenceDialog
        entry={submitting}
        onClose={() => setSubmitting(null)}
        onSubmit={(title, summary) => {
          if (!submitting) return;
          submitEvidence(submitting.competency, title, summary);
          setSubmitting(null);
          toast.success("Evidence submitted", {
            description: `${courseBySlug(submitting.courseSlug)?.tutor ?? "Your tutor"} will review it within two working days.`,
          });
        }}
      />
    </div>
  );
}

function SubmitEvidenceDialog({
  entry,
  onClose,
  onSubmit,
}: {
  entry: PassportEntry | null;
  onClose: () => void;
  onSubmit: (title: string, summary: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [files, setFiles] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const course = entry ? courseBySlug(entry.courseSlug) : undefined;

  const reset = () => {
    setTitle("");
    setSummary("");
    setFiles([]);
    setError(null);
  };

  const mockAttach = () => {
    const options = [
      "decision-memo.pdf",
      "analysis.ipynb",
      "cleaned-dataset.csv",
      "presentation-recording.mp4",
      "readme.md",
    ];
    const next = options.find((o) => !files.includes(o));
    if (next) setFiles((f) => [...f, next]);
  };

  return (
    <Dialog
      open={Boolean(entry)}
      onOpenChange={(open) => {
        if (!open) {
          reset();
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-lg sm:max-w-lg">
        <DialogTitle className="text-base font-semibold">
          Submit evidence for {entry?.competency}
        </DialogTitle>
        <DialogDescription className="text-sm text-ink-500">
          {course?.tutor ?? "Your tutor"} reviews this within two working days.
        </DialogDescription>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (title.trim().length < 6) {
              setError("Give the artefact a title a reviewer would recognise.");
              return;
            }
            if (summary.trim().length < 30) {
              setError("Add a couple of sentences on what you did and decided.");
              return;
            }
            onSubmit(title.trim(), summary.trim());
            reset();
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="evidence-title">Title</Label>
            <Input
              id="evidence-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Capstone decision memo — clinic staffing"
              className="h-10"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="evidence-summary">
              What did you do, and what did you decide?
            </Label>
            <Textarea
              id="evidence-summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={4}
              placeholder="What you found, what you left out, and the assumption you're least sure about."
            />
            <p className="text-xs text-ink-400 tabular-nums">
              {summary.trim().length} characters
            </p>
          </div>

          <div className="space-y-2">
            <Label>Attachments</Label>
            {files.length ? (
              <ul className="space-y-1.5">
                {files.map((file) => (
                  <li
                    key={file}
                    className="flex items-center justify-between rounded-lg bg-ink-100 px-3 py-2 text-sm text-ink-700"
                  >
                    <span className="flex items-center gap-2">
                      <Paperclip className="size-3.5 text-ink-400" />
                      {file}
                    </span>
                    <button
                      type="button"
                      aria-label={`Remove ${file}`}
                      onClick={() => setFiles((f) => f.filter((x) => x !== file))}
                      className="rounded-md p-1 text-ink-400 transition-colors hover:bg-white hover:text-destructive"
                    >
                      <X className="size-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
            <Button
              type="button"
              variant="outline"
              onClick={mockAttach}
              className="w-full border-dashed"
            >
              <FileUp />
              Attach a file
            </Button>
          </div>

          {error ? (
            <p
              role="alert"
              className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive"
            >
              {error}
            </p>
          ) : null}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="flex-1"
              onClick={() => {
                reset();
                onClose();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" size="lg" className="flex-1">
              Send for review
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
