alter table public.people add column if not exists approved boolean not null default false;
alter table public.people add column if not exists is_admin boolean not null default false;
