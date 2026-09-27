import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CompetencyStatus } from "@/lib/types";

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        <p className="eyebrow text-gold-600">{eyebrow}</p>
        <h1 className="mt-2 font-heading text-[1.7rem] leading-tight font-extrabold text-navy-900 sm:text-[2rem]">
          {title}
        </h1>
        <p className="mt-2.5 text-[0.95rem] leading-relaxed text-navy-500">
          {description}
        </p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
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
        "rounded-2xl bg-white p-5 ring-1 ring-navy-100 sm:p-6",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function PanelTitle({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div>
        <h2 className="font-heading text-[1.05rem] font-bold text-navy-900">
          {title}
        </h2>
        {hint ? (
          <p className="mt-1 text-[0.85rem] leading-relaxed text-navy-500">
            {hint}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function StatTile({
  label,
  value,
  sub,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon?: LucideIcon;
  tone?: "default" | "gold" | "teal" | "navy";
}) {
  return (
    <div
      className={cn(
        "rounded-2xl p-5 ring-1",
        tone === "navy"
          ? "bg-navy-900 ring-navy-900"
          : "bg-white ring-navy-100",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p
          className={cn(
            "text-[0.78rem] font-semibold",
            tone === "navy" ? "text-navy-200" : "text-navy-500",
          )}
        >
          {label}
        </p>
        {Icon ? (
          <span
            className={cn(
              "grid size-8 shrink-0 place-items-center rounded-lg",
              tone === "gold" && "bg-gold-100 text-gold-700",
              tone === "teal" && "bg-teal-100 text-teal-700",
              tone === "navy" && "bg-white/10 text-gold-300",
              tone === "default" && "bg-navy-50 text-navy-600",
            )}
          >
            <Icon className="size-4" />
          </span>
        ) : null}
      </div>
      <p
        className={cn(
          "mt-3 font-heading text-[1.85rem] leading-none font-extrabold",
          tone === "navy" ? "text-white" : "text-navy-900",
        )}
      >
        {value}
      </p>
      {sub ? (
        <p
          className={cn(
            "mt-2 text-[0.78rem] leading-snug",
            tone === "navy" ? "text-navy-300" : "text-navy-400",
          )}
        >
          {sub}
        </p>
      ) : null}
    </div>
  );
}

const statusStyles: Record<CompetencyStatus, string> = {
  verified: "bg-teal-100 text-teal-700",
  "in-review": "bg-gold-100 text-gold-700",
  "not-started": "bg-navy-100 text-navy-500",
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
        "inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[0.68rem] font-bold tracking-wide uppercase",
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
  tone?: "default" | "gold" | "teal" | "outline";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[0.72rem] font-medium",
        tone === "default" && "bg-navy-50 text-navy-700",
        tone === "gold" && "bg-gold-100 text-gold-700",
        tone === "teal" && "bg-teal-100 text-teal-700",
        tone === "outline" && "text-navy-600 ring-1 ring-navy-200",
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
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-navy-200 bg-navy-50/40 px-6 py-12 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-white text-navy-400 ring-1 ring-navy-100">
        <Icon className="size-5" />
      </span>
      <h3 className="mt-4 font-heading text-[1.05rem] font-bold text-navy-900">
        {title}
      </h3>
      <p className="mt-2 max-w-md text-[0.88rem] leading-relaxed text-navy-500">
        {body}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
