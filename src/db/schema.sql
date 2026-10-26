-- ==============================================================================
-- PLAINLY - SUPABASE POSTGRES SCHEMA, RLS POLICIES & STORAGE RULES
-- ==============================================================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 2. USER PROFILES
-- Stores user localization and application preferences.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  country text not null default 'US',
  currency text not null default 'USD',
  currency_symbol text not null default '$',
  language text not null default 'en',
  is_pro boolean not null default false,
  questions_asked_this_month integer not null default 0,
  last_billing_reset timestamptz default now(),
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can delete own profile"
  on public.profiles for delete
  using (auth.uid() = id);

-- 3. POLICIES
-- Core insurance policies belonging to users.
create table if not exists public.policies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  insurer text not null,
  plan_name text not null,
  member_id text,
  group_number text,
  phone text,
  type text not null check (type in ('health', 'dental', 'vision', 'other')),
  country text not null default 'US',
  currency text not null default 'USD',
  currency_symbol text not null default '$',
  renewal_date date,
  year_start date default current_date,
  is_active boolean not null default true,
  created_at timestamptz default now()
);

alter table public.policies enable row level security;

create policy "Users can manage own policies"
  on public.policies for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 4. DOCUMENTS
-- Metadata for uploaded policy files stored in private storage.
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  policy_id uuid not null references public.policies(id) on delete cascade,
  file_url text not null,
  file_name text not null,
  file_size integer,
  page_count integer not null default 1,
  ocr_applied boolean default false,
  processed_at timestamptz,
  created_at timestamptz default now()
);

alter table public.documents enable row level security;

create policy "Users can view and manage documents for own policies"
  on public.documents for all
  using (
    exists (
      select 1 from public.policies
      where policies.id = documents.policy_id
      and policies.user_id = auth.uid()
    )
  );

-- 5. DOCUMENT CHUNKS
-- Chunks split by page and section heading with strict character offsets.
create table if not exists public.document_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  page integer not null,
  section_title text,
  text text not null,
  start_offset integer not null,
  end_offset integer not null,
  created_at timestamptz default now()
);

alter table public.document_chunks enable row level security;

create policy "Users can view chunks for own documents"
  on public.document_chunks for select
  using (
    exists (
      select 1 from public.documents
      join public.policies on policies.id = documents.policy_id
      where documents.id = document_chunks.document_id
      and policies.user_id = auth.uid()
    )
  );

create policy "Users can insert chunks for own documents"
  on public.document_chunks for insert
  with check (
    exists (
      select 1 from public.documents
      join public.policies on policies.id = documents.policy_id
      where documents.id = document_chunks.document_id
      and policies.user_id = auth.uid()
    )
  );

-- 6. PLAN FACTS
-- Extracted key metrics grounded with exact quotes and page numbers.
create table if not exists public.plan_facts (
  id uuid primary key default gen_random_uuid(),
  policy_id uuid not null references public.policies(id) on delete cascade,
  key text not null,
  label text not null,
  value numeric,
  value_display text not null,
  unit text,
  source_page integer,
  source_quote text,
  confidence text not null check (confidence in ('clear', 'partly_clear', 'not_found')),
  explanation text,
  created_at timestamptz default now()
);

alter table public.plan_facts enable row level security;

create policy "Users can view facts for own policies"
  on public.plan_facts for select
  using (
    exists (
      select 1 from public.policies
      where policies.id = plan_facts.policy_id
      and policies.user_id = auth.uid()
    )
  );

-- 7. USAGE TRACKER
-- Real-time tracking of deductible and out-of-pocket maximum spending.
create table if not exists public.usage (
  id uuid primary key default gen_random_uuid(),
  policy_id uuid not null references public.policies(id) on delete cascade,
  year integer not null,
  deductible_used numeric not null default 0,
  out_of_pocket_used numeric not null default 0,
  limits_used jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

alter table public.usage enable row level security;

create policy "Users can manage usage for own policies"
  on public.usage for all
  using (
    exists (
      select 1 from public.policies
      where policies.id = usage.policy_id
      and policies.user_id = auth.uid()
    )
  );

-- 8. QUESTIONS & VERIFIED ANSWERS
-- Q&A history with confidence, source citations, and insurer follow-up cues.
create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  policy_id uuid not null references public.policies(id) on delete cascade,
  question text not null,
  answer text not null,
  confidence text not null check (confidence in ('clear', 'partly_clear', 'not_found')),
  sources jsonb not null default '[]'::jsonb,
  estimate jsonb,
  questions_to_ask jsonb not null default '[]'::jsonb,
  created_at timestamptz default now()
);

alter table public.questions enable row level security;

create policy "Users can view and manage questions for own policies"
  on public.questions for all
  using (
    exists (
      select 1 from public.policies
      where policies.id = questions.policy_id
      and policies.user_id = auth.uid()
    )
  );

-- 9. PRE-VISIT CHECKLISTS
create table if not exists public.checklists (
  id uuid primary key default gen_random_uuid(),
  policy_id uuid not null references public.policies(id) on delete cascade,
  visit_type text not null,
  items jsonb not null default '[]'::jsonb,
  notes text,
  updated_at timestamptz default now()
);

alter table public.checklists enable row level security;

create policy "Users can manage checklists for own policies"
  on public.checklists for all
  using (
    exists (
      select 1 from public.policies
      where policies.id = checklists.policy_id
      and policies.user_id = auth.uid()
    )
  );

-- 10. AUDIT LOGS (PII-FREE)
-- Failure and query quality analysis without personal identifiable data.
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  event_type text not null, -- 'extraction_failure', 'unverified_quote', 'question_asked'
  policy_type text not null,
  confidence text,
  quote_verified boolean,
  error_message text,
  created_at timestamptz default now()
);

-- RLS: Only server functions / admin service role can write or view audit logs
alter table public.audit_logs enable row level security;

-- 11. SUPABASE STORAGE BUCKET RULES
-- Create private 'policy_documents' bucket
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'policy_documents',
  'policy_documents',
  false,
  20971520, -- 20MB limit
  array['application/pdf', 'image/jpeg', 'image/png']
) on conflict (id) do nothing;

-- RLS on storage.objects for private user directory isolation:
-- File path convention: policy_documents/{user_id}/{policy_id}/{filename}
create policy "Users can upload their own policy files"
  on storage.objects for insert
  with check (
    bucket_id = 'policy_documents' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can read their own policy files"
  on storage.objects for select
  using (
    bucket_id = 'policy_documents' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete their own policy files"
  on storage.objects for delete
  using (
    bucket_id = 'policy_documents' and
    auth.uid()::text = (storage.foldername(name))[1]
  );
