-- Ednovate Labs — initial schema.
-- Run this in the Supabase SQL editor, or with `supabase db push`.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type public.user_role as enum ('student', 'educator');
create type public.delivery_mode as enum ('onsite', 'live', 'self-paced');
create type public.competency_status as enum ('verified', 'in-review', 'not-started');
create type public.application_stage as enum ('matched', 'introduced', 'interviewing', 'offer');

-- ---------------------------------------------------------------------------
-- Profiles
--
-- One row per auth user. Created automatically on signup by the trigger at the
-- bottom of this file, so the app never has to insert into it directly.
-- ---------------------------------------------------------------------------

create table public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  role         public.user_role not null default 'student',
  full_name    text,
  headline     text,
  cohort       text,
  location     text,
  passport_id  text unique,
  avatar_path  text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on column public.profiles.avatar_path is
  'Object path inside the public `avatars` storage bucket.';

-- Reading a profile to decide whether someone is an educator would recurse
-- through the profiles policies, so that check runs as the definer.
create or replace function public.is_educator()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'educator'
  );
$$;

-- ---------------------------------------------------------------------------
-- Learning
-- ---------------------------------------------------------------------------

create table public.enrollments (
  id           uuid primary key default gen_random_uuid(),
  student_id   uuid not null references public.profiles (id) on delete cascade,
  course_slug  text not null,
  mode         public.delivery_mode not null,
  progress     smallint not null default 0 check (progress between 0 and 100),
  enrolled_on  date not null default current_date,
  created_at   timestamptz not null default now(),
  unique (student_id, course_slug)
);

create index enrollments_student_idx on public.enrollments (student_id);

create table public.compass_results (
  student_id     uuid primary key references public.profiles (id) on delete cascade,
  track_id       text not null,
  primary_slug   text not null,
  alternate_slugs text[] not null default '{}',
  mode           public.delivery_mode not null,
  reasons        text[] not null default '{}',
  open_question  text,
  answers        jsonb not null default '{}'::jsonb,
  updated_at     timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Skills passport
-- ---------------------------------------------------------------------------

create table public.passport_entries (
  id                uuid primary key default gen_random_uuid(),
  student_id        uuid not null references public.profiles (id) on delete cascade,
  competency        text not null,
  course_slug       text,
  status            public.competency_status not null default 'not-started',
  evidence_title    text,
  evidence_summary  text,
  submitted_on      date,
  verified_on       date,
  verified_by       uuid references public.profiles (id) on delete set null,
  reviewer_feedback text,
  employer_views    integer not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (student_id, competency)
);

create index passport_entries_student_idx on public.passport_entries (student_id);
create index passport_entries_status_idx on public.passport_entries (status);

-- Files a learner uploads: evidence artefacts, datasets, anything they attach.
create table public.evidence_files (
  id            uuid primary key default gen_random_uuid(),
  student_id    uuid not null references public.profiles (id) on delete cascade,
  entry_id      uuid references public.passport_entries (id) on delete cascade,
  storage_path  text not null unique,
  file_name     text not null,
  mime_type     text,
  size_bytes    bigint,
  uploaded_at   timestamptz not null default now()
);

create index evidence_files_student_idx on public.evidence_files (student_id);
create index evidence_files_entry_idx on public.evidence_files (entry_id);

-- ---------------------------------------------------------------------------
-- Employer matching
-- ---------------------------------------------------------------------------

create table public.applications (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid not null references public.profiles (id) on delete cascade,
  role_id     text not null,
  stage       public.application_stage not null default 'introduced',
  applied_on  date not null default current_date,
  created_at  timestamptz not null default now(),
  unique (student_id, role_id)
);

create index applications_student_idx on public.applications (student_id);

-- ---------------------------------------------------------------------------
-- Row level security
--
-- A learner reaches their own rows. An educator reads everything in the
-- cohort and writes only the review fields.
-- ---------------------------------------------------------------------------

alter table public.profiles         enable row level security;
alter table public.enrollments      enable row level security;
alter table public.compass_results  enable row level security;
alter table public.passport_entries enable row level security;
alter table public.evidence_files   enable row level security;
alter table public.applications     enable row level security;

create policy "read own profile" on public.profiles
  for select using (id = auth.uid() or public.is_educator());
create policy "update own profile" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

create policy "own enrollments" on public.enrollments
  for all using (student_id = auth.uid()) with check (student_id = auth.uid());
create policy "educators read enrollments" on public.enrollments
  for select using (public.is_educator());

create policy "own compass" on public.compass_results
  for all using (student_id = auth.uid()) with check (student_id = auth.uid());

create policy "own passport" on public.passport_entries
  for all using (student_id = auth.uid()) with check (student_id = auth.uid());
create policy "educators read passport" on public.passport_entries
  for select using (public.is_educator());
create policy "educators review passport" on public.passport_entries
  for update using (public.is_educator()) with check (public.is_educator());

create policy "own files" on public.evidence_files
  for all using (student_id = auth.uid()) with check (student_id = auth.uid());
create policy "educators read files" on public.evidence_files
  for select using (public.is_educator());

create policy "own applications" on public.applications
  for all using (student_id = auth.uid()) with check (student_id = auth.uid());
create policy "educators read applications" on public.applications
  for select using (public.is_educator());

-- ---------------------------------------------------------------------------
-- Storage
--
-- `avatars` is public so an <img> tag works without a signed URL.
-- `evidence` is private; the app hands out short-lived signed URLs.
-- Both are keyed by `<user-id>/...` so ownership is a path check.
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', true, 2097152,
   array['image/png', 'image/jpeg', 'image/webp', 'image/gif']),
  ('evidence', 'evidence', false, 26214400, null)
on conflict (id) do nothing;

create policy "avatars are public" on storage.objects
  for select using (bucket_id = 'avatars');

create policy "write own avatar" on storage.objects
  for insert with check (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "replace own avatar" on storage.objects
  for update using (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "delete own avatar" on storage.objects
  for delete using (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "read own evidence" on storage.objects
  for select using (
    bucket_id = 'evidence'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_educator())
  );
create policy "upload own evidence" on storage.objects
  for insert with check (
    bucket_id = 'evidence' and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "delete own evidence" on storage.objects
  for delete using (
    bucket_id = 'evidence' and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ---------------------------------------------------------------------------
-- Signup trigger
--
-- Role and name come from the metadata passed to signUp().
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, full_name, passport_id)
  values (
    new.id,
    coalesce((new.raw_user_meta_data ->> 'role')::public.user_role, 'student'),
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    'ENL-' || upper(substr(replace(new.id::text, '-', ''), 1, 10))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- updated_at
-- ---------------------------------------------------------------------------

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();
create trigger passport_entries_touch before update on public.passport_entries
  for each row execute function public.touch_updated_at();
