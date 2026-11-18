alter table public.people add column if not exists failed_attempts integer not null default 0;

create or replace function public.consume_login_attempt(p_person_id uuid, p_max_attempts integer)
returns boolean
language sql
set search_path = ''
as $$
  with updated as (
    update public.people
    set failed_attempts = failed_attempts + 1
    where id = p_person_id and failed_attempts < p_max_attempts
    returning 1
  )
  select exists (select 1 from updated);
$$;

revoke execute on function public.consume_login_attempt(uuid, integer) from public, anon, authenticated;
grant execute on function public.consume_login_attempt(uuid, integer) to service_role;
