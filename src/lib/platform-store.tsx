"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import { courses, evidenceQueue, initialPassport, openRoles } from "./data";
import type {
  ApplicationStage,
  DeliveryMode,
  PassportEntry,
  Role,
  TrackId,
} from "./types";

const STORAGE_KEY = "ed-novate-prototype-v1";

export interface Session {
  role: Role;
  name: string;
}

export interface Enrollment {
  slug: string;
  mode: DeliveryMode;
  progress: number;
  enrolledOn: string;
}

export interface CompassResult {
  trackId: TrackId;
  primarySlug: string;
  alternateSlugs: string[];
  mode: DeliveryMode;
  reasons: string[];
  openQuestion: string;
  answers: Record<string, string>;
}

export interface Application {
  roleId: string;
  stage: ApplicationStage;
  appliedOn: string;
}

type EvidenceOutcome = "queued" | "verified" | "returned";

interface StoreState {
  hydrated: boolean;
  session: Session | null;
  enrollments: Enrollment[];
  compass: CompassResult | null;
  passport: PassportEntry[];
  applications: Application[];
  evidenceStatus: Record<string, EvidenceOutcome>;
  sentFeedback: Record<string, string>;
}

const baseState: StoreState = {
  hydrated: false,
  session: null,
  enrollments: [
    {
      slug: "data-analytics-foundations",
      mode: "onsite",
      progress: 82,
      enrolledOn: "2 March 2026",
    },
  ],
  compass: null,
  passport: initialPassport,
  applications: [
    { roleId: "role-2", stage: "introduced", appliedOn: "18 September 2026" },
  ],
  evidenceStatus: Object.fromEntries(
    evidenceQueue.map((e) => [e.id, e.status]),
  ) as Record<string, EvidenceOutcome>,
  sentFeedback: {},
};

/**
 * The prototype keeps its whole world in one external store so that a reader
 * can navigate, enrol, submit evidence and come back later without a backend.
 * `useSyncExternalStore` lets the server render `baseState` and the browser
 * swap in the persisted copy after hydration, with no mismatch.
 */
let state: StoreState = baseState;
let persistedState: StoreState | null = null;
const listeners = new Set<() => void>();

function readPersisted(): StoreState {
  if (persistedState) return persistedState;
  let next: StoreState = { ...baseState, hydrated: true };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      next = { ...next, ...(JSON.parse(raw) as Partial<StoreState>) };
    }
  } catch {
    // A corrupt or unavailable store just means the demo starts fresh.
  }
  next.hydrated = true;
  persistedState = next;
  return next;
}

function persist() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Private-mode browsers block writes; the demo still works in memory.
  }
}

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  if (!state.hydrated) {
    state = readPersisted();
    emit();
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return state;
}

function getServerSnapshot() {
  return baseState;
}

function update(updater: (prev: StoreState) => StoreState) {
  const next = updater(state);
  if (next === state) return;
  state = next;
  persistedState = next;
  persist();
  emit();
}

function todayLabel() {
  return new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

interface StoreValue extends StoreState {
  signIn: (role: Role) => void;
  signOut: () => void;
  enroll: (slug: string, mode: DeliveryMode) => void;
  isEnrolled: (slug: string) => boolean;
  enrollmentFor: (slug: string) => Enrollment | undefined;
  setCompass: (result: CompassResult | null) => void;
  submitEvidence: (competency: string, title: string, summary: string) => void;
  apply: (roleId: string) => void;
  applicationFor: (roleId: string) => Application | undefined;
  reviewEvidence: (
    id: string,
    outcome: "verified" | "returned",
    feedback: string,
  ) => void;
  resetDemo: () => void;
}

const PlatformContext = createContext<StoreValue | null>(null);

export function PlatformProvider({ children }: { children: React.ReactNode }) {
  const snapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const signIn = useCallback((role: Role) => {
    update((prev) => ({
      ...prev,
      session: {
        role,
        name: role === "student" ? "Awa Sanneh" : "Fatoumatta Jallow",
      },
    }));
  }, []);

  const signOut = useCallback(() => {
    update((prev) => ({ ...prev, session: null }));
  }, []);

  const enroll = useCallback((slug: string, mode: DeliveryMode) => {
    update((prev) => {
      if (prev.enrollments.some((e) => e.slug === slug)) {
        return {
          ...prev,
          enrollments: prev.enrollments.map((e) =>
            e.slug === slug ? { ...e, mode } : e,
          ),
        };
      }
      return {
        ...prev,
        enrollments: [
          ...prev.enrollments,
          { slug, mode, progress: 0, enrolledOn: todayLabel() },
        ],
      };
    });
  }, []);

  const setCompass = useCallback((result: CompassResult | null) => {
    update((prev) => ({ ...prev, compass: result }));
  }, []);

  const submitEvidence = useCallback(
    (competency: string, title: string, summary: string) => {
      update((prev) => {
        if (prev.passport.some((p) => p.competency === competency)) {
          return {
            ...prev,
            passport: prev.passport.map((p) =>
              p.competency === competency
                ? {
                    ...p,
                    status: "in-review",
                    evidenceTitle: title,
                    evidenceSummary: summary,
                    submittedOn: todayLabel(),
                  }
                : p,
            ),
          };
        }
        const courseSlug =
          courses.find((c) => c.skills.includes(competency))?.slug ??
          "data-analytics-foundations";
        return {
          ...prev,
          passport: [
            ...prev.passport,
            {
              id: `pp-${Date.now()}`,
              competency,
              courseSlug,
              evidenceTitle: title,
              evidenceSummary: summary,
              status: "in-review",
              submittedOn: todayLabel(),
              employerViews: 0,
            },
          ],
        };
      });
    },
    [],
  );

  const apply = useCallback((roleId: string) => {
    update((prev) => {
      if (prev.applications.some((a) => a.roleId === roleId)) return prev;
      return {
        ...prev,
        applications: [
          ...prev.applications,
          { roleId, stage: "introduced", appliedOn: todayLabel() },
        ],
      };
    });
  }, []);

  const reviewEvidence = useCallback(
    (id: string, outcome: "verified" | "returned", feedback: string) => {
      update((prev) => ({
        ...prev,
        evidenceStatus: { ...prev.evidenceStatus, [id]: outcome },
        sentFeedback: { ...prev.sentFeedback, [id]: feedback },
      }));
    },
    [],
  );

  const resetDemo = useCallback(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Nothing to clear.
    }
    update(() => ({ ...baseState, hydrated: true }));
  }, []);

  const value = useMemo<StoreValue>(
    () => ({
      ...snapshot,
      signIn,
      signOut,
      enroll,
      isEnrolled: (slug) => snapshot.enrollments.some((e) => e.slug === slug),
      enrollmentFor: (slug) =>
        snapshot.enrollments.find((e) => e.slug === slug),
      setCompass,
      submitEvidence,
      apply,
      applicationFor: (roleId) =>
        snapshot.applications.find((a) => a.roleId === roleId),
      reviewEvidence,
      resetDemo,
    }),
    [
      snapshot,
      signIn,
      signOut,
      enroll,
      setCompass,
      submitEvidence,
      apply,
      reviewEvidence,
      resetDemo,
    ],
  );

  return (
    <PlatformContext.Provider value={value}>
      {children}
    </PlatformContext.Provider>
  );
}

export function usePlatform() {
  const ctx = useContext(PlatformContext);
  if (!ctx) {
    throw new Error("usePlatform must be used inside PlatformProvider");
  }
  return ctx;
}

export const roleById = (id: string) => openRoles.find((r) => r.id === id);
