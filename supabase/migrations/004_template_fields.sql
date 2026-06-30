-- Add free-form template fields to budgets table
alter table public.budgets 
  add column if not exists brand_name text,
  add column if not exists model_name text,
  add column if not exists items jsonb default '[]'::jsonb,
  add column if not exists description text;
