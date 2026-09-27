import { cn } from "@/lib/utils";

export function Mark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative grid size-9 shrink-0 place-items-center overflow-hidden rounded-[0.7rem] bg-navy-900",
        className,
      )}
      aria-hidden
    >
      <span className="absolute -right-2 -bottom-2 size-6 rounded-full bg-gold-400/90" />
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="relative size-5 text-white"
        strokeWidth={1.9}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 8.5 12 4l9 4.5-9 4.5-9-4.5Z" />
        <path d="M7 11v4.6c0 1.3 2.2 2.4 5 2.4s5-1.1 5-2.4V11" />
      </svg>
    </span>
  );
}

export function Wordmark({
  className,
  subtitle,
}: {
  className?: string;
  subtitle?: string;
}) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <Mark />
      <span className="flex flex-col leading-none">
        <span className="font-heading text-[0.97rem] font-bold tracking-tight text-navy-900">
          Ed-Novate <span className="text-gold-500">Africa</span>
        </span>
        {subtitle ? (
          <span className="mt-1 text-[0.68rem] font-medium tracking-wide text-navy-400">
            {subtitle}
          </span>
        ) : null}
      </span>
    </span>
  );
}

export function WordmarkLight({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <Mark className="bg-white/10 ring-1 ring-white/15" />
      <span className="font-heading text-[0.97rem] font-bold tracking-tight text-white">
        Ed-Novate <span className="text-gold-300">Africa</span>
      </span>
    </span>
  );
}
