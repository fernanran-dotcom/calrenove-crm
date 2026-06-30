-- Add is_custom flag to distinguish catalog brands from "Otra marca" user-created brands
alter table public.boiler_brands add column if not exists is_custom boolean not null default false;

-- Mark existing user-created brands
update public.boiler_brands set is_custom = true where slug in ('thermor');
