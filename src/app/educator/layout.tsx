import { AppShell } from "@/components/app/app-shell";

export default function EducatorLayout({ children }: LayoutProps<"/educator">) {
  return <AppShell role="educator">{children}</AppShell>;
}
