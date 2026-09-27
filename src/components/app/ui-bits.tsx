import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CompetencyStatus } from "@/lib/types";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-[1.45rem] leading-tight font-semibold sm:text-[1.6rem]">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 text-sm text-ink-500">{description}</p>
        ) : null}
      </div>
      {action ? (
        <div className="flex shrink-0 items-center gap-2">{action}</div>
      ) : null}
    </div>
  );
}

export function Panel({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "rounded-xl border border-ink-200 bg-white shadow-card",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function PanelTitle({
  title,
  action,
  className,
}: {
  title: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 border-b border-ink-200 px-5 py-3",
        className,
      )}
    >
      <h2 className="text-sm font-semibold">{title}</h2>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/**
 * Stats read as one strip rather than a row of separate cards, so the numbers
 * line up and the page has one less box in it.
 */
export function StatRow({
  items,
  className,
}: {
  items: { label: string; value: string | number }[];
  className?: string;
}) {
  return (
    <dl
      className={cn(
        "grid grid-cols-2 divide-ink-200 overflow-hidden rounded-xl border border-ink-200 bg-white shadow-card sm:divide-x",
        items.length >= 4 ? "sm:grid-cols-4" : "sm:grid-cols-3",
        className,
      )}
    >
      {items.map((item) => (
        <div key={item.label} className="px-5 py-4">
          <dt className="text-xs font-medium text-ink-500">{item.label}</dt>
          <dd className="mt-1 text-[1.6rem] leading-none font-semibold tabular-nums">
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

const statusStyles: Record<CompetencyStatus, string> = {
  verified: "bg-ok-50 text-ok-600",
  "in-review": "bg-warn-50 text-warn-600",
  "not-started": "bg-ink-100 text-ink-500",
};

const statusLabels: Record<CompetencyStatus, string> = {
  verified: "Verified",
  "in-review": "In review",
  "not-started": "Not started",
};

export function StatusPill({
  status,
  className,
}: {
  status: CompetencyStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium",
        statusStyles[status],
        className,
      )}
    >
      {statusLabels[status]}
    </span>
  );
}

export function Tag({
  children,
  tone = "default",
  className,
}: {
  children: React.ReactNode;
  tone?: "default" | "accent" | "ok" | "outline";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        tone === "default" && "bg-ink-100 text-ink-600",
        tone === "accent" && "bg-gold-100 text-gold-700",
        tone === "ok" && "bg-ok-50 text-ok-600",
        tone === "outline" && "border border-ink-200 text-ink-600",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  body,
  action,
}: {
  icon: LucideIcon;
  title: string;
  body?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <Icon className="size-5 text-ink-400" />
      <h3 className="mt-3 text-sm font-semibold">{title}</h3>
      {body ? (
        <p className="mt-1 max-w-sm text-sm text-ink-500">{body}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
