"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  courses,
  evidenceQueue,
  initialPassport,
  openRoles,
} from "./data";
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

interface StoreState {
  session: Session | null;
  enrollments: Enrollment[];
  compass: CompassResult | null;
  passport: PassportEntry[];
  applications: Application[];
  evidenceStatus: Record<string, "queued" | "verified" | "returned">;
  sentFeedback: Record<string, string>;
}

const baseState: StoreState = {
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
  ) as Record<string, "queued" | "verified" | "returned">,
  sentFeedback: {},
};

interface StoreValue extends StoreState {
  hydrated: boolean;
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

function todayLabel() {
  return new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function PlatformProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<StoreState>(baseState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<StoreState>;
        setState((prev) => ({ ...prev, ...parsed }));
      }
    } catch {
      // A corrupt or unavailable store just means the demo starts fresh.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Private-mode browsers block writes; the demo still works in memory.
    }
  }, [state, hydrated]);

  const signIn = useCallback((role: Role) => {
    setState((prev) => ({
      ...prev,
      session: {
        role,
        name: role === "student" ? "Awa Sanneh" : "Fatoumatta Jallow",
      },
    }));
  }, []);

  const signOut = useCallback(() => {
    setState((prev) => ({ ...prev, session: null }));
  }, []);

  const enroll = useCallback((slug: string, mode: DeliveryMode) => {
    setState((prev) => {
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
    setState((prev) => ({ ...prev, compass: result }));
  }, []);

  const submitEvidence = useCallback(
    (competency: string, title: string, summary: string) => {
      setState((prev) => {
        const existing = prev.passport.find((p) => p.competency === competency);
        if (existing) {
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
        const course =
          courses.find((c) => c.skills.includes(competency))?.slug ??
          "data-analytics-foundations";
        return {
          ...prev,
          passport: [
            ...prev.passport,
            {
              id: `pp-${Date.now()}`,
              competency,
              courseSlug: course,
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
    setState((prev) => {
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
      setState((prev) => ({
        ...prev,
        evidenceStatus: { ...prev.evidenceStatus, [id]: outcome },
        sentFeedback: { ...prev.sentFeedback, [id]: feedback },
      }));
    },
    [],
  );

  const resetDemo = useCallback(() => {
    setState({ ...baseState, session: null });
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Nothing to clear.
    }
  }, []);

  const value = useMemo<StoreValue>(
    () => ({
      ...state,
      hydrated,
      signIn,
      signOut,
      enroll,
      isEnrolled: (slug) => state.enrollments.some((e) => e.slug === slug),
      enrollmentFor: (slug) => state.enrollments.find((e) => e.slug === slug),
      setCompass,
      submitEvidence,
      apply,
      applicationFor: (roleId) =>
        state.applications.find((a) => a.roleId === roleId),
      reviewEvidence,
      resetDemo,
    }),
    [
      state,
      hydrated,
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
