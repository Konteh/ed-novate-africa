"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BadgeCheck,
  BriefcaseBusiness,
  ClipboardCheck,
  Compass,
  Globe2,
  GraduationCap,
  LayoutDashboard,
  LogOut,
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
  { href: "/student", label: "Overview", short: "Home", icon: LayoutDashboard },
  { href: "/student/compass", label: "Career Compass", short: "Compass", icon: Compass },
  { href: "/student/studio", label: "Learning Studio", short: "Studio", icon: GraduationCap },
  { href: "/student/passport", label: "Skills Passport", short: "Passport", icon: BadgeCheck },
  { href: "/student/bridge", label: "Talent Bridge", short: "Jobs", icon: BriefcaseBusiness },
];

const educatorNav = [
  { href: "/educator", label: "Overview", short: "Home", icon: LayoutDashboard },
  { href: "/educator/roster", label: "Cohort Roster", short: "Roster", icon: Users },
  { href: "/educator/evidence", label: "Evidence Queue", short: "Evidence", icon: ClipboardCheck },
  { href: "/educator/intelligence", label: "Regional Intelligence", short: "Regions", icon: Globe2 },
];

export function AppShell({
  role,
  children,
}: {
  role: Role;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { session, signIn, signOut, resetDemo, hydrated, evidenceStatus, passport } =
    usePlatform();
  const [accountOpen, setAccountOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authRole, setAuthRole] = useState<Role>(role);

  // `?demo=student|educator` skips the illustrative login so a signed-in view
  // can be linked directly when showing the prototype. Read from the location
  // rather than useSearchParams so these routes still prerender statically.
  useEffect(() => {
    if (!hydrated || session?.role === role) return;
    const demo = new URLSearchParams(window.location.search).get("demo");
    if (demo === role) signIn(role);
  }, [hydrated, role, session?.role, signIn]);

  const nav = role === "student" ? studentNav : educatorNav;
  const profile = role === "student" ? studentProfile : educatorProfile;

  const queueCount = Object.values(evidenceStatus).filter((s) => s === "queued").length;
  const reviewCount = passport.filter((p) => p.status === "in-review").length;

  const badgeFor = (href: string) => {
    if (href === "/educator/evidence" && queueCount) return queueCount;
    if (href === "/student/passport" && reviewCount) return reviewCount;
    return null;
  };

  const isActive = (href: string) =>
    href === `/${role}` ? pathname === href : pathname.startsWith(href);

  if (!hydrated) {
    return (
      <div className="grid min-h-screen place-items-center bg-ink-50">
        <Mark className="size-10 animate-pulse" />
      </div>
    );
  }

  if (!session || session.role !== role) {
    return (
      <div className="grid min-h-screen place-items-center bg-ink-50 px-5 py-16">
        <div className="w-full max-w-sm rounded-xl border border-ink-200 bg-white p-7 text-center shadow-pop">
          <Mark className="mx-auto size-11" />
          <h1 className="mt-5 text-lg font-semibold">
            {role === "student" ? "Sign in to your path" : "Sign in to your cohort"}
          </h1>
          <p className="mt-1.5 text-sm text-ink-500">
            {session
              ? `You're signed in as ${session.name}. This area needs the ${role} account.`
              : "Demo credentials are filled in for you."}
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Button
              size="lg"
              variant={role === "educator" ? "accent" : "default"}
              onClick={() => {
                setAuthRole(role);
                setAuthOpen(true);
              }}
            >
              Log in as {role === "student" ? "a student" : "an educator"}
            </Button>
            <LinkButton variant="ghost" href="/">
              Back to home
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

  const secondaryActions = (
    <>
      <Link
        href={role === "student" ? "/educator" : "/student"}
        onClick={() => setAccountOpen(false)}
        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-navy-200 transition-colors hover:bg-white/10 hover:text-white"
      >
        {role === "student" ? <Users className="size-4" /> : <GraduationCap className="size-4" />}
        Switch to {role === "student" ? "educator" : "student"}
      </Link>
      <button
        type="button"
        onClick={() => {
          resetDemo();
          setAccountOpen(false);
        }}
        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-navy-200 transition-colors hover:bg-white/10 hover:text-white"
      >
        <RotateCcw className="size-4" />
        Reset demo data
      </button>
      <button
        type="button"
        onClick={signOut}
        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-navy-200 transition-colors hover:bg-white/10 hover:text-white"
      >
        <LogOut className="size-4" />
        Sign out
      </button>
    </>
  );

  const avatar = (
    <span
      className={cn(
        "grid size-8 shrink-0 place-items-center rounded-full text-xs font-semibold",
        role === "student" ? "bg-navy-500 text-white" : "bg-gold-400 text-navy-900",
      )}
    >
      {profile.initials}
    </span>
  );

  return (
    <div className="min-h-screen bg-ink-50">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col bg-navy-950 lg:flex">
        <Link
          href="/"
          className="flex items-center gap-2.5 px-5 py-5 outline-none focus-visible:ring-2 focus-visible:ring-gold-300/60"
        >
          <Mark className="bg-white/10" />
          <span className="text-[0.95rem] font-semibold text-white">
            Ed-Novate <span className="text-gold-300">Africa</span>
          </span>
        </Link>

        <nav className="flex-1 space-y-0.5 px-3 py-2">
          {nav.map((item) => {
            const active = isActive(item.href);
            const badge = badgeFor(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-gold-300/60",
                  active
                    ? "bg-white/10 font-medium text-white"
                    : "text-navy-200 hover:bg-white/5 hover:text-white",
                )}
              >
                <item.icon
                  className={cn("size-4 shrink-0", active ? "text-gold-300" : "text-navy-300")}
                />
                <span className="flex-1 truncate">{item.label}</span>
                {badge ? (
                  <span className="grid size-5 shrink-0 place-items-center rounded-full bg-gold-400 text-xs font-semibold text-navy-900 tabular-nums">
                    {badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-3">
          <div className="flex items-center gap-2.5 px-2 py-2">
            {avatar}
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">{profile.name}</p>
              <p className="truncate text-xs text-navy-300">
                {role === "student" ? studentProfile.cohort : educatorProfile.title}
              </p>
            </div>
          </div>
          <div className="mt-1 space-y-0.5">{secondaryActions}</div>
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-ink-200 bg-white/90 px-4 backdrop-blur-md lg:hidden">
        <Link href="/" className="flex items-center gap-2">
          <Mark className="size-7 rounded-lg" />
          <span className="text-sm font-semibold">Ed-Novate</span>
        </Link>
        <button
          type="button"
          onClick={() => setAccountOpen(true)}
          aria-label="Account and settings"
          className="ml-auto rounded-full outline-none focus-visible:ring-2 focus-visible:ring-navy-500/45"
        >
          {avatar}
        </button>
      </header>

      {accountOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setAccountOpen(false)}
            className="absolute inset-0 bg-navy-950/50 backdrop-blur-sm"
          />
          <div className="animate-fade-up absolute inset-x-0 bottom-0 rounded-t-2xl bg-navy-950 p-4 pb-8">
            <div className="flex items-center gap-2.5 px-2 pb-3">
              {avatar}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{profile.name}</p>
                <p className="truncate text-xs text-navy-300">
                  {role === "student" ? studentProfile.cohort : educatorProfile.title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAccountOpen(false)}
                aria-label="Close menu"
                className="rounded-lg p-2 text-navy-300 hover:bg-white/10 hover:text-white"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="space-y-0.5 border-t border-white/10 pt-3">{secondaryActions}</div>
          </div>
        </div>
      ) : null}

      <div className="lg:pl-60">
        <main className="px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:py-8 lg:pb-8">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-ink-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden">
        {nav.map((item) => {
          const active = isActive(item.href);
          const badge = badgeFor(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex flex-1 flex-col items-center gap-1 py-2.5 text-[0.68rem] font-medium transition-colors",
                active ? "text-navy-900" : "text-ink-400",
              )}
            >
              <span className="relative">
                <item.icon className="size-5" />
                {badge ? (
                  <span className="absolute -top-1 -right-1.5 grid size-3.5 place-items-center rounded-full bg-gold-400 text-[0.55rem] font-semibold text-navy-900">
                    {badge}
                  </span>
                ) : null}
              </span>
              {item.short}
              {active ? (
                <span className="absolute inset-x-4 top-0 h-0.5 rounded-full bg-navy-900" />
              ) : null}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
