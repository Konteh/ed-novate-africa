import { cn } from "@/lib/utils";

/**
 * Falls back to initials whenever there is no picture, which is most of the
 * time — an empty grey circle tells a learner nothing.
 */
export function ProfileAvatar({
  initials,
  name,
  url,
  tone = "brand",
  className,
}: {
  initials: string;
  name?: string;
  url?: string | null;
  tone?: "brand" | "accent";
  className?: string;
}) {
  if (url) {
    return (
      // A learner's own upload has no stable dimensions and never benefits
      // from the image optimiser, so the plain tag is the right call.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={name ? `${name}'s profile picture` : "Profile picture"}
        className={cn(
          "size-8 shrink-0 rounded-full object-cover ring-1 ring-black/5",
          className,
        )}
      />
    );
  }

  return (
    <span
      aria-hidden
      className={cn(
        "grid size-8 shrink-0 place-items-center rounded-full text-xs font-semibold",
        tone === "brand" ? "bg-blue-500 text-white" : "bg-gold-400 text-ink-900",
        className,
      )}
    >
      {initials}
    </span>
  );
}
