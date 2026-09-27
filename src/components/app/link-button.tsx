import type { ComponentProps } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type ButtonProps = ComponentProps<typeof Button>;

/**
 * Base UI's Button asserts a native <button> unless told otherwise, so anchor
 * renders have to opt out explicitly.
 */
export function LinkButton({
  href,
  ...props
}: Omit<ButtonProps, "render" | "nativeButton"> & { href: string }) {
  return (
    <Button nativeButton={false} render={<Link href={href} />} {...props} />
  );
}
