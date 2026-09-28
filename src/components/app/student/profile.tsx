"use client";

import { useState } from "react";
import { Camera, FolderOpen, Loader2, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ProfileAvatar } from "@/components/app/avatar";
import { FilePicker, FileRow } from "@/components/app/file-picker";
import {
  EmptyState,
  PageHeader,
  Panel,
  PanelTitle,
} from "@/components/app/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatBytes } from "@/lib/image";
import { usePlatform } from "@/lib/platform-store";
import { studentProfile } from "@/lib/data";
import {
  AVATAR_MAX_BYTES,
  AVATAR_MIME_TYPES,
  EVIDENCE_MAX_BYTES,
} from "@/lib/supabase/config";
import type { ProfileFields, StoredFile } from "@/lib/types";

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "EL";
}

export function StudentProfile() {
  const {
    profile,
    files,
    remote,
    updateProfile,
    uploadAvatar,
    uploadFile,
    deleteFile,
  } = usePlatform();

  // Holding only the edited fields means the saved profile can arrive from the
  // backend mid-session without stomping on what is being typed.
  const [edits, setEdits] = useState<Partial<ProfileFields>>({});
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const draft = { ...profile, ...edits };
  const dirty = (["fullName", "headline", "cohort", "location"] as const).some(
    (key) => draft[key] !== profile[key],
  );

  const save = async () => {
    setSaving(true);
    try {
      await updateProfile({
        fullName: draft.fullName.trim(),
        headline: draft.headline.trim(),
        cohort: draft.cohort.trim(),
        location: draft.location.trim(),
      });
      setEdits({});
      toast.success("Profile saved");
    } catch (cause) {
      toast.error("Could not save your profile", {
        description: cause instanceof Error ? cause.message : undefined,
      });
    } finally {
      setSaving(false);
    }
  };

  const pickAvatar = async (file: File) => {
    setUploadingAvatar(true);
    try {
      await uploadAvatar(file);
      toast.success("Profile picture updated");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const removeFile = async (file: StoredFile) => {
    await deleteFile(file);
    toast.success(`${file.name} removed`);
  };

  const totalBytes = files.reduce((sum, f) => sum + f.sizeBytes, 0);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Your profile"
        description={
          remote
            ? "Saved to your account, so employers and tutors see the same details."
            : "Saved in this browser. Connect Supabase to carry it across devices."
        }
        action={
          <Button onClick={save} disabled={!dirty || saving}>
            {saving ? <Loader2 className="animate-spin" /> : <Save />}
            Save changes
          </Button>
        }
      />

      <Panel className="p-5">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <ProfileAvatar
            initials={initialsOf(draft.fullName || studentProfile.name)}
            name={draft.fullName}
            url={profile.avatarUrl}
            className="size-20 text-xl"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">Profile picture</p>
            <p className="mt-1 text-sm text-ink-500">
              A square photo works best. JPEG, PNG, WebP or GIF up to{" "}
              {formatBytes(AVATAR_MAX_BYTES)}.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <FilePicker
                label={uploadingAvatar ? "Uploading…" : "Choose a photo"}
                accept={AVATAR_MIME_TYPES.join(",")}
                maxBytes={AVATAR_MAX_BYTES}
                onPick={pickAvatar}
                className="w-full sm:w-56"
              />
              {profile.avatarUrl ? (
                <Button
                  variant="ghost"
                  onClick={() => void updateProfile({ avatarUrl: null })}
                >
                  <Camera />
                  Use initials
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </Panel>

      <Panel>
        <PanelTitle title="Details" />
        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <Field
            id="profile-name"
            label="Full name"
            value={draft.fullName}
            placeholder="Awa Sanneh"
            onChange={(fullName) => setEdits((e) => ({ ...e, fullName }))}
          />
          <Field
            id="profile-cohort"
            label="Cohort"
            value={draft.cohort}
            placeholder="Data — Sept 2026"
            onChange={(cohort) => setEdits((e) => ({ ...e, cohort }))}
          />
          <Field
            id="profile-location"
            label="Location"
            value={draft.location}
            placeholder="Kanifing, The Gambia"
            onChange={(location) => setEdits((e) => ({ ...e, location }))}
          />
          <Field
            id="profile-headline"
            label="Headline"
            value={draft.headline}
            placeholder="Data analytics learner looking for a first role"
            onChange={(headline) => setEdits((e) => ({ ...e, headline }))}
          />
        </div>
      </Panel>

      <Panel>
        <PanelTitle
          title="Your files"
          action={
            <span className="text-xs text-ink-500 tabular-nums">
              {files.length
                ? `${files.length} file${files.length === 1 ? "" : "s"} · ${formatBytes(totalBytes)}`
                : `Up to ${formatBytes(EVIDENCE_MAX_BYTES)} each`}
            </span>
          }
        />
        <div className="space-y-3 p-5">
          {files.length ? (
            <ul className="space-y-1.5">
              {files.map((file) => (
                <FileRow
                  key={file.id}
                  file={file}
                  onRemove={() => void removeFile(file)}
                />
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={FolderOpen}
              title="No files yet"
              body="Datasets, notebooks, decision memos — anything you want a tutor or employer to see."
            />
          )}
          <FilePicker
            label="Upload a file"
            onPick={async (file) => {
              await uploadFile(file);
              toast.success(`${file.name} uploaded`);
            }}
          />
          {!remote && files.some((f) => !f.url) ? (
            <p className="flex items-start gap-2 text-xs text-ink-500">
              <Trash2 className="mt-0.5 size-3.5 shrink-0" />
              Files over {formatBytes(700 * 1024)} keep their record but not
              their contents in browser-only mode.
            </p>
          ) : null}
        </div>
      </Panel>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  placeholder,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="h-10"
      />
    </div>
  );
}
