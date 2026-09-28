/**
 * Hand-written to match `supabase/migrations/0001_init.sql`. Regenerate with
 * `npx supabase gen types typescript --project-id <id> > src/lib/supabase/database.types.ts`
 * once you have a project linked.
 *
 * These are type aliases rather than interfaces on purpose: supabase-js
 * constrains every row to `Record<string, unknown>`, and only aliases get the
 * implicit index signature that satisfies it.
 */

export type UserRole = "student" | "educator";
export type DeliveryModeRow = "onsite" | "live" | "self-paced";
export type CompetencyStatusRow = "verified" | "in-review" | "not-started";
export type ApplicationStageRow =
  | "matched"
  | "introduced"
  | "interviewing"
  | "offer";

export type ProfileRow = {
  id: string;
  role: UserRole;
  full_name: string | null;
  headline: string | null;
  cohort: string | null;
  location: string | null;
  passport_id: string | null;
  avatar_path: string | null;
  created_at: string;
  updated_at: string;
};

export type EnrollmentRow = {
  id: string;
  student_id: string;
  course_slug: string;
  mode: DeliveryModeRow;
  progress: number;
  enrolled_on: string;
  created_at: string;
};

export type CompassResultRow = {
  student_id: string;
  track_id: string;
  primary_slug: string;
  alternate_slugs: string[];
  mode: DeliveryModeRow;
  reasons: string[];
  open_question: string | null;
  answers: Record<string, string>;
  updated_at: string;
};

export type PassportEntryRow = {
  id: string;
  student_id: string;
  competency: string;
  course_slug: string | null;
  status: CompetencyStatusRow;
  evidence_title: string | null;
  evidence_summary: string | null;
  submitted_on: string | null;
  verified_on: string | null;
  verified_by: string | null;
  reviewer_feedback: string | null;
  employer_views: number;
  created_at: string;
  updated_at: string;
};

export type EvidenceFileRow = {
  id: string;
  student_id: string;
  entry_id: string | null;
  storage_path: string;
  file_name: string;
  mime_type: string | null;
  size_bytes: number | null;
  uploaded_at: string;
};

export type ApplicationRow = {
  id: string;
  student_id: string;
  role_id: string;
  stage: ApplicationStageRow;
  applied_on: string;
  created_at: string;
};

type Table<Row> = {
  Row: Row;
  Insert: Partial<Row>;
  Update: Partial<Row>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: Table<ProfileRow>;
      enrollments: Table<EnrollmentRow>;
      compass_results: Table<CompassResultRow>;
      passport_entries: Table<PassportEntryRow>;
      evidence_files: Table<EvidenceFileRow>;
      applications: Table<ApplicationRow>;
    };
    Views: Record<string, never>;
    Functions: {
      is_educator: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: {
      user_role: UserRole;
      delivery_mode: DeliveryModeRow;
      competency_status: CompetencyStatusRow;
      application_stage: ApplicationStageRow;
    };
    CompositeTypes: Record<string, never>;
  };
};
