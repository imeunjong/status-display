-- 상태표시 프로그램 schema
-- Run in Supabase SQL editor.

create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  nickname text not null,
  invite_code text not null unique,
  partner_id uuid references public.users(id) on delete set null,
  current_status text,
  current_mood text,
  push_subscription jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists users_partner_id_idx on public.users(partner_id);

create table if not exists public.status_logs (
  id bigserial primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  status text not null,
  mood text not null,
  created_at timestamptz not null default now()
);

create index if not exists status_logs_user_id_created_at_idx
  on public.status_logs(user_id, created_at desc);

-- Server uses service-role key, so RLS is off here.
alter table public.users disable row level security;
alter table public.status_logs disable row level security;
