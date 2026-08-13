# Visual Hub 图片外链对照表（第二屏）

> **已过时（2026-08）**：第二屏已改为角色集瀑布列表，点击进入 `/gallery/[setId]` 五图预览。  
> 下列 `VISUAL_HUB_IMAGE_LINKS` 配置**不再驱动第二屏 UI**；文件暂留，待后续清理。

第二屏每张图可配置**独立跳转链接**。未配置的图统一跳转到默认 Patreon 页。

## 默认链接

| 场景 | URL |
|------|-----|
| 未单独配置的图 | https://patreon.com/AstraBloom |

默认地址来自 `lib/config.ts` → `LINKS.fanClub`（环境变量 `NEXT_PUBLIC_FANCLUB_URL`）。

## 如何配置「一图一链」

1. 在后台 `/admin` 的 **Archive** 列表找到图片的 `image_id`（如 `img_mr15blli_9eiczo`）
2. 编辑代码文件 **`lib/visual-hub-links.ts`**，在 `VISUAL_HUB_IMAGE_LINKS` 中追加一行：

```ts
export const VISUAL_HUB_IMAGE_LINKS: Record<string, string> = {
  "img_mr15blli_9eiczo": "https://patreon.com/AstraBloom/posts/your-post",
  "img_mr15mup6_b74e60": "https://example.com/another-character",
};
```

3. **同步更新下方对照表**（本文件），方便团队查阅
4. 保存后重新部署（或本地 `npm run dev` 刷新）

> 图片仍从 Archive 池随机抽取；链接配置只决定**点击后跳去哪里**，不改变抽图逻辑。

## 点击行为

| 格子类型 | 外观 | 点击跳转 |
|----------|------|----------|
| Free Look（每页第 1–2 格） | 清晰图 + 黄标 | `VISUAL_HUB_IMAGE_LINKS[image_id]` 或默认 Patreon |
| 锁定格（每页第 3–6 格） | 模糊 + 🔒 | 同上 |

外链会自动附带 `utm_source` / `utm_medium`（ref 追踪），medium 为 `visual_hub`。

## 图片 ↔ 链接对照表

在 `lib/visual-hub-links.ts` 中配置后，在此记录便于查阅：

| image_id | 跳转链接 | 备注 |
|----------|----------|------|
| _(暂无)_ | — | 未配置时全部走默认 Patreon |

### 填写示例

| image_id | 跳转链接 | 备注 |
|----------|----------|------|
| `img_mr15blli_9eiczo` | https://patreon.com/AstraBloom/posts/chapter-01 | Aria 角色集 |
| `img_mr15mup6_b74e60` | https://patreon.com/AstraBloom | 无专属帖，用默认 |

## 相关文件

| 文件 | 作用 |
|------|------|
| `lib/visual-hub-links.ts` | **代码读取的配置**（必改） |
| `docs/visual-hub-links.md` | 本对照文档（建议同步） |
| `components/screens/VisualHub.tsx` | 第二屏 UI 与点击逻辑 |
| `lib/featured-gallery.ts` | 从 `archive` 池随机抽 30 张图 |

## 图片来源（与链接分开管理）

- 上传：后台 `/admin/upload`（Archive）
- 存储：R2 `archive/` + Supabase `image_role = archive`
- 随机展示：`lib/featured-gallery.ts`（5 页 × 6 格）
