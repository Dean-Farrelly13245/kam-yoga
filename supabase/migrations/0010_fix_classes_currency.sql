-- Ensure classes table has currency column with default
set check_function_bodies = off;

do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'classes'
  ) then
    if not exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'classes' and column_name = 'currency'
    ) then
      alter table public.classes
        add column currency text default 'eur';
    end if;

    -- ensure default
    alter table public.classes
      alter column currency set default 'eur';

    -- backfill nulls
    update public.classes
      set currency = 'eur'
      where currency is null;
  end if;
end
$$;
