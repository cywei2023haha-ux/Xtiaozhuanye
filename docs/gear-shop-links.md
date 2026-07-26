# Gear Shop 商品外链对照表（第四屏）

第四屏商品卡片可配置**独立跳转链接**。未配置的商品统一跳转到默认商店地址。

## 默认链接

| 场景 | URL |
|------|-----|
| 未单独配置的商品 | https://shop.astroa.fun |
| 顶部大卡片「Buy The Full Setup」 | 同上（`GEAR_SHOP_HERO_LINK`） |

默认地址来自 `lib/config.ts` → `LINKS.shop`（环境变量 `NEXT_PUBLIC_SHOP_URL`）。

## 如何配置「一商品一链」

**推荐：上传时填写（无需改代码）**

1. 打开 **`/admin/upload/gear`**
2. 填写 **Product Title**（必填）、**Shop Link**（可选）、**Price**（可选）
3. 上传图片 → 标题与链接写入 Supabase `associated_products`
4. 留空 Shop Link 时使用默认 `https://shop.astroa.fun`

2. 编辑 **`lib/gear-shop-links.ts`**（仅当需覆盖上传时填的链接）：

```ts
export const GEAR_SHOP_PRODUCT_LINKS: Record<string, string> = {
  "img_你的gear图ID": "https://shop.astroa.fun/products/xxx",
};
```

3. 保存后重新部署（或本地 `npm run dev` 刷新）

> 链接优先级：上传时填的 Shop Link > `gear-shop-links.ts` > 默认 shop.astroa.fun

## 点击行为

| 区域 | 点击跳转 |
|------|----------|
| 顶部黄卡大 CTA | `GEAR_SHOP_HERO_LINK`（默认 shop.astroa.fun） |
| 下方 3 个商品卡 | 上传时填的 `shop_url` → 否则 `GEAR_SHOP_PRODUCT_LINKS[image_id]` → 默认 |

外链自动附带 ref 追踪，`utm_medium=gear`。

## 商品 ↔ 链接对照表

| image_id | 商品名（参考） | 跳转链接 | 备注 |
|----------|---------------|----------|------|
| _(暂无专属链接)_ | — | — | 全部走默认 shop.astroa.fun |

### 填写示例

| image_id | 商品名（参考） | 跳转链接 | 备注 |
|----------|---------------|----------|------|
| `fallback_0` | Leather Restraint Set | https://shop.astroa.fun/products/restraints | 无后台图时的占位 |
| `img_abc123` | Premium Impact Tools | https://shop.astroa.fun/products/impact | 后台 Gear 上传 |

## 相关文件

| 文件 | 作用 |
|------|------|
| `lib/gear-shop-links.ts` | **链接配置**（必改） |
| `components/screens/GearShop.tsx` | 第四屏 UI |
| `lib/gear-images.ts` | 从 Supabase 读取 `gear` 商品图 |
