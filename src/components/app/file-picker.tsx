"use client";

import { useId, useRef, useState } from "react";
import { FileUp, Loader2, Paperclip, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatBytes } from "@/lib/image";
import { EVIDENCE_MAX_BYTES } from "@/lib/supabase/config";
import type { StoredFile } from "@/lib/types";
import { cn } from "@/lib/utils";

export function FileRow({
  file,
  onRemove,
}: {
  file: StoredFile;
  onRemove?: () => void;
}) {
  return (
    <li className="flex items-center gap-3 rounded-lg bg-ink-100 px-3 py-2 text-sm">
      <Paperclip className="size-3.5 shrink-0 text-ink-400" />
      <span className="min-w-0 flex-1 truncate text-ink-700">
        {file.url ? (
          <a
            href={file.url}
            target="_blank"
            rel="noreferrer"
            className="underline decoration-ink-300 underline-offset-2 hover:decoration-ink-600"
          >
            {file.name}
          </a>
        ) : (
          file.name
        )}
      </span>
      <span className="shrink-0 text-xs text-ink-400 tabular-nums">
        {formatBytes(file.sizeBytes)}
      </span>
      {onRemove ? (
        <button
          type="button"
          aria-label={`Remove ${file.name}`}
          onClick={onRemove}
          className="shrink-0 rounded-md p-1 text-ink-400 transition-colors hover:bg-white hover:text-destructive"
        >
          <X className="size-3.5" />
        </button>
      ) : null}
    </li>
  );
}

/**
 * One button, a real file input behind it, and the errors a learner can
 * actually act on. Drag-and-drop is handled too because attaching a screenshot
 * is the single most common thing that happens here.
 */
export function FilePicker({
  label = "Attach a file",
  accept,
  maxBytes = EVIDENCE_MAX_BYTES,
  onPick,
  className,
}: {
  label?: string;
  accept?: string;
  maxBytes?: number;
  onPick: (file: File) => Promise<void> | void;
  className?: string;
}) {
  const inputId = useId();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handle = async (file: File | undefined) => {
    if (!file) return;
    setError(null);

    if (file.size > maxBytes) {
      setError(`${file.name} is ${formatBytes(file.size)}. The limit is ${formatBytes(maxBytes)}.`);
      return;
    }

    setBusy(true);
    try {
      await onPick(file);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Upload failed");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <input
        ref={input}
        id={inputId}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(e) => void handle(e.target.files?.[0])}
      />
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void handle(e.dataTransfer.files?.[0]);
        }}
      >
        <Button
          type="button"
          variant="outline"
          disabled={busy}
          onClick={() => input.current?.click()}
          className={cn(
            "w-full border-dashed",
            dragging && "border-blue-500 bg-blue-50 text-blue-700",
          )}
        >
          {busy ? <Loader2 className="animate-spin" /> : <FileUp />}
          {busy ? "Uploading…" : dragging ? "Drop to attach" : label}
        </Button>
      </div>
      {error ? (
        <p role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
