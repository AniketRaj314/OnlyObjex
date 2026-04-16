create table if not exists public.objex (
  id text primary key,
  image_path text not null,
  image_public_url text not null,
  created_at timestamptz not null default now(),
  profile_json jsonb not null,
  is_published boolean not null default false,
  published_at timestamptz
);

create index if not exists objex_created_at_idx on public.objex (created_at desc);
create index if not exists objex_published_idx on public.objex (is_published, published_at desc, created_at desc);

create table if not exists public.objex_chat_messages (
  id text primary key,
  objex_id text not null references public.objex(id) on delete cascade,
  role text not null,
  content text not null,
  created_at timestamptz not null default now(),
  audio_public_url text
);

create index if not exists objex_chat_messages_objex_created_at_idx
  on public.objex_chat_messages (objex_id, created_at);

create table if not exists public.objex_chat_memory (
  objex_id text primary key references public.objex(id) on delete cascade,
  summary text not null,
  updated_at timestamptz not null default now()
);

alter table public.objex enable row level security;
alter table public.objex_chat_messages enable row level security;
alter table public.objex_chat_memory enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'objex' and policyname = 'objex_read_public'
  ) then
    create policy objex_read_public on public.objex
      for select using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'objex_chat_messages' and policyname = 'objex_chat_messages_read_public'
  ) then
    create policy objex_chat_messages_read_public on public.objex_chat_messages
      for select using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'objex_chat_memory' and policyname = 'objex_chat_memory_read_public'
  ) then
    create policy objex_chat_memory_read_public on public.objex_chat_memory
      for select using (true);
  end if;
end $$;

insert into storage.buckets (id, name, public)
values
  ('uploads', 'uploads', true),
  ('chat-audio', 'chat-audio', true),
  ('scene-videos', 'scene-videos', true)
on conflict (id) do nothing;
