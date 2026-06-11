-- TORtick MVP schema (Supabase Postgres compatible)
-- Apply in Supabase SQL editor.

create extension if not exists pgcrypto;

-- Users are anonymous; only a nickname + created_at.
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  nickname text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.communities (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.users(id) on delete restrict,
  title text not null,
  body text not null,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists posts_created_at_idx on public.posts (created_at desc);
-- MVP note: communities are added later; keep feed simple for now.

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.users(id) on delete restrict,
  body text not null,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists comments_post_created_idx on public.comments (post_id, created_at asc);

-- Chat rooms are tied to communities for MVP.
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  community_id uuid not null references public.communities(id) on delete cascade,
  author_id uuid not null references public.users(id) on delete restrict,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists chat_messages_room_created_idx on public.chat_messages (community_id, created_at desc);

-- Simple text search (MVP): trigram + ILIKE queries
create extension if not exists pg_trgm;
create index if not exists posts_title_trgm_idx on public.posts using gin (title gin_trgm_ops);
create index if not exists posts_body_trgm_idx on public.posts using gin (body gin_trgm_ops);

