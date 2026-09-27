"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  Check,
  CircleAlert,
  Clock,
  Eye,
  FileUp,
  Link2,
  Paperclip,
  Share2,
  ShieldCheck,
  Upload,
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
  StatTile,
  StatusPill,
} from "@/components/app/ui-bits";
import { courseBySlug, studentProfile, trackById } from "@/lib/data";
import { usePlatform } from "@/lib/platform-store";
import type { CompetencyStatus, PassportEntry } from "@/lib/types";
import { cn } from "@/lib/utils";

const filters: { value: CompetencyStatus | "all"; label: string }[] = [
  { value: "all", label: "Everything" },
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
    const url = `https://ed-novate.africa/passport/${studentProfile.passportId}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Passport link copied", {
        description:
          "In the prototype this is a demo URL — nothing is published.",
      });
    } catch {
      toast.error("Could not reach the clipboard", {
        description: `Copy it by hand: ${url}`,
      });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Step 3 · Skills Passport"
        title="Proof that travels with you"
        description="One record of what you can actually do, each line backed by an artefact a human tutor reviewed. It grows across courses instead of resetting with each one."
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={copyLink} className="h-10">
              <Share2 className="size-3.5" />
              Share
            </Button>
            <Button
              onClick={() => setEmployerView((v) => !v)}
              className={cn(
                "h-10 font-semibold",
                employerView
                  ? "bg-gold-400 text-navy-900 hover:bg-gold-300"
                  : "bg-navy-900 hover:bg-navy-800",
              )}
            >
              <Eye className="size-3.5" />
              {employerView ? "Back to my view" : "See the employer view"}
            </Button>
          </div>
        }
      />

      {/* Passport card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-navy-800 to-navy-950 p-6 text-white sm:p-7">
        <span
          aria-hidden
          className="absolute -top-16 -right-10 size-52 rounded-full bg-gold-400/15 blur-3xl"
        />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-white/10 font-heading text-lg font-bold text-gold-300 ring-1 ring-white/15">
              {studentProfile.initials}
            </span>
            <div>
              <p className="eyebrow text-gold-300">Verified skills passport</p>
              <p className="mt-1.5 font-heading text-[1.4rem] leading-none font-extrabold">
                {studentProfile.name}
              </p>
              <p className="mt-2 text-[0.82rem] text-navy-200">
                {studentProfile.cohort} · {studentProfile.location} · Joined{" "}
                {studentProfile.joined}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div>
              <p className="eyebrow text-navy-300">Passport ID</p>
              <p className="mt-1.5 font-mono text-[0.9rem] text-white">
                {studentProfile.passportId}
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-teal-500/15 px-3.5 py-2.5 ring-1 ring-teal-500/30">
              <ShieldCheck className="size-5 text-teal-300" />
              <div>
                <p className="font-heading text-[1.15rem] leading-none font-extrabold text-white">
                  {verified.length}
                </p>
                <p className="text-[0.7rem] text-teal-200">verified</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {employerView ? (
        <div className="flex items-start gap-3 rounded-xl bg-gold-50 p-4 ring-1 ring-gold-200">
          <Eye className="mt-0.5 size-4 shrink-0 text-gold-700" />
          <p className="text-[0.87rem] leading-relaxed text-navy-800">
            <span className="font-semibold">This is the employer view.</span>{" "}
            Employers only ever see verified competencies and the artefact
            summary — never your in-review work, your grades, or anything you
            have not finished.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatTile
              label="Verified competencies"
              value={verified.length}
              sub="Signed off by a named tutor"
              icon={BadgeCheck}
              tone="teal"
            />
            <StatTile
              label="With your tutor"
              value={inReview.length}
              sub="Reviewed within two working days"
              icon={Clock}
              tone="gold"
            />
            <StatTile
              label="Employer views"
              value={employerViews}
              sub="Across your verified evidence"
              icon={Eye}
            />
          </div>

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
                    "rounded-full px-3 py-1.5 text-[0.79rem] font-medium transition-colors",
                    filter === f.value
                      ? "bg-navy-900 text-white"
                      : "bg-navy-50 text-navy-600 hover:bg-navy-100",
                  )}
                >
                  {f.label}
                  <span
                    className={cn(
                      "ml-1.5",
                      filter === f.value ? "text-navy-300" : "text-navy-400",
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
        <EmptyState
          icon={CircleAlert}
          title="Nothing in this state yet"
          body="Switch to another filter, or submit evidence for a competency you have not started. A competency only enters your passport when a tutor signs it off."
          action={
            <Button
              onClick={() => setFilter("all")}
              className="h-10 bg-navy-900 px-4"
            >
              Show everything
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {visible.map((entry) => {
            const course = courseBySlug(entry.courseSlug);
            return (
              <Panel key={entry.id} className="p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-heading text-[1.05rem] font-bold text-navy-900">
                        {entry.competency}
                      </h3>
                      <StatusPill status={entry.status} />
                    </div>
                    {course ? (
                      <p className="mt-1.5 text-[0.8rem] text-navy-500">
                        {course.title} · {trackById(course.track).name}
                      </p>
                    ) : null}
                  </div>
                  {!employerView && entry.status === "not-started" ? (
                    <Button
                      onClick={() => setSubmitting(entry)}
                      className="h-9 shrink-0 bg-gold-400 font-semibold text-navy-900 hover:bg-gold-300"
                    >
                      <Upload className="size-3.5" />
                      Submit evidence
                    </Button>
                  ) : null}
                </div>

                {entry.evidenceTitle ? (
                  <div className="mt-4 rounded-xl bg-navy-50/60 p-4">
                    <p className="flex items-center gap-1.5 text-[0.88rem] font-bold text-navy-900">
                      <Paperclip className="size-3.5 text-navy-400" />
                      {entry.evidenceTitle}
                    </p>
                    <p className="mt-2 text-[0.87rem] leading-relaxed text-navy-600">
                      {entry.evidenceSummary}
                    </p>
                  </div>
                ) : (
                  <p className="mt-3 text-[0.87rem] leading-relaxed text-navy-500">
                    No artefact submitted yet. This is the last competency
                    standing between you and a complete passport for this
                    course.
                  </p>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-navy-100 pt-3.5 text-[0.78rem] text-navy-500">
                  {entry.status === "verified" ? (
                    <>
                      <span className="flex items-center gap-1.5 font-semibold text-teal-700">
                        <Check className="size-3.5" strokeWidth={3.5} />
                        Verified by {entry.verifiedBy}
                      </span>
                      <span>{entry.verifiedOn}</span>
                      <span className="flex items-center gap-1.5">
                        <Eye className="size-3.5 text-navy-300" />
                        {entry.employerViews} employer view
                        {entry.employerViews === 1 ? "" : "s"}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Link2 className="size-3.5 text-navy-300" />
                        Shareable
                      </span>
                    </>
                  ) : entry.status === "in-review" ? (
                    <span className="flex items-center gap-1.5 font-semibold text-gold-700">
                      <Clock className="size-3.5" />
                      Submitted {entry.submittedOn} — with{" "}
                      {course?.tutor ?? "your tutor"}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <FileUp className="size-3.5 text-navy-300" />
                      Waiting on your submission
                    </span>
                  )}
                </div>
              </Panel>
            );
          })}
        </div>
      )}

      {!employerView ? (
        <Panel className="bg-navy-50/50">
          <p className="text-[0.87rem] leading-relaxed text-navy-600">
            <span className="font-semibold text-navy-900">
              How verification works.
            </span>{" "}
            You submit an artefact — a notebook, a deployed app, a one-page
            brief. Your tutor reviews it against a published rubric, AI drafts
            the feedback, and the tutor edits and sends it. Nothing is verified
            automatically, which is the whole point.{" "}
            <Link
              href="/student/studio"
              className="font-semibold text-navy-800 underline underline-offset-2"
            >
              Find a course that adds a competency
            </Link>
            .
          </p>
        </Panel>
      ) : null}

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
        <DialogTitle className="text-lg font-bold text-navy-900">
          Submit evidence for {entry?.competency}
        </DialogTitle>
        <DialogDescription className="text-navy-500">
          {course
            ? `${course.tutor} reviews this against the published rubric and writes back within two working days.`
            : "Your tutor reviews this against the published rubric."}
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
              setError(
                "Write at least a couple of sentences on what you did and what you decided. Reviewers return submissions without it.",
              );
              return;
            }
            onSubmit(title.trim(), summary.trim());
            reset();
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="evidence-title" className="text-navy-800">
              What is the artefact?
            </Label>
            <Input
              id="evidence-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Capstone decision memo — clinic staffing"
              className="h-10"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="evidence-summary" className="text-navy-800">
              What did you do, and what did you decide?
            </Label>
            <Textarea
              id="evidence-summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={4}
              placeholder="One dataset, one recommendation. Say what you found, what you chose to leave out, and which assumption you are least sure about."
            />
            <p className="text-[0.75rem] text-navy-400">
              {summary.trim().length} characters · reviewers want the reasoning,
              not a summary of the brief.
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-navy-800">Attachments</Label>
            {files.length ? (
              <ul className="space-y-1.5">
                {files.map((file) => (
                  <li
                    key={file}
                    className="flex items-center justify-between rounded-lg bg-navy-50 px-3 py-2 text-[0.82rem] text-navy-700"
                  >
                    <span className="flex items-center gap-2">
                      <Paperclip className="size-3.5 text-navy-400" />
                      {file}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setFiles((f) => f.filter((x) => x !== file))
                      }
                      className="text-[0.75rem] font-medium text-navy-400 hover:text-destructive"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
            <Button
              type="button"
              variant="outline"
              onClick={mockAttach}
              className="h-9 w-full border-dashed"
            >
              <FileUp className="size-3.5" />
              Attach a file
            </Button>
            <p className="text-[0.72rem] text-navy-400">
              Prototype: attaching adds a sample filename rather than uploading
              anything.
            </p>
          </div>

          {error ? (
            <p
              role="alert"
              className="rounded-lg bg-destructive/10 px-3 py-2 text-[0.8rem] font-medium text-destructive"
            >
              {error}
            </p>
          ) : null}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                onClose();
              }}
              className="h-10 flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="h-10 flex-1 bg-navy-900 font-semibold hover:bg-navy-800"
            >
              Send for review
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
