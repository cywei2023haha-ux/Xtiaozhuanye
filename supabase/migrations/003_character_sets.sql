-- Character sets for ASTRABLOOM:GALLERY (My_AI_Output/{folder}/01.webp … 05.webp)

create table if not exists public.character_sets (
  id uuid primary key default gen_random_uuid(),
  set_id text unique not null,
  folder_slug text unique not null,
  display_name text not null,
  preview_images jsonb not null default '[]'::jsonb,
  unlock_url text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists character_sets_sort_order_idx
  on public.character_sets (sort_order asc);

alter table public.character_sets enable row level security;

create policy "Public read character sets"
  on public.character_sets
  for select
  to anon, authenticated
  using (true);
