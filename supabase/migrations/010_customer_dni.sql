-- Campo DNI/NIF opcional en clientes
alter table public.customers add column if not exists dni text;
