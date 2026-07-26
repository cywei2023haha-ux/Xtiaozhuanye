-- gear: screen 4 product cards (R2 gear/)
-- gallery: screen 5 tagged infinite scroll (R2 gallery/)
-- archive: screens 1–2 random pool (R2 archive/)
-- hero_avatar: screen 1 profile (R2 avatars/ for new uploads)

-- Move existing tagged archive rows into gallery pool (files stay at archive/ path)
update public.images
set image_role = 'gallery'
where image_role = 'archive'
  and jsonb_array_length(associated_products) > 0;
