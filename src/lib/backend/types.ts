import type { LearnerState, ProfileFields, StoredFile } from "../types";

export type BackendKind = "local" | "supabase";

/**
 * The seam between the UI and wherever data actually lives. Two
 * implementations satisfy it: `local` keeps everything in the browser so the
 * demo needs no setup, `supabase` talks to Postgres and Storage.
 */
export interface Backend {
  readonly kind: BackendKind;

  /** `null` means "nothing saved yet, use the seeded demo state". */
  loadState(): Promise<LearnerState | null>;
  saveState(state: LearnerState): Promise<void>;

  loadProfile(): Promise<ProfileFields | null>;
  saveProfile(fields: Partial<ProfileFields>): Promise<void>;
  uploadAvatar(file: File): Promise<string>;

  listFiles(): Promise<StoredFile[]>;
  uploadFile(file: File, competency?: string): Promise<StoredFile>;
  deleteFile(file: StoredFile): Promise<void>;
}
