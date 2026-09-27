"use client";

import { useState } from "react";
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

const credentials: Record<
  Role,
  { username: string; password: string; blurb: string; home: string }
> = {
  student: {
    username: "student",
    password: "student2026",
    blurb: "Continue your learning path",
    home: "/student",
  },
  educator: {
    username: "educator",
    password: "educator2026",
    blurb: "Review your cohort and evidence queue",
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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-[26.5rem] gap-0 overflow-hidden p-0 sm:max-w-[26.5rem]"
      >
        <div className="flex items-center justify-between bg-navy-900 px-5 py-3.5">
          <span className="flex items-center gap-2.5">
            <Mark className="size-8 bg-white/10 ring-1 ring-white/15" />
            <span className="text-sm font-semibold text-white">
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
          <DialogTitle className="text-lg font-semibold">Log in</DialogTitle>
          <DialogDescription className="mt-1 text-sm text-ink-500">
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

          <div className="mt-4 rounded-lg border border-ink-200 bg-ink-50 px-3.5 py-2.5 text-sm text-ink-600">
            Demo login{" "}
            <code className="rounded bg-white px-1 py-0.5 font-mono text-xs text-ink-900">
              {credentials[role].username}
            </code>{" "}
            <code className="rounded bg-white px-1 py-0.5 font-mono text-xs text-ink-900">
              {credentials[role].password}
            </code>
          </div>

          <LoginForm
            key={role}
            role={role}
            onDone={() => onOpenChange(false)}
          />

        </div>
      </DialogContent>
    </Dialog>
  );
}

function LoginForm({ role, onDone }: { role: Role; onDone: () => void }) {
  const router = useRouter();
  const { signIn } = usePlatform();
  const expected = credentials[role];
  const [username, setUsername] = useState(expected.username);
  const [password, setPassword] = useState(expected.password);
  const [reveal, setReveal] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (
      username.trim() !== expected.username ||
      password !== expected.password
    ) {
      setError(
        `Use ${expected.username} / ${expected.password}.`,
      );
      return;
    }
    setError(null);
    setBusy(true);
    window.setTimeout(() => {
      signIn(role);
      setBusy(false);
      onDone();
      router.push(expected.home);
    }, 650);
  };

  return (
    <form onSubmit={submit} className="mt-4 space-y-3.5">
      <div className="space-y-1.5">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          value={username}
          autoComplete="username"
          onChange={(e) => setUsername(e.target.value)}
          className="h-10"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
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
            className="absolute top-1/2 right-1 -translate-y-1/2 rounded-md p-2 text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"
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
          className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive"
        >
          {error}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={busy}
        size="xl"
        variant={role === "educator" ? "accent" : "default"}
        className="w-full"
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
  );
}
