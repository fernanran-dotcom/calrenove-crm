-- Enable extensions
create extension if not exists "pgcrypto";

-- 1. COMPANIES (empresas emisoras)
create table public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  logo_url text,
  color text not null default '#1a3a5c',
  color_light text not null default '#2d6a9f',
  address text,
  created_at timestamptz not null default now()
);

alter table public.companies enable row level security;
create policy "Companies are readable by authenticated users" on public.companies
  for select using (auth.role() = 'authenticated');

-- 2. BOILER BRANDS
create table public.boiler_brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

alter table public.boiler_brands enable row level security;
create policy "Brands are readable by authenticated users" on public.boiler_brands
  for select using (auth.role() = 'authenticated');

-- 3. BOILER MODELS
create table public.boiler_models (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.boiler_brands(id) on delete cascade,
  name text not null,
  slug text not null unique,
  description text not null default '',
  price_base numeric(10,2) not null default 0,
  price_final numeric(10,2) not null default 0,
  price_rounded numeric(10,2) not null default 0,
  notes text,
  created_at timestamptz not null default now()
);

create index idx_boiler_models_brand on public.boiler_models(brand_id);

alter table public.boiler_models enable row level security;
create policy "Models are readable by authenticated users" on public.boiler_models
  for select using (auth.role() = 'authenticated');

-- 4. MODEL INCLUDES
create table public.model_includes (
  id uuid primary key default gen_random_uuid(),
  model_id uuid not null references public.boiler_models(id) on delete cascade,
  description text not null,
  sort_order int not null default 0
);

create index idx_model_includes_model on public.model_includes(model_id);

alter table public.model_includes enable row level security;
create policy "Model includes are readable by authenticated users" on public.model_includes
  for select using (auth.role() = 'authenticated');

-- 5. MODEL EXCLUDES
create table public.model_excludes (
  id uuid primary key default gen_random_uuid(),
  model_id uuid not null references public.boiler_models(id) on delete cascade,
  description text not null,
  sort_order int not null default 0
);

create index idx_model_excludes_model on public.model_excludes(model_id);

alter table public.model_excludes enable row level security;
create policy "Model excludes are readable by authenticated users" on public.model_excludes
  for select using (auth.role() = 'authenticated');

-- 6. MODEL OPTIONALS
create table public.model_optionals (
  id uuid primary key default gen_random_uuid(),
  model_id uuid not null references public.boiler_models(id) on delete cascade,
  name text not null,
  price numeric(10,2) not null default 0,
  sort_order int not null default 0
);

create index idx_model_optionals_model on public.model_optionals(model_id);

alter table public.model_optionals enable row level security;
create policy "Model optionals are readable by authenticated users" on public.model_optionals
  for select using (auth.role() = 'authenticated');

-- 7. CUSTOMERS
create table public.customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  phone text,
  address text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_customers_user on public.customers(user_id);

alter table public.customers enable row level security;
create policy "Users can view their own customers" on public.customers
  for select using (auth.uid() = user_id);
create policy "Users can create their own customers" on public.customers
  for insert with check (auth.uid() = user_id);
create policy "Users can update their own customers" on public.customers
  for update using (auth.uid() = user_id);

-- 8. BUDGET NUMBER SEQUENCES (daily counter for YYMMDDNN)
create table public.budget_number_sequences (
  date_key text primary key,
  last_seq int not null default 0
);

alter table public.budget_number_sequences enable row level security;
create policy "Anyone authenticated can read/write sequences" on public.budget_number_sequences
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Function to get next budget number (safe concurrency with advisory lock)
create or replace function public.get_next_budget_number()
returns text
language plpgsql
security definer
as $$
declare
  today_key text;
  next_seq int;
  yy text;
  mm text;
  dd text;
begin
  today_key := to_char(now(), 'YYMMDD');
  yy := substr(today_key, 1, 2);
  mm := substr(today_key, 3, 2);
  dd := substr(today_key, 5, 2);

  -- Advisory lock scoped to today's key to prevent collisions
  perform pg_advisory_xact_lock(hashtext('budget_seq_' || today_key));

  insert into public.budget_number_sequences (date_key, last_seq)
  values (today_key, 1)
  on conflict (date_key)
  do update set last_seq = public.budget_number_sequences.last_seq + 1
  returning last_seq into next_seq;

  return yy || mm || dd || lpad(next_seq::text, 2, '0');
end;
$$;

-- 9. BUDGETS
create table public.budgets (
  id uuid primary key default gen_random_uuid(),
  budget_number text not null unique,
  company_id uuid not null references public.companies(id),
  customer_id uuid not null references public.customers(id),
  brand_id uuid not null references public.boiler_brands(id),
  model_id uuid not null references public.boiler_models(id),
  user_id uuid not null references auth.users(id),
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
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_budgets_user on public.budgets(user_id);
create index idx_budgets_company on public.budgets(company_id);
create index idx_budgets_commercial_status on public.budgets(commercial_status);
create index idx_budgets_payment_status on public.budgets(payment_status);

alter table public.budgets enable row level security;
create policy "Users can view their own budgets" on public.budgets
  for select using (auth.uid() = user_id);
create policy "Users can create their own budgets" on public.budgets
  for insert with check (auth.uid() = user_id);
create policy "Users can update their own budgets" on public.budgets
  for update using (auth.uid() = user_id);

-- Trigger to auto-update updated_at
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger update_budgets_updated_at
  before update on public.budgets
  for each row
  execute function public.update_updated_at_column();

create trigger update_customers_updated_at
  before update on public.customers
  for each row
  execute function public.update_updated_at_column();

-- 10. BUDGET SELECTED OPTIONALS
create table public.budget_selected_optionals (
  id uuid primary key default gen_random_uuid(),
  budget_id uuid not null references public.budgets(id) on delete cascade,
  optional_id uuid not null references public.model_optionals(id),
  name text not null,
  price numeric(10,2) not null,
  created_at timestamptz not null default now()
);

create index idx_budget_opt_budget on public.budget_selected_optionals(budget_id);

alter table public.budget_selected_optionals enable row level security;
create policy "Users can view own budget optionals" on public.budget_selected_optionals
  for select using (
    exists (select 1 from public.budgets where id = budget_id and user_id = auth.uid())
  );
create policy "Users can insert own budget optionals" on public.budget_selected_optionals
  for insert with check (
    exists (select 1 from public.budgets where id = budget_id and user_id = auth.uid())
  );
create policy "Users can delete own budget optionals" on public.budget_selected_optionals
  for delete using (
    exists (select 1 from public.budgets where id = budget_id and user_id = auth.uid())
  );

-- 11. BUDGET STATUS HISTORY
create table public.budget_status_history (
  id uuid primary key default gen_random_uuid(),
  budget_id uuid not null references public.budgets(id) on delete cascade,
  user_id uuid not null references auth.users(id),
  previous_status text check (previous_status in ('pending', 'accepted', 'rejected')),
  new_status text not null check (new_status in ('pending', 'accepted', 'rejected')),
  created_at timestamptz not null default now()
);

create index idx_status_history_budget on public.budget_status_history(budget_id);

alter table public.budget_status_history enable row level security;
create policy "Users can view own budget status history" on public.budget_status_history
  for select using (auth.uid() = user_id);
create policy "Users can insert status history" on public.budget_status_history
  for insert with check (auth.uid() = user_id);

-- 12. PAYMENTS
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  budget_id uuid not null references public.budgets(id) on delete cascade,
  amount numeric(10,2) not null,
  payment_date date not null default current_date,
  payment_method text,
  notes text,
  created_at timestamptz not null default now()
);

create index idx_payments_budget on public.payments(budget_id);

alter table public.payments enable row level security;
create policy "Users can view own payments" on public.payments
  for select using (
    exists (select 1 from public.budgets where id = budget_id and user_id = auth.uid())
  );
create policy "Users can insert own payments" on public.payments
  for insert with check (
    exists (select 1 from public.budgets where id = budget_id and user_id = auth.uid())
  );

-- 13. EMAIL REMINDER SETTINGS
create table public.email_reminder_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  enabled boolean not null default true,
  frequency_days int not null default 7,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger update_email_reminder_settings_updated_at
  before update on public.email_reminder_settings
  for each row
  execute function public.update_updated_at_column();

alter table public.email_reminder_settings enable row level security;
create policy "Users can view own reminder settings" on public.email_reminder_settings
  for select using (auth.uid() = user_id);
create policy "Users can insert own reminder settings" on public.email_reminder_settings
  for insert with check (auth.uid() = user_id);
create policy "Users can update own reminder settings" on public.email_reminder_settings
  for update using (auth.uid() = user_id);

-- 14. EMAIL REMINDER LOGS
create table public.email_reminder_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  sent_at timestamptz not null default now(),
  budget_ids uuid[] not null default '{}',
  status text not null default 'sent',
  error_message text
);

create index idx_email_logs_user on public.email_reminder_logs(user_id);

alter table public.email_reminder_logs enable row level security;
create policy "Users can view own reminder logs" on public.email_reminder_logs
  for select using (auth.uid() = user_id);
