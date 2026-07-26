import { LINKS } from "@/lib/config";

/**
 * Kink Academy（第三屏）模块外链 — 代码读取的唯一配置源
 *
 * 维护说明：
 * 1. 在 KINK_ACADEMY_MODULE_LINKS 添加 num → URL（num 与 kink-academy-modules.ts 一致，如 "01"）
 * 2. 同步更新 docs/kink-academy-links.md 对照表
 */
export const KINK_ACADEMY_DEFAULT_LINK =
  LINKS.academy || "https://astroa.fun";

/** 已配置专属链接的模块；未列出的 num 使用 KINK_ACADEMY_DEFAULT_LINK */
export const KINK_ACADEMY_MODULE_LINKS: Record<string, string> = {
  // 示例：
  // "01": "https://astroa.fun/products/first-time-kink",
};

export function getKinkAcademyLink(moduleNum: string): string {
  const custom = KINK_ACADEMY_MODULE_LINKS[moduleNum]?.trim();
  return custom || KINK_ACADEMY_DEFAULT_LINK;
}

export function hasCustomKinkAcademyLink(moduleNum: string): boolean {
  return Boolean(KINK_ACADEMY_MODULE_LINKS[moduleNum]?.trim());
}
