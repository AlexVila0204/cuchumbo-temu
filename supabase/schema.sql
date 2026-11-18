create table if not exists public.people (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  pin_hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.wishes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.people(id) on delete cascade,
  url text not null,
  title text not null,
  image text,
  reserved_by uuid references public.people(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.people enable row level security;
alter table public.wishes enable row level security;

grant select, insert, update, delete on public.people, public.wishes to service_role;
