-- ============================================================
-- Calrenove CRM - Esquema standalone (sin Supabase)
-- ============================================================
create extension if not exists "pgcrypto";

-- 1. USERS (autenticación de la aplicación)
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now()
);

-- 2. COMPANIES (empresas emisoras)
create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  logo_url text,
  color text not null default '#1a3a5c',
  color_light text not null default '#2d6a9f',
  address text,
  created_at timestamptz not null default now()
);

-- 3. BOILER BRANDS
create table if not exists public.boiler_brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  is_custom boolean not null default false,
  created_at timestamptz not null default now()
);

-- 4. BOILER MODELS
create table if not exists public.boiler_models (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.boiler_brands(id) on delete cascade,
  name text not null,
  slug text not null unique,
  description text not null default '',
  price_base numeric(10,2) not null default 0,
  price_final numeric(10,2) not null default 0,
  price_rounded numeric(10,2) not null default 0,
  notes text,
  brochure_url text,
  created_at timestamptz not null default now()
);
create index if not exists idx_boiler_models_brand on public.boiler_models(brand_id);

-- 5. MODEL INCLUDES / EXCLUDES / OPTIONALS
create table if not exists public.model_includes (
  id uuid primary key default gen_random_uuid(),
  model_id uuid not null references public.boiler_models(id) on delete cascade,
  description text not null,
  sort_order int not null default 0
);
create index if not exists idx_model_includes_model on public.model_includes(model_id);

create table if not exists public.model_excludes (
  id uuid primary key default gen_random_uuid(),
  model_id uuid not null references public.boiler_models(id) on delete cascade,
  description text not null,
  sort_order int not null default 0
);
create index if not exists idx_model_excludes_model on public.model_excludes(model_id);

create table if not exists public.model_optionals (
  id uuid primary key default gen_random_uuid(),
  model_id uuid not null references public.boiler_models(id) on delete cascade,
  name text not null,
  price numeric(10,2) not null default 0,
  sort_order int not null default 0
);
create index if not exists idx_model_optionals_model on public.model_optionals(model_id);

-- 6. CUSTOMERS
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  phone text,
  address text,
  email text,
  dni text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_customers_user on public.customers(user_id);

-- 7. BUDGET NUMBER SEQUENCES
create table if not exists public.budget_number_sequences (
  date_key text primary key,
  last_seq int not null default 0
);

create or replace function public.get_next_budget_number()
returns text
language plpgsql
as $$
declare
  today_key text;
  next_seq int;
begin
  today_key := to_char(now(), 'YYMMDD');
  perform pg_advisory_xact_lock(hashtext('budget_seq_' || today_key));
  insert into public.budget_number_sequences (date_key, last_seq)
  values (today_key, 1)
  on conflict (date_key)
  do update set last_seq = public.budget_number_sequences.last_seq + 1
  returning last_seq into next_seq;
  return today_key || lpad(next_seq::text, 2, '0');
end;
$$;

-- 8. BUDGETS
create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  budget_number text not null unique,
  company_id uuid not null references public.companies(id),
  customer_id uuid not null references public.customers(id),
  brand_id uuid not null references public.boiler_brands(id),
  model_id uuid not null references public.boiler_models(id),
  user_id uuid not null references public.users(id),
  issue_date date not null default current_date,
  valid_until date not null default (current_date + interval '30 days'),
  commercial_status text not null default 'pending' check (commercial_status in ('pending', 'accepted', 'rejected')),
  accepted_at timestamptz,
  rejected_at timestamptz,
  payment_status text not null default 'pending' check (payment_status in ('pending', 'partial', 'paid')),
  subtotal numeric(10,2) not null default 0,
  iva_rate numeric(4,2) not null default 21.00,
  iva_amount numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  custom_price numeric(10,2),
  notes text,
  pdf_url text,
  brand_name text,
  model_name text,
  description text,
  items jsonb default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_budgets_user on public.budgets(user_id);
create index if not exists idx_budgets_status on public.budgets(commercial_status);

-- 9. BUDGET SELECTED OPTIONALS
create table if not exists public.budget_selected_optionals (
  id uuid primary key default gen_random_uuid(),
  budget_id uuid not null references public.budgets(id) on delete cascade,
  optional_id uuid not null references public.model_optionals(id),
  name text not null,
  price numeric(10,2) not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_budget_opt_budget on public.budget_selected_optionals(budget_id);

-- 10. BUDGET STATUS HISTORY
create table if not exists public.budget_status_history (
  id uuid primary key default gen_random_uuid(),
  budget_id uuid not null references public.budgets(id) on delete cascade,
  user_id uuid not null references public.users(id),
  previous_status text check (previous_status in ('pending', 'accepted', 'rejected')),
  new_status text not null check (new_status in ('pending', 'accepted', 'rejected')),
  created_at timestamptz not null default now()
);
create index if not exists idx_status_history_budget on public.budget_status_history(budget_id);

-- 11. PAYMENTS
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  budget_id uuid not null references public.budgets(id) on delete cascade,
  amount numeric(10,2) not null,
  payment_date date not null default current_date,
  payment_method text,
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists idx_payments_budget on public.payments(budget_id);

-- 12. EMAIL REMINDER SETTINGS / LOGS
create table if not exists public.email_reminder_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade unique,
  enabled boolean not null default true,
  frequency_days int not null default 7,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.email_reminder_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  sent_at timestamptz not null default now(),
  budget_ids uuid[] not null default '{}',
  status text not null default 'sent',
  error_message text
);
create index if not exists idx_email_logs_user on public.email_reminder_logs(user_id);
