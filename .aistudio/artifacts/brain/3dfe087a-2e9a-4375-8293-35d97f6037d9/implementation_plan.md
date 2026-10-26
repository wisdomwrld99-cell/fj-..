# Implementation Plan: Plainly — Insurance in Plain Words

Plainly is a mobile-first application designed to eliminate surprise medical bills and healthcare anxiety. It allows users to add health, dental, or vision insurance policies once (via card scan, document upload, or manual entry), and receive plain-language answers grounded strictly in their own policy text—backed by verifiable page citations, deterministic out-of-pocket cost estimates, and clear uncertainty signaling.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> Plainly is built on the fundamental rule: **Honesty About Uncertainty**. A wrong healthcare cost answer causes real financial harm. The system will never hallucinate coverage, never use general knowledge to fill policy gaps, and will automatically downgrade any unverified citation to "Not found in your document".

- **Confirmed Aesthetic**: Soft blue-green accent (`#2D7A78` / `#3AAFA9`, Tailwind teal/sage palette), calm neutral surfaces (`#F8FAFC` light, `#0F172A` dark), Inter typography, zero-pill metadata discipline, and 44px+ touch targets.
- **Confirmed Core Pipeline**: Client card scan (OCR) + Private document storage + Server-side LLM chunked extraction with strict JSON schema + Exact substring quote verification against source offsets.
- **Deterministic Cost Calculation**: Arithmetic is strictly executed in standard TypeScript code using extracted numbers (deductible remaining, coinsurance, copay, out-of-pocket maximum), never calculated loosely by free-form AI text.
- **Monetization & Gate**: Free tier includes 1 policy, 5 questions/month, plan summary, and glossary. Paywall triggers only *after* the user receives their first complete answer—never on launch or during initial onboarding.
- **Responsive Shell**: Delivered as a touch-optimized responsive application with interactive mobile device framing and direct mobile viewport support.

---

## 1. Overview & Core Concept

### What It Does
Plainly translates dense, legalistic insurance contracts into grade 6–8 reading level explanations. Before booking an appointment or procedure, users ask questions like *"Is a dental crown covered?"* or *"What will I pay to see a dermatologist?"* and get:
1. A clear one-sentence direct answer.
2. A realistic out-of-pocket cost estimate with underlying arithmetic.
3. Verifiable proof: exact quoted sentences and page citations from their own uploaded policy.
4. "Before you book" checklist questions to ask their insurer or clinic.

### Target Audience
Anyone holding health, dental, or vision insurance who is anxious or rushed in a clinic waiting room or at home trying to understand pre-visit costs.

---

## 2. User Experience & Screen Architecture

Plainly consists of 12 purposeful screens:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             PLAINLY USER JOURNEY                            │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                         [ 1. Welcome Onboarding ]
                         (3 calm skippable slides)
                                      │
                                      ▼
                        [ 2. Add Policy Flow ]
                ┌─────────────────────┼─────────────────────┐
                ▼                     ▼                     ▼
        [ A. Card Scan ]      [ B. Doc Upload ]      [ C. Manual Entry ]
        (Camera/OCR)          (PDF / Images)         (Key numbers)
                └─────────────────────┬─────────────────────┘
                                      ▼
                       [ 3. Review Extracted Details ]
                         (Editable verification)
                                      │
                                      ▼
                           [ 4. Plan Summary ]
                     "Your plan in plain words"
                   (Deductible, OOP Max, Copays)
                                      │
          ┌───────────────────────────┼───────────────────────────┐
          ▼                           ▼                           ▼
  [ 5. Ask & Answer ]       [ 6. Cost Estimator ]      [ 7. Pre-Visit Checklist]
  - Plain Answer            - Deterministic Math       - In-network verify
  - Cost Range              - Deductible progress      - Pre-authorization
  - Verified Sources        - Step-by-step breakdown   - What to bring
  - "Ask Insurer" cues      - Live usage tracker
          │                           │                           │
          └───────────────────────────┼───────────────────────────┘
                                      │
       ┌──────────────────────────────┼──────────────────────────────┐
       ▼                              ▼                              ▼
 [ 8. History ]                 [ 9. Glossary ]              [ 10. Settings ]
 Saved Q&As & Estimates        Searchable plain terms       Country, Currency,
 Ready for clinic desk         Inline tap popups            Usage & Delete All
                                      │
                    [ 11. Paywall (Pro Upgrade) ]
                    (Triggers only after 1st answer)
                                      │
                        [ 12. Authentication ]
                    (Apple, Google, Magic Link)
```

### Screen Details & Ergonomics
1. **Welcome Screen**: 3 concise, calm slides explaining (1) plain answers, (2) verified proof from your own document, (3) real cost estimates before you book. No cartoons, confetti, or forced sign-up.
2. **Add Policy Flow**: 3 input methods (Camera OCR for member card, PDF document upload, or manual numbers). Immediate country selection (`US`, `UK`, `CA`, `AU`, `EU`) and insurance type (`Health`, `Dental`, `Vision`, `Other`).
3. **Review Extracted Details**: Allows the user to inspect and edit extracted card details (Insurer name, Plan name, Member ID, Group #, Customer Service Phone).
4. **Plan Summary**: Single calm dashboard displaying yearly deductible, out-of-pocket max, per-visit copays/coinsurance, annual limits, waiting periods, network rules, and what is explicitly *not* covered. Every fact has a "See in document" link with page highlighting.
5. **Ask a Question & Answer Screen**:
   - Suggested query chips (`Crown coverage`, `Specialist visit copay`, `Physical therapy sessions`).
   - Voice input trigger.
   - **4-Section Answer Card**:
     - *Part A*: 1-sentence plain language verdict.
     - *Part B*: "What you'd likely pay" range with explicit assumptions.
     - *Part C*: "Where this came from" citation panel with exact quoted text and page number.
     - *Part D*: "Before you book, ask your insurer" with 2–3 questions and a one-tap phone dialer.
   - Prominent Confidence Badge: `Clear in your policy` (Teal), `Partly clear` (Amber), `Not found in policy` (Slate).
   - Mandatory persistent disclaimer: *"This explains your documents. It isn't a promise of coverage. Confirm with your insurer before treatment."*
6. **Cost Estimator**: Deterministic calculator. The user picks a service (e.g. Specialist, MRI, Dental Filling, Preventive Checkup) or enters a quote. Shows step-by-step math:
   $$\text{User Pays} = \min(\text{Deductible Remaining}, \text{Quote}) + (\text{Remaining} \times \text{Coinsurance \%})$$
7. **Pre-Visit Checklist**: Dynamic task lists tailored by visit type (In-network confirmation, CPT/Procedure code pre-authorization, referral verification, deductible status). Checkable with custom notes.
8. **History**: Chronological log of all answered questions and calculated estimates, filterable by date and policy, ready to show directly to clinic billing desks.
9. **Jargon Glossary**: Searchable plain definitions (Deductible, Coinsurance, Copay, Out-of-pocket maximum, Formulary, Prior Authorization, In-network, Balance billing). Tappable inline across any answer.
10. **Settings**: Country, currency symbol (`$`, `£`, `€`, `A$`), language, usage tracker, "Export My Data" (JSON/PDF), and a permanent "Delete Everything" button.
11. **Paywall Modal**: Shown after the first successful answer. Explains Pro benefits ($4.99/mo or $39.99/yr) while keeping all disclaimers and safety fallbacks available on Free.
12. **Auth Screen**: Apple, Google, or Email Magic Link, presented seamlessly after initial value delivery.

---

## 3. Data Model (Postgres / Supabase Schema)

The schema enforces strict isolation, Row-Level Security (RLS), and referential integrity:

```sql
-- Profiles: User preferences and localization
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  country text not null default 'US',
  currency text not null default 'USD',
  currency_symbol text not null default '$',
  language text not null default 'en',
  created_at timestamptz default now()
);

-- Policies: High-level insurance plans
create table public.policies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  insurer text not null,
  plan_name text not null,
  member_id text,
  group_number text,
  phone text,
  type text not null check (type in ('health', 'dental', 'vision', 'other')),
  renewal_date date,
  year_start date default current_date,
  created_at timestamptz default now()
);

-- Documents: Uploaded policy files
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  policy_id uuid not null references public.policies(id) on delete cascade,
  file_url text not null,
  file_name text not null,
  page_count integer not null default 1,
  processed_at timestamptz,
  created_at timestamptz default now()
);

-- Document Chunks: Granular text segments with page & character offsets
create table public.document_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  page integer not null,
  section_title text,
  text text not null,
  start_offset integer not null,
  end_offset integer not null
);

-- Plan Facts: Grounded extracted parameters
create table public.plan_facts (
  id uuid primary key default gen_random_uuid(),
  policy_id uuid not null references public.policies(id) on delete cascade,
  key text not null, -- e.g. 'individual_deductible', 'out_of_pocket_max', 'specialist_copay'
  label text not null,
  value numeric,
  value_display text not null,
  unit text, -- 'currency', 'percentage', 'days', 'visits'
  source_page integer,
  source_quote text,
  confidence text check (confidence in ('clear', 'partly_clear', 'not_found'))
);

-- Usage: Tracking spending against policy thresholds
create table public.usage (
  id uuid primary key default gen_random_uuid(),
  policy_id uuid not null references public.policies(id) on delete cascade,
  year integer not null,
  deductible_used numeric not null default 0,
  out_of_pocket_used numeric not null default 0,
  limits_used jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

-- Questions: Verified Q&A history
create table public.questions (
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

-- Checklists: Pre-visit confirmation tasks
create table public.checklists (
  id uuid primary key default gen_random_uuid(),
  policy_id uuid not null references public.policies(id) on delete cascade,
  visit_type text not null,
  items jsonb not null default '[]'::jsonb,
  updated_at timestamptz default now()
);
```

### Row Level Security (RLS)
- Every table has `alter table ... enable row level security;`
- Strict policies ensuring `auth.uid() = user_id` (or joined through `policy_id`).
- Supabase storage bucket `policy_documents` configured as private with authenticated read/write scoped to `auth.uid() = (storage.foldername(name))[1]`.

---

## 4. Document-Reading & Answering Pipeline

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       DOCUMENT INGESTION & Q&A PIPELINE                     │
└─────────────────────────────────────────────────────────────────────────────┘

 [ User Upload / Scan ]
         │
         ▼
 [ Storage & Ingestion ] ──────► Save PDF / Card image in private storage
         │
         ▼
 [ Text & Offset Extraction ] ──► Extract text by page; compute start/end char offsets
         │
         ▼
 [ Section Chunking ] ─────────► Chunk by headings; retain (page, text, offsets)
         │
         ▼
 [ Grounded Extraction ] ──────► Backend LLM Call with Strict JSON Schema:
         │                        - Extracts: deductible, oop_max, copays, exclusions
         │                        - Enforces: value + page_number + exact_source_quote
         ▼
 [ Quote Substring Verification ]
         │
         ├──► Valid quote found in source text? ──────► Confidence: 'clear'
         └──► Quote modified or missing in source? ───► Reject value -> 'not_found'
                                                        (Never hallucinate)

───────────────────────────────────────────────────────────────────────────────

 [ User Asks Question ]
         │
         ▼
 [ Targeted Retrieval ] ──────► Semantic / keyword match against document chunks
         │
         ▼
 [ Grounded Q&A Prompt ] ─────► LLM instructed:
         │                        1. Answer ONLY from provided policy chunks.
         │                        2. If unclear or absent: output "not_found".
         │                        3. Return exact supporting quotes and page numbers.
         ▼
 [ Post-Response Audit ]
         │
         ├──► Every quote verified in raw document text?
         │         │
         │         ├── YES ──► Render Answer + Verified Quote + Cost Range
         │         └── NO  ──► Auto-downgrade to "Not found in your policy"
         │                     + Generate questions to ask insurer
         ▼
 [ Privacy Audit Log ] ───────► Log prompt/response metadata (Zero PII, no member IDs)
```

### Safety & Grounding Controls
1. **Zero Hallucination Rule**: The LLM prompt explicitly forbids assuming standard industry practices (e.g. it cannot assume preventive cleanings are covered twice a year unless the user's specific document explicitly says so).
2. **Deterministic String Matching**: Before any quote is displayed to the user, TypeScript executes an exact or normalized Levenshtein-verified substring search inside `document_chunks.text`. If the text cannot be found on the claimed page, the quote is rejected.
3. **Medical Advice Interceptor**: Regex and intent checking intercept inquiries like *"Should I get surgery?"* or *"What medicine should I take?"*, returning a compassionate refusal redirecting to clinical consultation.

---

## 5. Cost Estimator: Deterministic Arithmetic Engine

The cost engine never relies on AI math. Given:
- $Q$: Provider quote or average visit cost
- $D_{\text{rem}}$: Remaining deductible ($D_{\text{total}} - D_{\text{used}}$)
- $C_{\text{rate}}$: Coinsurance percentage (e.g., $20\% = 0.20$)
- $C_{\text{fixed}}$: Fixed copay (e.g., $\$40$)
- $OOP_{\text{rem}}$: Remaining out-of-pocket maximum ($OOP_{\text{total}} - OOP_{\text{used}}$)
- $L_{\text{rem}}$: Remaining annual benefit limit (e.g., dental maximum)

$$\text{Step 1: Copay Check} \implies \text{If fixed copay applies, Base User Cost} = C_{\text{fixed}}$$
$$\text{Step 2: Deductible Phase} \implies \text{Deductible Portion} = \min(D_{\text{rem}}, Q)$$
$$\text{Step 3: Coinsurance Phase} \implies \text{Subject to Coinsurance} = \max(0, Q - \text{Deductible Portion})$$
$$\text{Coinsurance Portion} = \text{Subject to Coinsurance} \times C_{\text{rate}}$$
$$\text{Step 4: Raw Cost} = \text{Deductible Portion} + \text{Coinsurance Portion}$$
$$\text{Step 5: Apply OOP Max} \implies \text{Final Estimate} = \min(\text{Raw Cost}, OOP_{\text{rem}})$$
$$\text{Step 6: Exceeded Annual Limit Check} \implies \text{If } Q > L_{\text{rem}}, \text{Add Uncovered Balance}$$

All calculation steps produce an explanatory human-readable trace:
*"Quote $400. You have $150 left on your $300 deductible, so you pay $150 first. 20% of the remaining $250 is $50. Estimated total: $200."*

---

## 6. What Is Deliberately Left Out of V1 (Roadmap Only)

To maintain focus, bulletproof accuracy, and high reliability, the following are intentionally omitted from v1:
- ❌ Direct insurer portal screen-scraping or live credential login (brittle and high security risk).
- ❌ Direct healthcare claim filing or electronic claim submission.
- ❌ Explanation of Benefits (EOB) and medical bill OCR auditing / dispute generator.
- ❌ Marketplace plan comparison / open enrollment shopping comparison engine.
- ❌ Nationwide provider directory search (NPI lookup) or clinic scheduling.
- ❌ Employer HR dashboard and group benefits administration consoles.

---

## 7. Deliverables & Phased Execution Plan

1. **Step 1: Plan Approval** — Align on architecture, screens, data model, and safety pipeline (this document).
2. **Step 2: Supabase Schema, RLS & Storage** — Clean SQL definitions with security policies and migration files.
3. **Step 3: Theme, Tokens & Shared UI Kit** — Calm medical-adjacent theme, `ConfidenceLabel`, `SourcePanel`, `EstimateRange`, and `PlainDisclaimer`.
4. **Step 4: Add Policy Flow & Card OCR** — Multi-step card scanner, PDF parser, and manual entry with country/currency selectors.
5. **Step 5: Document Processing & Summary Extraction** — Chunking with character offsets and schema-validated fact extraction.
6. **Step 6: Question Answering & Quote Verification** — Grounded Q&A with strict quote auditing, downgrade logic, and fallback inquiry generator.
7. **Step 7: Plan Summary & Answer Screens** — Plain words display with highlightable document viewer.
8. **Step 8: Cost Estimator & Arithmetic Unit Tests** — Deterministic calculation engine accompanied by automated test suite.
9. **Step 9: Checklists, Glossary, History & Settings** — Pre-visit checklists, search glossary, persistent history, and data wipe.
10. **Step 10: Realistic Seed Policies (5 Plans + 30 Test Q&A Benchmark)** — 5 complete realistic policies (HMO, PPO, HDHP, Dental, Vision) and test runner script verifying zero hallucinations.
