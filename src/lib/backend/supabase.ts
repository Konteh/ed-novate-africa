import { getSupabaseClient, type TypedSupabaseClient } from "../supabase/client";
import { AVATAR_BUCKET, EVIDENCE_BUCKET } from "../supabase/config";
import type { ProfileRow } from "../supabase/database.types";
import type {
  Application,
  CompassResult,
  DeliveryMode,
  Enrollment,
  LearnerState,
  PassportEntry,
  ProfileFields,
  StoredFile,
  TrackId,
} from "../types";
import type { Backend } from "./types";

const SIGNED_URL_TTL = 60 * 60;

async function requireSession() {
  const client = getSupabaseClient();
  if (!client) return null;
  const { data } = await client.auth.getUser();
  if (!data.user) return null;
  return { client, userId: data.user.id };
}

/** The UI shows dates as "2 March 2026"; Postgres wants `date`. */
function toIsoDate(label: string | undefined): string | null {
  if (!label) return null;
  const parsed = new Date(label);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().slice(0, 10);
}

function toDisplayDate(iso: string | null): string | undefined {
  if (!iso) return undefined;
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function safeName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(-80);
}

async function signFiles(
  client: TypedSupabaseClient,
  rows: {
    id: string;
    storage_path: string;
    file_name: string;
    mime_type: string | null;
    size_bytes: number | null;
    uploaded_at: string;
  }[],
): Promise<StoredFile[]> {
  if (rows.length === 0) return [];

  const { data } = await client.storage
    .from(EVIDENCE_BUCKET)
    .createSignedUrls(
      rows.map((r) => r.storage_path),
      SIGNED_URL_TTL,
    );

  const urlByPath = new Map(
    (data ?? []).map((entry) => [entry.path ?? "", entry.signedUrl ?? ""]),
  );

  return rows.map((row) => ({
    id: row.id,
    name: row.file_name,
    path: row.storage_path,
    url: urlByPath.get(row.storage_path) ?? "",
    mimeType: row.mime_type ?? "application/octet-stream",
    sizeBytes: row.size_bytes ?? 0,
    uploadedAt: row.uploaded_at,
  }));
}

/**
 * Postgres + Storage backend. Every method degrades to a no-op or `null` when
 * nobody is signed in, so a configured-but-anonymous visitor sees the same
 * seeded demo rather than an error screen.
 */
export const supabaseBackend: Backend = {
  kind: "supabase",

  async loadState() {
    const session = await requireSession();
    if (!session) return null;
    const { client, userId } = session;

    const [enrollments, compass, passport, applications] = await Promise.all([
      client
        .from("enrollments")
        .select("*")
        .eq("student_id", userId)
        .order("created_at"),
      client
        .from("compass_results")
        .select("*")
        .eq("student_id", userId)
        .maybeSingle(),
      client
        .from("passport_entries")
        .select("*")
        .eq("student_id", userId)
        .order("created_at"),
      client
        .from("applications")
        .select("*")
        .eq("student_id", userId)
        .order("created_at"),
    ]);

    // A brand new account has no rows at all. Returning null lets the caller
    // keep the seeded state instead of showing an empty shell.
    const empty =
      !enrollments.data?.length &&
      !compass.data &&
      !passport.data?.length &&
      !applications.data?.length;
    if (empty) return null;

    const state: LearnerState = {
      enrollments: (enrollments.data ?? []).map<Enrollment>((row) => ({
        slug: row.course_slug,
        mode: row.mode as DeliveryMode,
        progress: row.progress,
        enrolledOn: toDisplayDate(row.enrolled_on) ?? "",
      })),
      compass: compass.data
        ? ({
            trackId: compass.data.track_id as TrackId,
            primarySlug: compass.data.primary_slug,
            alternateSlugs: compass.data.alternate_slugs ?? [],
            mode: compass.data.mode as DeliveryMode,
            reasons: compass.data.reasons ?? [],
            openQuestion: compass.data.open_question ?? "",
            answers: compass.data.answers ?? {},
          } satisfies CompassResult)
        : null,
      passport: (passport.data ?? []).map<PassportEntry>((row) => ({
        id: row.id,
        competency: row.competency,
        courseSlug: row.course_slug ?? "",
        evidenceTitle: row.evidence_title ?? "",
        evidenceSummary: row.evidence_summary ?? "",
        status: row.status,
        verifiedOn: toDisplayDate(row.verified_on),
        submittedOn: toDisplayDate(row.submitted_on),
        employerViews: row.employer_views,
      })),
      applications: (applications.data ?? []).map<Application>((row) => ({
        roleId: row.role_id,
        stage: row.stage,
        appliedOn: toDisplayDate(row.applied_on) ?? "",
      })),
    };

    return state;
  },

  async saveState(state) {
    const session = await requireSession();
    if (!session) return;
    const { client, userId } = session;

    const enrollments = state.enrollments.map((e) => ({
      student_id: userId,
      course_slug: e.slug,
      mode: e.mode,
      progress: e.progress,
      enrolled_on: toIsoDate(e.enrolledOn) ?? undefined,
    }));

    const passport = state.passport.map((p) => ({
      student_id: userId,
      competency: p.competency,
      course_slug: p.courseSlug || null,
      status: p.status,
      evidence_title: p.evidenceTitle || null,
      evidence_summary: p.evidenceSummary || null,
      submitted_on: toIsoDate(p.submittedOn),
      verified_on: toIsoDate(p.verifiedOn),
      employer_views: p.employerViews,
    }));

    const applications = state.applications.map((a) => ({
      student_id: userId,
      role_id: a.roleId,
      stage: a.stage,
      applied_on: toIsoDate(a.appliedOn) ?? undefined,
    }));

    await Promise.all([
      enrollments.length
        ? client
            .from("enrollments")
            .upsert(enrollments, { onConflict: "student_id,course_slug" })
        : Promise.resolve(),
      passport.length
        ? client
            .from("passport_entries")
            .upsert(passport, { onConflict: "student_id,competency" })
        : Promise.resolve(),
      applications.length
        ? client
            .from("applications")
            .upsert(applications, { onConflict: "student_id,role_id" })
        : Promise.resolve(),
      state.compass
        ? client.from("compass_results").upsert({
            student_id: userId,
            track_id: state.compass.trackId,
            primary_slug: state.compass.primarySlug,
            alternate_slugs: state.compass.alternateSlugs,
            mode: state.compass.mode,
            reasons: state.compass.reasons,
            open_question: state.compass.openQuestion,
            answers: state.compass.answers,
          })
        : client.from("compass_results").delete().eq("student_id", userId),
    ]);

    // Anything the learner dropped locally has to go, or un-enrolling would
    // silently come back on the next load.
    const keptSlugs = state.enrollments.map((e) => e.slug);
    if (keptSlugs.length) {
      await client
        .from("enrollments")
        .delete()
        .eq("student_id", userId)
        .not("course_slug", "in", `(${keptSlugs.join(",")})`);
    }
  },

  async loadProfile() {
    const session = await requireSession();
    if (!session) return null;
    const { client, userId } = session;

    const { data } = await client
      .from("profiles")
      .select("full_name, headline, cohort, location, avatar_path")
      .eq("id", userId)
      .maybeSingle();

    if (!data) return null;

    const avatarUrl = data.avatar_path
      ? client.storage.from(AVATAR_BUCKET).getPublicUrl(data.avatar_path).data
          .publicUrl
      : null;

    return {
      fullName: data.full_name ?? "",
      headline: data.headline ?? "",
      cohort: data.cohort ?? "",
      location: data.location ?? "",
      avatarUrl,
    } satisfies ProfileFields;
  },

  async saveProfile(fields) {
    const session = await requireSession();
    if (!session) return;
    const { client, userId } = session;

    const patch: Partial<ProfileRow> = {};
    if (fields.fullName !== undefined) patch.full_name = fields.fullName;
    if (fields.headline !== undefined) patch.headline = fields.headline;
    if (fields.cohort !== undefined) patch.cohort = fields.cohort;
    if (fields.location !== undefined) patch.location = fields.location;
    if (Object.keys(patch).length === 0) return;

    const { error } = await client
      .from("profiles")
      .update(patch)
      .eq("id", userId);
    if (error) throw new Error(error.message);
  },

  async uploadAvatar(file) {
    const session = await requireSession();
    if (!session) throw new Error("Sign in to change your picture");
    const { client, userId } = session;

    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${userId}/avatar-${Date.now()}.${extension}`;

    const upload = await client.storage
      .from(AVATAR_BUCKET)
      .upload(path, file, { contentType: file.type, upsert: true });
    if (upload.error) throw new Error(upload.error.message);

    const { error } = await client
      .from("profiles")
      .update({ avatar_path: path })
      .eq("id", userId);
    if (error) throw new Error(error.message);

    return client.storage.from(AVATAR_BUCKET).getPublicUrl(path).data.publicUrl;
  },

  async listFiles() {
    const session = await requireSession();
    if (!session) return [];
    const { client, userId } = session;

    const { data } = await client
      .from("evidence_files")
      .select("id, storage_path, file_name, mime_type, size_bytes, uploaded_at")
      .eq("student_id", userId)
      .order("uploaded_at", { ascending: false });

    return signFiles(client, data ?? []);
  },

  async uploadFile(file, competency) {
    const session = await requireSession();
    if (!session) throw new Error("Sign in to upload files");
    const { client, userId } = session;

    const folder = competency ? safeName(competency) : "general";
    const path = `${userId}/${folder}/${Date.now()}-${safeName(file.name)}`;

    const upload = await client.storage
      .from(EVIDENCE_BUCKET)
      .upload(path, file, { contentType: file.type });
    if (upload.error) throw new Error(upload.error.message);

    const { data, error } = await client
      .from("evidence_files")
      .insert({
        student_id: userId,
        storage_path: path,
        file_name: file.name,
        mime_type: file.type || null,
        size_bytes: file.size,
      })
      .select("id, storage_path, file_name, mime_type, size_bytes, uploaded_at")
      .single();

    if (error || !data) {
      await client.storage.from(EVIDENCE_BUCKET).remove([path]);
      throw new Error(error?.message ?? "Upload failed");
    }

    const [stored] = await signFiles(client, [data]);
    return stored;
  },

  async deleteFile(file) {
    const session = await requireSession();
    if (!session) return;
    const { client } = session;

    await client.storage.from(EVIDENCE_BUCKET).remove([file.path]);
    await client.from("evidence_files").delete().eq("id", file.id);
  },
};
