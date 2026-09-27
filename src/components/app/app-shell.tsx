"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  BadgeCheck,
  BriefcaseBusiness,
  ClipboardCheck,
  Compass,
  Globe2,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  RotateCcw,
  Users,
  X,
} from "lucide-react";
import { Mark } from "@/components/brand";
import { AuthDialog } from "@/components/auth-dialog";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/app/link-button";
import { usePlatform } from "@/lib/platform-store";
import { educatorProfile, studentProfile } from "@/lib/data";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";

const studentNav = [
  { href: "/student", label: "Overview", icon: LayoutDashboard },
  { href: "/student/compass", label: "Career Compass", icon: Compass },
  { href: "/student/studio", label: "Learning Studio", icon: GraduationCap },
  { href: "/student/passport", label: "Skills Passport", icon: BadgeCheck },
  {
    href: "/student/bridge",
    label: "Talent Bridge",
    icon: BriefcaseBusiness,
  },
];

const educatorNav = [
  { href: "/educator", label: "Overview", icon: LayoutDashboard },
  { href: "/educator/roster", label: "Cohort Roster", icon: Users },
  {
    href: "/educator/evidence",
    label: "Evidence Queue",
    icon: ClipboardCheck,
  },
  {
    href: "/educator/intelligence",
    label: "Regional Intelligence",
    icon: Globe2,
  },
];

export function AppShell({
  role,
  children,
}: {
  role: Role;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const {
    session,
    signIn,
    signOut,
    resetDemo,
    hydrated,
    evidenceStatus,
    passport,
  } = usePlatform();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authRole, setAuthRole] = useState<Role>(role);

  // `?demo=student|educator` skips the illustrative login so a signed-in view
  // can be linked directly when showing the prototype.
  const demoParam = searchParams.get("demo");
  useEffect(() => {
    if (!hydrated) return;
    if (demoParam === role && session?.role !== role) signIn(role);
  }, [demoParam, hydrated, role, session?.role, signIn]);

  const nav = role === "student" ? studentNav : educatorNav;
  const profile = role === "student" ? studentProfile : educatorProfile;

  const queueCount = Object.values(evidenceStatus).filter(
    (s) => s === "queued",
  ).length;
  const reviewCount = passport.filter((p) => p.status === "in-review").length;

  const badgeFor = (href: string) => {
    if (href === "/educator/evidence" && queueCount) return queueCount;
    if (href === "/student/passport" && reviewCount) return reviewCount;
    return null;
  };

  if (!hydrated) {
    return (
      <div className="grid min-h-screen place-items-center bg-navy-50">
        <div className="flex flex-col items-center gap-3">
          <Mark className="size-11 animate-pulse" />
          <p className="text-sm font-medium text-navy-500">
            Loading your workspace…
          </p>
        </div>
      </div>
    );
  }

  if (!session || session.role !== role) {
    return (
      <div className="grid min-h-screen place-items-center bg-navy-50 px-5 py-16">
        <div className="w-full max-w-md rounded-2xl bg-white p-7 text-center shadow-[0_24px_60px_-30px_rgba(13,33,55,0.45)] ring-1 ring-navy-100">
          <Mark className="mx-auto size-12" />
          <h1 className="mt-5 font-heading text-xl font-bold text-navy-900">
            {role === "student"
              ? "Sign in to open your learning path"
              : "Sign in to open your cohort"}
          </h1>
          <p className="mt-2 text-[0.9rem] leading-relaxed text-navy-500">
            {session
              ? `You are signed in as ${session.name}, an ${session.role}. This area needs the ${role} demo account.`
              : "This area of the prototype needs the demo login. It is pre-filled for you."}
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Button
              onClick={() => {
                setAuthRole(role);
                setAuthOpen(true);
              }}
              className={cn(
                "h-11 font-semibold",
                role === "educator"
                  ? "bg-gold-400 text-navy-900 hover:bg-gold-300"
                  : "bg-navy-900 hover:bg-navy-800",
              )}
            >
              Log in as {role === "student" ? "a student" : "an educator"}
            </Button>
            <LinkButton
              variant="ghost"
              href="/"
              className="h-10 text-navy-500"
            >
              Back to the overview page
            </LinkButton>
          </div>
        </div>
        <AuthDialog
          open={authOpen}
          onOpenChange={setAuthOpen}
          role={authRole}
          onRoleChange={setAuthRole}
        />
      </div>
    );
  }

  const sidebar = (
    <div className="flex h-full flex-col bg-navy-950">
      <div className="flex items-center justify-between px-5 py-5">
        <Link
          href="/"
          className="flex items-center gap-2.5"
          onClick={() => setMobileOpen(false)}
        >
          <Mark className="bg-white/10 ring-1 ring-white/15" />
          <span className="font-heading text-[0.93rem] font-bold text-white">
            Ed-Novate <span className="text-gold-300">Africa</span>
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="rounded-md p-1.5 text-navy-300 hover:bg-white/10 hover:text-white lg:hidden"
          aria-label="Close navigation"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="mx-4 rounded-xl bg-white/5 p-3.5 ring-1 ring-white/10">
        <div className="flex items-center gap-2.5">
          <span
            className={cn(
              "grid size-9 shrink-0 place-items-center rounded-full font-heading text-[0.8rem] font-bold",
              role === "student"
                ? "bg-navy-400 text-white"
                : "bg-gold-400 text-navy-900",
            )}
          >
            {profile.initials}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[0.87rem] font-semibold text-white">
              {profile.name}
            </p>
            <p className="truncate text-[0.72rem] text-navy-300">
              {role === "student"
                ? studentProfile.cohort
                : educatorProfile.title}
            </p>
          </div>
        </div>
      </div>

      <nav className="mt-6 flex-1 space-y-1 px-3">
        {nav.map((item) => {
          const active =
            item.href === `/${role}`
              ? pathname === item.href
              : pathname.startsWith(item.href);
          const badge = badgeFor(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[0.88rem] font-medium transition-colors",
                active
                  ? "bg-white/10 text-white"
                  : "text-navy-200 hover:bg-white/5 hover:text-white",
              )}
            >
              <item.icon
                className={cn(
                  "size-4 shrink-0",
                  active ? "text-gold-300" : "text-navy-300",
                )}
              />
              <span className="flex-1">{item.label}</span>
              {badge ? (
                <span className="grid size-5 place-items-center rounded-full bg-gold-400 font-heading text-[0.68rem] font-bold text-navy-900">
                  {badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-white/10 p-3">
        <Link
          href={role === "student" ? "/educator" : "/student"}
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[0.82rem] font-medium text-navy-300 transition-colors hover:bg-white/5 hover:text-white"
        >
          {role === "student" ? (
            <Users className="size-4" />
          ) : (
            <GraduationCap className="size-4" />
          )}
          Switch to the {role === "student" ? "educator" : "student"} view
        </Link>
        <button
          type="button"
          onClick={resetDemo}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-[0.82rem] font-medium text-navy-300 transition-colors hover:bg-white/5 hover:text-white"
        >
          <RotateCcw className="size-4" />
          Reset the demo data
        </button>
        <button
          type="button"
          onClick={signOut}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-[0.82rem] font-medium text-navy-300 transition-colors hover:bg-white/5 hover:text-white"
        >
          <LogOut className="size-4" />
          Sign out
        </button>
        <p className="px-3 pt-2 pb-1 text-[0.66rem] leading-relaxed text-navy-500">
          Prototype — all figures are illustrative demo data.
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-navy-50/60">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">
        {sidebar}
      </aside>

      {mobileOpen ? (
        <>
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-40 bg-navy-950/40 backdrop-blur-sm lg:hidden"
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-72 shadow-2xl lg:hidden">
            {sidebar}
          </aside>
        </>
      ) : null}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-navy-100 bg-white/90 px-4 backdrop-blur-md lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-2 text-navy-700 hover:bg-navy-50"
            aria-label="Open navigation"
          >
            <Menu className="size-5" />
          </button>
          <span className="font-heading text-[0.9rem] font-bold text-navy-900">
            Ed-Novate <span className="text-gold-500">Africa</span>
          </span>
          <span
            className={cn(
              "ml-auto grid size-8 place-items-center rounded-full font-heading text-[0.72rem] font-bold",
              role === "student"
                ? "bg-navy-800 text-white"
                : "bg-gold-400 text-navy-900",
            )}
          >
            {profile.initials}
          </span>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-9 lg:py-9">{children}</main>
      </div>
    </div>
  );
}
