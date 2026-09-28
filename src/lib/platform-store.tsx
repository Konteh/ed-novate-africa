"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";

import { backend, usingSupabase, withLocalFallback } from "./backend";
import { localBackend } from "./backend/local";
import {
  courses,
  evidenceQueue,
  initialPassport,
  openRoles,
  studentProfile,
} from "./data";
import type {
  Application,
  CompassResult,
  DeliveryMode,
  Enrollment,
  LearnerState,
  PassportEntry,
  ProfileFields,
  Role,
  Session,
  StoredFile,
} from "./types";

export type {
  Application,
  CompassResult,
  Enrollment,
  ProfileFields,
  Session,
  StoredFile,
};

const STORAGE_KEY = "ednovate-labs-prototype-v1";

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
  profile: ProfileFields;
  files: StoredFile[];
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
  profile: {
    fullName: studentProfile.name,
    headline: "Data analytics learner, September 2026 cohort",
    cohort: studentProfile.cohort,
    location: studentProfile.location,
    avatarUrl: null,
  },
  files: [],
};

/**
 * The app keeps its whole world in one external store so that a learner can
 * navigate, enrol, submit evidence and come back later. localStorage is always
 * the local cache: it paints instantly and needs no setup. When Supabase
 * credentials exist the same state is mirrored to Postgres and Storage, so the
 * work follows the learner to another device.
 *
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

function learnerSlice(from: StoreState): LearnerState {
  return {
    enrollments: from.enrollments,
    compass: from.compass,
    passport: from.passport,
    applications: from.applications,
  };
}

// Enrolling, submitting and applying all fire in quick succession while a
// learner clicks around. One write after things settle is plenty.
let pushTimer: number | undefined;

function scheduleRemotePush() {
  if (!usingSupabase || typeof window === "undefined") return;
  window.clearTimeout(pushTimer);
  pushTimer = window.setTimeout(() => {
    void backend.saveState(learnerSlice(state)).catch(() => {
      // localStorage already holds this state; a failed sync is not fatal.
    });
  }, 600);
}

function emit() {
  for (const listener of listeners) listener();
}

let pulled = false;

/** One-time read of whatever the backend already knows about this learner. */
function pullRemote() {
  if (pulled) return;
  pulled = true;

  void (async () => {
    const [remoteState, remoteProfile, remoteFiles] = await Promise.all([
      usingSupabase
        ? withLocalFallback(
            () => backend.loadState(),
            async () => null,
          )
        : Promise.resolve(null),
      withLocalFallback(
        () => backend.loadProfile(),
        () => localBackend.loadProfile(),
      ),
      withLocalFallback(
        () => backend.listFiles(),
        () => localBackend.listFiles(),
      ),
    ]);

    if (!remoteState && !remoteProfile && remoteFiles.length === 0) return;

    update((prev) => ({
      ...prev,
      ...(remoteState ?? {}),
      profile: { ...prev.profile, ...(remoteProfile ?? {}) },
      files: remoteFiles.length ? remoteFiles : prev.files,
    }));
  })();
}

function subscribe(listener: () => void) {
  if (!state.hydrated) {
    state = readPersisted();
    emit();
  }
  pullRemote();
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
  /** True when a real database is behind the screens. */
  remote: boolean;
  signIn: (role: Role) => void;
  signOut: () => void;
  enroll: (slug: string, mode: DeliveryMode) => void;
  isEnrolled: (slug: string) => boolean;
  enrollmentFor: (slug: string) => Enrollment | undefined;
  setCompass: (result: CompassResult | null) => void;
  submitEvidence: (
    competency: string,
    title: string,
    summary: string,
    files?: StoredFile[],
  ) => void;
  apply: (roleId: string) => void;
  applicationFor: (roleId: string) => Application | undefined;
  reviewEvidence: (
    id: string,
    outcome: "verified" | "returned",
    feedback: string,
  ) => void;
  updateProfile: (fields: Partial<ProfileFields>) => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
  uploadFile: (file: File, competency?: string) => Promise<StoredFile>;
  deleteFile: (file: StoredFile) => Promise<void>;
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
        name:
          role === "student"
            ? prev.profile.fullName || "Awa Sanneh"
            : "Fatoumatta Jallow",
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
    scheduleRemotePush();
  }, []);

  const setCompass = useCallback((result: CompassResult | null) => {
    update((prev) => ({ ...prev, compass: result }));
    scheduleRemotePush();
  }, []);

  const submitEvidence = useCallback(
    (
      competency: string,
      title: string,
      summary: string,
      files: StoredFile[] = [],
    ) => {
      const attachments = files.map((f) => f.name);
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
                    attachments,
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
              attachments,
            },
          ],
        };
      });
      scheduleRemotePush();
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
    scheduleRemotePush();
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

  const updateProfile = useCallback(async (fields: Partial<ProfileFields>) => {
    update((prev) => ({ ...prev, profile: { ...prev.profile, ...fields } }));
    await withLocalFallback(
      () => backend.saveProfile(fields),
      () => localBackend.saveProfile(fields),
    );
  }, []);

  const uploadAvatar = useCallback(async (file: File) => {
    const url = await withLocalFallback(
      () => backend.uploadAvatar(file),
      () => localBackend.uploadAvatar(file),
    );
    update((prev) => ({
      ...prev,
      profile: { ...prev.profile, avatarUrl: url },
    }));
  }, []);

  const uploadFile = useCallback(
    async (file: File, competency?: string) => {
      const stored = await withLocalFallback(
        () => backend.uploadFile(file, competency),
        () => localBackend.uploadFile(file, competency),
      );
      update((prev) => ({ ...prev, files: [stored, ...prev.files] }));
      return stored;
    },
    [],
  );

  const deleteFile = useCallback(async (file: StoredFile) => {
    update((prev) => ({
      ...prev,
      files: prev.files.filter((f) => f.id !== file.id),
    }));
    await withLocalFallback(
      () => backend.deleteFile(file),
      () => localBackend.deleteFile(file),
    );
  }, []);

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
      remote: usingSupabase,
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
      updateProfile,
      uploadAvatar,
      uploadFile,
      deleteFile,
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
      updateProfile,
      uploadAvatar,
      uploadFile,
      deleteFile,
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
