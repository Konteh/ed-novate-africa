export type Role = "student" | "educator";

export type DeliveryMode = "onsite" | "live" | "self-paced";

export type CourseLevel = "Foundation" | "Intermediate" | "Advanced";

export type TrackId =
  | "data"
  | "software"
  | "cloud"
  | "security"
  | "business"
  | "climate"
  | "fintech"
  | "ai";

export interface Track {
  id: TrackId;
  name: string;
  tagline: string;
  demandIndex: number;
}

export interface CourseModule {
  name: string;
  summary: string;
  competencies: string[];
  hours: number;
}

export interface Course {
  slug: string;
  title: string;
  track: TrackId;
  level: CourseLevel;
  blurb: string;
  description: string;
  weeks: number;
  hoursPerWeek: number;
  modes: DeliveryMode[];
  hub: string;
  tutor: string;
  tutorTitle: string;
  skills: string[];
  modules: CourseModule[];
  learners: number;
  rating: number;
  openRoles: number;
  feeGMD: number;
  scholarship: string;
}

export type CompetencyStatus = "verified" | "in-review" | "not-started";

export interface PassportEntry {
  id: string;
  competency: string;
  courseSlug: string;
  evidenceTitle: string;
  evidenceSummary: string;
  status: CompetencyStatus;
  verifiedBy?: string;
  verifiedOn?: string;
  submittedOn?: string;
  employerViews: number;
}

export interface Employer {
  id: string;
  name: string;
  sector: string;
  location: string;
  country: string;
  blurb: string;
  hiring: number;
}

export interface Role_ {
  id: string;
  title: string;
  employerId: string;
  location: string;
  mode: "Onsite" | "Hybrid" | "Remote";
  salaryGMD: string;
  posted: string;
  requires: string[];
  rationale: string;
  trackFit: TrackId;
}

export type ApplicationStage =
  | "matched"
  | "introduced"
  | "interviewing"
  | "offer";

export interface Learner {
  id: string;
  name: string;
  cohort: string;
  courseSlug: string;
  mode: DeliveryMode;
  progress: number;
  verified: number;
  pending: number;
  lastActive: string;
  risk: "on-track" | "watch" | "at-risk";
  location: string;
  note: string;
}

export interface EvidenceItem {
  id: string;
  learnerId: string;
  courseSlug: string;
  competency: string;
  title: string;
  submitted: string;
  summary: string;
  artefacts: string[];
  rubric: { criterion: string; met: boolean; note: string }[];
  aiDraft: string;
  status: "queued" | "verified" | "returned";
}

export interface CountryDemand {
  code: string;
  country: string;
  learners: number;
  openRoles: number;
  topSkill: string;
  gap: number;
}
