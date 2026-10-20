-- Paste this entire file into the Supabase SQL Editor, then click Run.
-- It creates tables, a signup trigger, and Row Level Security.

-- Profiles: one row per signed-up user
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  email text not null,
  theme text not null default 'dark' check (theme in ('light', 'dark')),
  last_selected_city_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Cities the user pinned on Home
create table if not exists public.saved_cities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  city_name text not null,
  country text not null,
  latitude double precision not null,
  longitude double precision not null,
  created_at timestamptz not null default now(),
  unique (user_id, latitude, longitude)
);

-- Home remembers which saved city was last opened
alter table public.profiles
  drop constraint if exists profiles_last_selected_city_id_fkey;

alter table public.profiles
  add constraint profiles_last_selected_city_id_fkey
  foreign key (last_selected_city_id)
  references public.saved_cities (id)
  on delete set null;

create index if not exists saved_cities_user_id_idx
  on public.saved_cities (user_id);

-- Keep updated_at current when a profile is edited
create or replace function public.touch_profile_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function public.touch_profile_updated_at();

-- When a person signs up, create their profile and seed Osaka
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_city_id uuid;
begin
  insert into public.profiles (id, display_name, email, theme)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''), split_part(new.email, '@', 1)),
    new.email,
    'dark'
  );

  insert into public.saved_cities (user_id, city_name, country, latitude, longitude)
  values (new.id, 'Osaka', 'Japan', 34.6937, 135.5023)
  returning id into new_city_id;

  update public.profiles
  set last_selected_city_id = new_city_id
  where id = new.id;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Row Level Security: a user may only touch their own rows
alter table public.profiles enable row level security;
alter table public.saved_cities enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can read own cities" on public.saved_cities;
drop policy if exists "Users can insert own cities" on public.saved_cities;
drop policy if exists "Users can update own cities" on public.saved_cities;
drop policy if exists "Users can delete own cities" on public.saved_cities;

create policy "Users can read own profile"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users can read own cities"
  on public.saved_cities
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own cities"
  on public.saved_cities
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own cities"
  on public.saved_cities
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own cities"
  on public.saved_cities
  for delete
  to authenticated
  using (auth.uid() = user_id);

grant usage on schema public to anon, authenticated;
grant select, update on table public.profiles to authenticated;
grant select, insert, update, delete on table public.saved_cities to authenticated;
