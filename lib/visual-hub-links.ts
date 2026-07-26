import { LINKS } from "@/lib/config";

/**
 * Visual Hub（第二屏）图片外链 — 代码读取的唯一配置源
 *
 * 维护说明：
 * 1. 在 VISUAL_HUB_IMAGE_LINKS 添加 image_id → URL
 * 2. 同步更新 docs/visual-hub-links.md 对照表（便于查阅）
 * 3. image_id 可在 /admin → Archive 列表或图片 URL 路径中查看
 */
export const VISUAL_HUB_DEFAULT_LINK =
  LINKS.fanClub || "https://patreon.com/AstraBloom";

/** 已配置专属链接的图片；未列出的图使用 VISUAL_HUB_DEFAULT_LINK */
export const VISUAL_HUB_IMAGE_LINKS: Record<string, string> = {
  // 示例（取消注释并改成真实 image_id）：
  // "img_mr15blli_9eiczo": "https://patreon.com/AstraBloom/posts/chapter-01",
};

export function getVisualHubLink(imageId: string): string {
  const custom = VISUAL_HUB_IMAGE_LINKS[imageId]?.trim();
  return custom || VISUAL_HUB_DEFAULT_LINK;
}

export function hasCustomVisualHubLink(imageId: string): boolean {
  return Boolean(VISUAL_HUB_IMAGE_LINKS[imageId]?.trim());
}
