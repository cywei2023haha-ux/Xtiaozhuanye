-- Run this ALONE in Supabase SQL Editor (do not paste into schema.sql).
-- Safe to run multiple times.

alter table public.images
  add column if not exists image_role text not null default 'archive';

create index if not exists images_image_role_idx on public.images (image_role);
