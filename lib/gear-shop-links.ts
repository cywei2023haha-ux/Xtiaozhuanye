import { LINKS } from "@/lib/config";

/**
 * Gear Shop（第四屏）商品外链 — 代码读取的唯一配置源
 *
 * 维护说明：
 * 1. 上传时在 /admin/upload/gear 填写 Shop Link（优先）
 * 2. 或在 GEAR_SHOP_PRODUCT_LINKS 添加 image_id → URL 覆盖
 */
export const GEAR_SHOP_DEFAULT_LINK =
  LINKS.shop || "https://shop.astroa.fun";

/** 顶部大卡片可单独配置；未设置则与 GEAR_SHOP_DEFAULT_LINK 相同 */
export const GEAR_SHOP_HERO_LINK = GEAR_SHOP_DEFAULT_LINK;

/** 已配置专属链接的商品；未列出的 image_id 使用 GEAR_SHOP_DEFAULT_LINK */
export const GEAR_SHOP_PRODUCT_LINKS: Record<string, string> = {
  // 示例：
  // "img_gear_001": "https://shop.astroa.fun/products/leather-set",
  // "fallback_0": "https://shop.astroa.fun/products/restraints",
};

export function getGearShopLink(
  imageId: string,
  shopUrlFromDb?: string | null,
): string {
  const fromDb = shopUrlFromDb?.trim();
  if (fromDb) return fromDb;

  const custom = GEAR_SHOP_PRODUCT_LINKS[imageId]?.trim();
  return custom || GEAR_SHOP_DEFAULT_LINK;
}

export function hasCustomGearShopLink(productId: string): boolean {
  return Boolean(GEAR_SHOP_PRODUCT_LINKS[productId]?.trim());
}
