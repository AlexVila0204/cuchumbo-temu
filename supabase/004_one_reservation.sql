create unique index if not exists wishes_one_reservation_per_person
  on public.wishes (reserved_by)
  where reserved_by is not null;
