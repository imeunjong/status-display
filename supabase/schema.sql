-- 상태표시 프로그램 schema (v2: shared pair code)

create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  nickname text not null,
  partner_nickname text,
  partner_id uuid references public.users(id) on delete set null,
  current_status text,
  current_mood text,
  push_subscription jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- v2 → v3 migration
alter table public.users drop constraint if exists users_invite_code_key;
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='users' and column_name='invite_code'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='users' and column_name='partner_nickname'
  ) then
    alter table public.users rename column invite_code to partner_nickname;
  end if;
end $$;

alter table public.users alter column partner_nickname drop not null;

drop index if exists users_pending_pair_idx;
create index if not exists users_partner_id_idx on public.users(partner_id);
create index if not exists users_nickname_lookup_idx on public.users(nickname);
create index if not exists users_pending_partner_idx
  on public.users(partner_nickname) where partner_id is null;

create table if not exists public.status_logs (
  id bigserial primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  status text not null,
  mood text not null,
  created_at timestamptz not null default now()
);

create index if not exists status_logs_user_id_created_at_idx
  on public.status_logs(user_id, created_at desc);

alter table public.users disable row level security;
alter table public.status_logs disable row level security;
