-- Run in Supabase SQL Editor when connecting a live database.

create table if not exists public.images (
  id uuid primary key default gen_random_uuid(),
  image_id text unique not null,
  r2_url text not null,
  is_locked boolean not null default false,
  sort_order integer not null default 0,
  image_role text not null default 'archive',
  associated_products jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists images_sort_order_idx on public.images (sort_order asc);
create index if not exists images_image_role_idx on public.images (image_role);

-- Character sets: ASTRABLOOM:GALLERY (My_AI_Output/{folder}/01.webp … 05.webp)
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

alter table public.images enable row level security;

create policy "Public read access"
  on public.images
  for select
  to anon, authenticated
  using (true);

-- Admin writes go through Next.js API routes using SUPABASE_SERVICE_ROLE_KEY,
-- which bypasses RLS. Do not expose the service role key to the browser.
