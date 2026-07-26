export const LINKS = {
  fanClub:
    process.env.NEXT_PUBLIC_FANCLUB_URL?.trim() ||
    "https://patreon.com/AstraBloom",
  academy:
    process.env.NEXT_PUBLIC_ACADEMY_URL?.trim() ||
    "https://astroa.fun",
  shop:
    process.env.NEXT_PUBLIC_SHOP_URL?.trim() ||
    "https://shop.astroa.fun",
  gallery: "/gallery",
} as const;

export const SITE = {
  name: "The Stand Archive",
  handle: "@AstraBloom",
  tagline: "Uncensored Visual Archive",
} as const;
