import { downscaleImage, LOCAL_INLINE_LIMIT, readAsDataUrl } from "../image";
import type { LearnerState, ProfileFields, StoredFile } from "../types";
import type { Backend } from "./types";

const STATE_KEY = "ednovate-labs-prototype-v1";
const PROFILE_KEY = "ednovate-labs-profile-v1";
const FILES_KEY = "ednovate-labs-files-v1";

function read<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Private browsing and full quotas both land here. The session carries on
    // in memory; only the reload-survives-it promise is lost.
  }
}

/**
 * Browser-only backend. It is what runs on the public demo, and it is why the
 * app is useful before anyone sets up a database.
 */
export const localBackend: Backend = {
  kind: "local",

  async loadState() {
    return read<LearnerState>(STATE_KEY);
  },

  async saveState(state) {
    write(STATE_KEY, state);
  },

  async loadProfile() {
    return read<ProfileFields>(PROFILE_KEY);
  },

  async saveProfile(fields) {
    const current = read<ProfileFields>(PROFILE_KEY);
    write(PROFILE_KEY, { ...current, ...fields });
  },

  async uploadAvatar(file) {
    const url = await downscaleImage(file, 320);
    await localBackend.saveProfile({ avatarUrl: url });
    return url;
  },

  async listFiles() {
    return read<StoredFile[]>(FILES_KEY) ?? [];
  },

  async uploadFile(file) {
    // Keeping the bytes inline is what lets a demo attachment still open after
    // a reload. Past the limit only the record survives, which is honest about
    // what a browser can hold.
    let url = "";
    if (file.size <= LOCAL_INLINE_LIMIT) {
      const dataUrl = await readAsDataUrl(file);
      if (dataUrl.length <= LOCAL_INLINE_LIMIT * 1.4) url = dataUrl;
    }

    const record: StoredFile = {
      id: `file-${Date.now()}-${Math.round(Math.random() * 1e6)}`,
      name: file.name,
      path: `local/${file.name}`,
      url,
      mimeType: file.type || "application/octet-stream",
      sizeBytes: file.size,
      uploadedAt: new Date().toISOString(),
    };

    const next = [record, ...(read<StoredFile[]>(FILES_KEY) ?? [])];
    write(FILES_KEY, next);
    return record;
  },

  async deleteFile(file) {
    const next = (read<StoredFile[]>(FILES_KEY) ?? []).filter(
      (f) => f.id !== file.id,
    );
    write(FILES_KEY, next);
  },
};

export const localStorageKeys = [STATE_KEY, PROFILE_KEY, FILES_KEY];
