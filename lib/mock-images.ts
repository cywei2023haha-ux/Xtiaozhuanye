import { FEATURED_IMAGE_ROLE, GALLERY_IMAGE_ROLE, GEAR_IMAGE_ROLE } from "@/lib/image-roles";
import type { ArchiveImage, AssociatedProduct, ImageRole } from "@/lib/types";

const GRADIENTS = [
  "from-[#FFCC00] via-[#ff6b6b] to-[#D600FF]",
  "from-[#00FFCC] via-[#FFCC00] to-[#1a1a1a]",
  "from-[#D600FF] via-[#1a1a1a] to-[#FFCC00]",
  "from-[#1a1a1a] via-[#D600FF] to-[#00FFCC]",
  "from-[#FFCC00] via-[#1a1a1a] to-[#D600FF]",
  "from-[#00FFCC] via-[#D600FF] to-[#FFCC00]",
];

const GEAR_GRADIENTS = [
  "from-[#1a1a1a] via-[#FFCC00] to-[#D600FF]",
  "from-[#D600FF] via-[#00FFCC] to-[#1a1a1a]",
  "from-[#FFCC00] via-[#1a1a1a] to-[#00FFCC]",
];

const PRODUCTS: Omit<AssociatedProduct, "position_x" | "position_y">[] = [
  {
    product_id: "leather_whip_01",
    name: "Handcrafted Leather Whip",
    price: "$49.99",
    shop_url: "https://example.com/product/whip",
  },
  {
    product_id: "restraint_set_02",
    name: "Premium Restraint Set",
    price: "$69.99",
    shop_url: "https://example.com/product/restraints",
  },
  {
    product_id: "collar_03",
    name: "Steel O-Ring Collar",
    price: "$34.99",
    shop_url: "https://example.com/product/collar",
  },
  {
    product_id: "paddle_04",
    name: "Impact Paddle Pro",
    price: "$39.99",
    shop_url: "https://example.com/product/paddle",
  },
];

const FEATURED_GEAR = [
  { name: "Leather Restraint Set", price: "$49.99" },
  { name: "Premium Impact Tools", price: "$39.99" },
  { name: "Scene Starter Kit", price: "$89.99" },
];

function buildMockImage(index: number, role: ImageRole): ArchiveImage {
  const id = index + 1;
  const sortOrder = id;
  const hasProducts = role === GALLERY_IMAGE_ROLE && id % 3 === 0;

  const associated_products: AssociatedProduct[] = hasProducts
    ? [
        {
          ...PRODUCTS[id % PRODUCTS.length],
          position_x: `${35 + (id % 4) * 10}%`,
          position_y: `${30 + (id % 3) * 15}%`,
        },
        ...(id % 6 === 0
          ? [
              {
                ...PRODUCTS[(id + 1) % PRODUCTS.length],
                position_x: `${55 + (id % 2) * 12}%`,
                position_y: `${55 + (id % 2) * 10}%`,
              },
            ]
          : []),
      ]
    : [];

  const prefix =
    role === GEAR_IMAGE_ROLE
      ? "gear"
      : role === GALLERY_IMAGE_ROLE
        ? "gallery"
        : "archive";

  const gradientSet =
    role === GEAR_IMAGE_ROLE ? GEAR_GRADIENTS : GRADIENTS;

  return {
    image_id: `img_${role}_${String(id).padStart(3, "0")}`,
    r2_url: `mock://${prefix}/gradient/${gradientSet[id % gradientSet.length]}`,
    is_locked: role === GALLERY_IMAGE_ROLE && id % 7 === 0,
    sort_order: sortOrder,
    image_role: role,
    associated_products,
  };
}

const MOCK_ARCHIVE: ArchiveImage[] = Array.from({ length: 40 }, (_, i) =>
  buildMockImage(i, FEATURED_IMAGE_ROLE),
);

const MOCK_GALLERY: ArchiveImage[] = Array.from({ length: 60 }, (_, i) =>
  buildMockImage(i, GALLERY_IMAGE_ROLE),
);

const MOCK_GEAR: ArchiveImage[] = FEATURED_GEAR.map((item, i) => ({
  ...buildMockImage(i, GEAR_IMAGE_ROLE),
  associated_products: [
    {
      product_id: `gear_product_${i + 1}`,
      name: item.name,
      price: item.price,
      shop_url: "https://example.com/shop",
      position_x: "50%",
      position_y: "50%",
    },
  ],
}));

export function getMockArchiveCatalog(): ArchiveImage[] {
  return MOCK_ARCHIVE.filter((img) => img.image_role === FEATURED_IMAGE_ROLE);
}

export function getMockGalleryCatalog(): ArchiveImage[] {
  return MOCK_GALLERY;
}

export function getMockGearCatalog(): ArchiveImage[] {
  return MOCK_GEAR;
}

export function fetchMockImagesPage(
  cursor: string | null,
  limit: number,
  role: ImageRole = GALLERY_IMAGE_ROLE,
): { items: ArchiveImage[]; nextCursor: string | null; hasMore: boolean } {
  const catalog =
    role === GEAR_IMAGE_ROLE
      ? MOCK_GEAR
      : role === FEATURED_IMAGE_ROLE
        ? MOCK_ARCHIVE
        : MOCK_GALLERY;

  const startIndex = cursor ? Number(cursor) : 0;
  const safeStart = Number.isFinite(startIndex) ? startIndex : 0;
  const items = catalog.slice(safeStart, safeStart + limit);
  const nextIndex = safeStart + items.length;
  const hasMore = nextIndex < catalog.length;

  return {
    items,
    nextCursor: hasMore ? String(nextIndex) : null,
    hasMore,
  };
}

export function getMockGradient(url: string): string | null {
  const match = url.match(/mock:\/\/(?:archive|gear|gallery)\/gradient\/(.+)$/);
  return match?.[1] ?? null;
}
