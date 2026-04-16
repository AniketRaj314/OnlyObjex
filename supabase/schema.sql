create table if not exists public.objex (
  id text primary key,
  image_public_url text not null,
  created_at timestamptz not null default now(),
  name text not null,
  object_type text not null,
  tagline text not null,
  bio text not null,
  kinks jsonb not null,
  green_flags jsonb not null,
  red_flags jsonb not null,
  opening_message text not null,
  hidden jsonb not null
);

create index if not exists objex_created_at_idx on public.objex (created_at desc);
