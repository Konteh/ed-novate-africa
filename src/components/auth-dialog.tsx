"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, Loader2, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mark } from "@/components/brand";
import { usePlatform } from "@/lib/platform-store";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";

const credentials: Record<
  Role,
  { username: string; password: string; blurb: string; home: string }
> = {
  student: {
    username: "student",
    password: "student2026",
    blurb: "Sign in to continue your learning path",
    home: "/student",
  },
  educator: {
    username: "educator",
    password: "educator2026",
    blurb: "Sign in to review your cohort and evidence queue",
    home: "/educator",
  },
};

export function AuthDialog({
  open,
  onOpenChange,
  role,
  onRoleChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: Role;
  onRoleChange: (role: Role) => void;
}) {
  const router = useRouter();
  const { signIn } = usePlatform();
  const [username, setUsername] = useState(credentials[role].username);
  const [password, setPassword] = useState(credentials[role].password);
  const [reveal, setReveal] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setUsername(credentials[role].username);
    setPassword(credentials[role].password);
    setError(null);
  }, [role]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const expected = credentials[role];
    if (
      username.trim() !== expected.username ||
      password !== expected.password
    ) {
      setError(
        `That is not the demo login. Use ${expected.username} / ${expected.password}.`,
      );
      return;
    }
    setError(null);
    setBusy(true);
    window.setTimeout(() => {
      signIn(role);
      setBusy(false);
      onOpenChange(false);
      router.push(expected.home);
    }, 650);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-[26.5rem] gap-0 overflow-hidden p-0 sm:max-w-[26.5rem]"
      >
        <div className="flex items-center justify-between bg-navy-900 px-5 py-3.5">
          <span className="flex items-center gap-2.5">
            <Mark className="size-8 bg-white/10 ring-1 ring-white/15" />
            <span className="font-heading text-sm font-bold text-white">
              Ed-Novate <span className="text-gold-300">Africa</span>
            </span>
          </span>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-navy-100 transition-colors hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="size-3.5" />
            Back
          </button>
        </div>

        <div className="p-5">
          <DialogTitle className="text-xl font-bold text-navy-900">
            Log in to your account
          </DialogTitle>
          <DialogDescription className="mt-1 text-navy-500">
            {credentials[role].blurb}
          </DialogDescription>

          <Tabs
            value={role}
            onValueChange={(value) => onRoleChange(value as Role)}
            className="mt-4"
          >
            <TabsList className="grid h-9 w-full grid-cols-2">
              <TabsTrigger value="student" className="text-[0.82rem]">
                Student
              </TabsTrigger>
              <TabsTrigger value="educator" className="text-[0.82rem]">
                Educator
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="mt-4 rounded-lg bg-navy-50 px-3.5 py-2.5 text-[0.8rem] text-navy-700 ring-1 ring-navy-100">
            <span className="font-semibold">Demo login —</span> username{" "}
            <code className="rounded bg-white px-1 py-0.5 font-mono text-[0.75rem] text-navy-900">
              {credentials[role].username}
            </code>{" "}
            · password{" "}
            <code className="rounded bg-white px-1 py-0.5 font-mono text-[0.75rem] text-navy-900">
              {credentials[role].password}
            </code>
          </div>

          <form onSubmit={submit} className="mt-4 space-y-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-navy-800">
                Username
              </Label>
              <Input
                id="username"
                value={username}
                autoComplete="username"
                onChange={(e) => setUsername(e.target.value)}
                className="h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-navy-800">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={reveal ? "text" : "password"}
                  value={password}
                  autoComplete="current-password"
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setReveal((r) => !r)}
                  aria-label={reveal ? "Hide password" : "Show password"}
                  className="absolute top-1/2 right-1 -translate-y-1/2 rounded-md p-2 text-navy-400 transition-colors hover:text-navy-700"
                >
                  {reveal ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>

            {error ? (
              <p
                role="alert"
                className="rounded-lg bg-destructive/10 px-3 py-2 text-[0.8rem] font-medium text-destructive"
              >
                {error}
              </p>
            ) : null}

            <Button
              type="submit"
              disabled={busy}
              className={cn(
                "h-11 w-full text-[0.9rem] font-semibold",
                role === "educator"
                  ? "bg-gold-400 text-navy-900 hover:bg-gold-300"
                  : "bg-navy-900 text-white hover:bg-navy-800",
              )}
            >
              {busy ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Signing you in…
                </>
              ) : (
                <>
                  <LogIn className="size-4" />
                  Log in
                </>
              )}
            </Button>
          </form>

          <p className="mt-4 text-[0.72rem] leading-relaxed text-navy-400">
            Prototype note: this sign-in is illustrative. The demo username and
            password above are pre-filled, so you can just press Log in.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
