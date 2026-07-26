# The Stand Archive

全栈引流图集系统 — Bridge Page & Visual Hub。

## 目录

1. [使用说明](#1-使用说明)
2. [上线部署说明](#2-上线部署说明)
3. [各部分的修改说明](#3-各部分的修改说明)
4. [本地修改后回传线上](#4-本地修改后回传线上)

---

## 1. 使用说明

### 1.1 本地启动

```bash
npm install
npm run dev
```

浏览器访问 [http://localhost:3000](http://localhost:3000)。

### 1.2 环境变量配置

本项目在 Cursor 中编辑 **`env.local`**（根目录），保存后同步到 Next.js 读取的 `.env.local`：

```bash
npm run env:sync
```

改完环境变量后需**重启** `npm run dev`。

完整变量清单见 [`.env.example`](./.env.example)。核心项：

| 类别 | 变量 | 用途 |
|------|------|------|
| Admin | `ADMIN_API_KEY` | 管理后台登录密钥 |
| Supabase | `NEXT_PUBLIC_SUPABASE_URL`、`SUPABASE_SERVICE_ROLE_KEY` 等 | 图片元数据存储 |
| R2 | `R2_ACCOUNT_ID`、`R2_ACCESS_KEY_ID`、`R2_SECRET_ACCESS_KEY`、`R2_BUCKET_NAME`、`R2_PUBLIC_URL` | 图片文件存储 |
| 外链 | `NEXT_PUBLIC_FANCLUB_URL`、`NEXT_PUBLIC_ACADEMY_URL`、`NEXT_PUBLIC_SHOP_URL` | 各屏**默认**跳转；专属链接见 `lib/*-links.ts`（§3.1） |
| Ref | `ROOT_DOMAIN`、`REF_SUBDOMAIN_MAP` | 子域名 / 来源追踪 |

### 1.3 数据库初始化（Supabase）

首次使用需在 [Supabase SQL Editor](https://supabase.com/dashboard) 执行：

1. **建表**：`supabase/schema.sql`（全新项目）
2. **迁移**（表已存在但缺字段）：`supabase/migrations/001_add_image_role.sql`

> 单独执行迁移 SQL，不要粘贴进 `create policy` 语句中间。

### 1.4 管理后台

访问 [http://localhost:3000/admin](http://localhost:3000/admin)，使用 `ADMIN_API_KEY` 登录。

| 功能 | 路径 | 说明 |
|------|------|------|
| 图库上传 | `/admin/upload` | 拖拽图片 → R2 → 写入 Supabase |
| Hero 头像 | `/admin/hero` | 专用头像，不参与随机图库 |
| 商品打点 | `/admin/tag/[imageId]` | 在图片上添加商品锚点 |
| 删除图片 | `/admin` 或 tag 页 **Delete** | 删 Supabase 记录（只删 R2 文件页面仍会引用） |

**首次上传前**需配置 R2 CORS（浏览器直传）：

```bash
npx wrangler login
npm run r2:cors
```

若上传报 `Failed to fetch` / CORS 错误，即未配置或域名未加入白名单。可在 Cloudflare R2 → bucket → Settings → CORS 手动添加，或修改 `scripts/r2-cors.json` 后重跑 `npm run r2:cors`。

### 1.5 页面功能概览

| 屏 | 功能 |
|----|------|
| Hero | 随机背景 + 固定头像，主转化 CTA |
| Visual Hub | 5 页 2×3 竖屏图集，横向滑动换页，部分锁定 |
| Kink Academy | 20 条模块列表，一次显示 5 条可上下滑动 |
| Gear Shop | 商城 CTA + 3 个商品卡 + LOAD MORE 展开全图库 |

### 1.6 Ref 子域名追踪

`middleware.ts` 按优先级解析 ref：

1. URL 参数 `?ref=` 或 `?utm_source=`
2. 子域名（如 `alice.yourdomain.com`，通过 `REF_SUBDOMAIN_MAP` 映射）
3. Cookie `stand_ref`（30 天）

本地测试：`http://alice.localhost:3000`

---

## 2. 上线部署说明

本项目使用 [@opennextjs/cloudflare](https://opennext.js.org/cloudflare) 部署至 **Cloudflare Workers**。

> **完整逐步说明书（推荐照着做）：** [docs/deploy.md](./docs/deploy.md)  
> 域名：`artslab.fun` · 流程：本地准备 → GitHub → Cloudflare → 绑域名 → Admin 上传

### 2.1 首次部署前检查

- [ ] Supabase 表已建好（`schema.sql` + 迁移，含 `003_character_sets.sql`）
- [ ] R2 bucket 已创建，CORS 已配置（含 `https://artslab.fun`）
- [ ] Cloudflare 账号已登录：`npx wrangler login`
- [ ] 所有环境变量已在 Cloudflare 配置（见下文）
- [ ] 代码已推送 GitHub（**不要**提交 `env.local`）

### 2.2 CLI 部署

```bash
# 本地预览 Workers 运行时
npm run preview

# 构建并部署
npm run deploy
```

### 2.3 Cloudflare 环境变量

在 **Cloudflare Dashboard → Workers → Settings → Variables** 配置，或使用 CLI：

**Secrets（敏感信息）：**

```bash
npx wrangler secret put ADMIN_API_KEY
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
npx wrangler secret put R2_ACCESS_KEY_ID
npx wrangler secret put R2_SECRET_ACCESS_KEY
```

**Plaintext（公开变量）：**

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
R2_ACCOUNT_ID
R2_BUCKET_NAME
R2_PUBLIC_URL
NEXT_PUBLIC_FANCLUB_URL
NEXT_PUBLIC_ACADEMY_URL
NEXT_PUBLIC_SHOP_URL
ROOT_DOMAIN
NEXT_PUBLIC_ROOT_DOMAIN
REF_SUBDOMAIN_MAP
```

> 线上 `NEXT_PUBLIC_*` 必须与本地 `env.local` 保持一致（或按环境分别配置）。

### 2.4 DNS 泛域名

在 Cloudflare DNS 添加：

```
*.yourdomain.com  →  CNAME  your-worker-subdomain.workers.dev
yourdomain.com    →  同上
```

`ROOT_DOMAIN` 必须与主域一致（如 `artslab.fun`）。

### 2.5 GitHub CI/CD（可选）

1. 仓库连接 Cloudflare Dashboard → Workers & Pages
2. **Build command:** `npx opennextjs-cloudflare build`
3. **Deploy command:** `npx wrangler deploy`
4. 在 Settings 配置全部环境变量

### 2.6 上线后验证

1. 首页四屏正常加载、图片显示
2. `/admin` 可登录、上传、删除
3. 各屏 CTA 跳转正确外链
4. 子域名 ref 追踪正常（可选）

---

## 3. 各部分的修改说明

改完代码保存 → 刷新浏览器（无变化则重启 `npm run dev`）。**仅改 `env.local` 时需 `npm run env:sync` 并重启。**

### 3.1 设置各屏跳转链接

#### 总览：配置文件 ↔ 页面用法

| 屏 | 点击区域 | 代码配置（专属链接） | 解析函数 | 页面组件 | 对照文档 | 未配置时默认 |
|----|----------|----------------------|----------|----------|----------|--------------|
| 1 Hero | 底部 CTA | — | — | `HeroScreen.tsx` → `LINKS.fanClub` | — | Patreon |
| 2 Visual Hub | 每张图（Free Look + 锁定格） | `lib/visual-hub-links.ts` → `VISUAL_HUB_IMAGE_LINKS` | `getVisualHubLink(image_id)` | `VisualHub.tsx` | [docs/visual-hub-links.md](./docs/visual-hub-links.md) | `LINKS.fanClub` |
| 3 Kink Academy | 20 条模块 + 底部 CTA | `lib/kink-academy-links.ts` → `KINK_ACADEMY_MODULE_LINKS` | `getKinkAcademyLink(num)` | `KinkAcademy.tsx` | [docs/kink-academy-links.md](./docs/kink-academy-links.md) | `LINKS.academy` |
| 3 Kink Academy | 底部「Enter The Academy →」 | — | — | `KinkAcademy.tsx` → `LINKS.academy` | 同上 | `LINKS.academy` |
| 4 Gear Shop | 3 个商品卡 | 上传时填 **Shop Link**（存 Supabase）或 `lib/gear-shop-links.ts` | `getGearShopLink(image_id, shop_url)` | `GearShop.tsx` | [docs/gear-shop-links.md](./docs/gear-shop-links.md) | `LINKS.shop` |
| 4 Gear Shop | 顶部大卡片 | — | `GEAR_SHOP_HERO_LINK` | `GearShop.tsx` | 同上 | `LINKS.shop` |
| 5 展开图库 | 商品锚点气泡 | 后台 `/admin/tag/[imageId]` 逐张设 `shop_url` | — | `ImageArchiveCard.tsx` | — | 各图独立 |

**规则**：第二、三、四屏均支持「一图/条/商品一链」；**未写入专属映射的 key，自动走该屏默认 URL**（默认 URL 由 `lib/config.ts` → `LINKS` 或环境变量控制）。

#### 环境变量（改全站默认跳转）

编辑 **`env.local`** 后执行 `npm run env:sync` 并重启 dev：

```env
NEXT_PUBLIC_FANCLUB_URL=https://patreon.com/AstraBloom
NEXT_PUBLIC_ACADEMY_URL=https://astroa.fun
NEXT_PUBLIC_SHOP_URL=https://shop.astroa.fun
```

| 变量 | 影响范围 |
|------|----------|
| `NEXT_PUBLIC_FANCLUB_URL` | 第一屏 CTA；第二屏未配置 `VISUAL_HUB_IMAGE_LINKS` 的图 |
| `NEXT_PUBLIC_ACADEMY_URL` | 第三屏未配置 `KINK_ACADEMY_MODULE_LINKS` 的模块 + 底部 CTA |
| `NEXT_PUBLIC_SHOP_URL` | 第四屏未配置 `GEAR_SHOP_PRODUCT_LINKS` 的商品 + 顶部大卡片 |

逻辑定义在 **`lib/config.ts`** → `LINKS`。各屏 `*-links.ts` 中的 fallback 也引用 `LINKS.*`。

#### 专属链接 key 对照

| 屏 | 映射文件中的 key | 如何查 key |
|----|------------------|------------|
| 第二屏 | `image_id` | `/admin` → Archive 列表 |
| 第三屏 | 模块 `num`（`"01"` ~ `"20"`） | `lib/kink-academy-modules.ts` |
| 第四屏 | `image_id`；无后台图时用 `fallback_0` ~ `fallback_2` | `/admin` → Gear 列表 |

配置专属链接后，建议同步更新对应 **`docs/*-links.md`** 对照表（便于查阅；代码只读 `lib/*-links.ts`）。

第五屏图库商品锚点的 `shop_url` 在 **`/admin/tag/[imageId]`** 逐张设置，不走上述三个环境变量。

### 3.2 修改页面文字

#### 全站通用

| 改什么 | 文件 |
|--------|------|
| 账号名（头像旁 @handle） | `lib/config.ts` → `SITE.handle` |
| 浏览器标签标题、SEO | `app/layout.tsx` → `metadata` |

#### 第一屏 Hero

文件：**`components/screens/HeroScreen.tsx`**

| 元素 | 位置 |
|------|------|
| 顶部黄标 `THE PRIVATE ARCHIVE` | `ScreenShell` 的 `label` + 内联 `<span>` |
| `CONTINUE TO PREMIUM FEED` | `<header>` 第一行小字 |
| 大标题三行 | `<h1>` 内三个 `<span>` |
| `Daily updated creator content stream` | `<header>` 副标题 |
| 底部 CTA 卡片全部文案 | `TrackedJojoCard` 内 |

#### 第二屏 Visual Hub

文件：**`components/screens/VisualHub.tsx`**

| 元素 | 位置 |
|------|------|
| 顶部标签 `CHARACTER SELECTION HUB` | `ScreenShell` 的 `label` |
| 大标题 `VIEW ALL PROFILES →` | `<h2>` |
| 两行说明文案 | `<p>`（loading 状态文案同文件） |
| 卡片标签 `Free Look` | `HubCell` 组件 |
| 每张图的点击跳转 | `lib/visual-hub-links.ts`（见下） |

**图片 ↔ 外链（一图一链）**

| 改什么 | 文件 |
|--------|------|
| 为某张图配置专属链接 | `lib/visual-hub-links.ts` → `VISUAL_HUB_IMAGE_LINKS` |
| 未配置图的默认跳转（Patreon） | `lib/config.ts` → `LINKS.fanClub` 或 `NEXT_PUBLIC_FANCLUB_URL` |
| 对照表文档（建议同步维护） | [docs/visual-hub-links.md](./docs/visual-hub-links.md) |

```ts
// lib/visual-hub-links.ts
export const VISUAL_HUB_IMAGE_LINKS: Record<string, string> = {
  "img_你的图片ID": "https://patreon.com/AstraBloom/posts/...",
};
// 未出现在此表中的 image_id → 默认 https://patreon.com/AstraBloom
```

- `image_id` 在后台 `/admin` → Archive 列表查看
- Free Look 与锁定格点击后均跳转对应链接（带 ref 追踪，`utm_medium=visual_hub`）
- 图片来源仍为 Archive 随机池（`/admin/upload`），与链接配置分开管理

#### 第三屏 Kink Academy

| 改什么 | 文件 |
|--------|------|
| 顶部标签、大标题、底部 CTA 文案 | `components/screens/KinkAcademy.tsx` |
| 20 条模块列表（序号 / 标题 / 描述） | `lib/kink-academy-modules.ts` |
| 每条模块的点击跳转 | `lib/kink-academy-links.ts`（见下） |
| 对照表文档（建议同步） | [docs/kink-academy-links.md](./docs/kink-academy-links.md) |

模块列表示例：

```ts
{ num: "01", title: "Foundations", desc: "Safety, consent & scene negotiation" },
```

**模块 ↔ 外链（一条目一链）**

```ts
// lib/kink-academy-links.ts
export const KINK_ACADEMY_MODULE_LINKS: Record<string, string> = {
  "01": "https://astroa.fun/products/your-product",
};
// 未出现在此表的 num → 默认 https://astroa.fun
```

- **修改标题/描述**：改 `kink-academy-modules.ts`
- **配置专属链接**：在 `kink-academy-links.ts` 用 `num`（如 `"01"`）作 key
- **未配置链接**：自动跳转 `LINKS.academy`（默认 astroa.fun）
- **新增/删除条目**：改 `kink-academy-modules.ts`；若有专属链接，同步改 `kink-academy-links.ts`
- **一次显示条数**：`KINK_ACADEMY_VISIBLE_COUNT`（默认 5）

#### 第四屏 Gear Shop

文件：**`components/screens/GearShop.tsx`**

| 元素 | 位置 |
|------|------|
| 顶部标签 `CREATOR GEAR HUB` | `ScreenShell` 的 `label` |
| 黄卡小标题 / 大标题 / 说明 | 顶部 `TrackedJojoCard` 内 |
| 3 个商品名和价格 | 后台 Gear **Edit Product**，或 `FALLBACK_GEAR` 占位 |
| LOAD MORE 按钮文字 | 底部 `<button>` |

**商品 ↔ 外链（一商品一链）**

| 改什么 | 文件 |
|--------|------|
| 每个商品卡的点击跳转 | `/admin/upload/gear` 上传时填 **Shop Link**，或 `lib/gear-shop-links.ts` 按 `image_id` 覆盖 |
| 商品标题 / 价格 | `/admin/upload/gear` 上传时填写；也可 `/admin` → **Edit Product** 修改 |
| 对照表文档（建议同步） | [docs/gear-shop-links.md](./docs/gear-shop-links.md) |

```ts
// lib/gear-shop-links.ts
export const GEAR_SHOP_PRODUCT_LINKS: Record<string, string> = {
  "img_你的gear图ID": "https://shop.astroa.fun/products/xxx",
  "fallback_0": "https://shop.astroa.fun/products/restraints",
};
// 未配置的 image_id → 默认 https://shop.astroa.fun
```

- `image_id` 在 `/admin` → Gear 列表查看；无后台图时用 `fallback_0` ~ `fallback_2`
- 商品图上传：`/admin/upload/gear`（R2 `gear/`）

### 3.3 修改图片内容

| 内容 | 方式 | 说明 |
|------|------|------|
| 图库图片 | `/admin/upload` | `image_role = archive`，参与第一、二屏随机池 |
| Visual Hub 外链 | `lib/visual-hub-links.ts` | 第二屏每图跳转；未配置 → Patreon |
| Kink Academy 外链 | `lib/kink-academy-links.ts` | 第三屏每条模块；未配置 → astroa.fun |
| Gear Shop 外链 | `lib/gear-shop-links.ts` | 第四屏每个商品；未配置 → shop.astroa.fun |
| Hero 头像 | `/admin/hero` | `image_role = hero_avatar`，仅第一屏头像 |
| 删除图片 | `/admin` → Delete | 必须删数据库记录，不能只删 R2 |
| 商品锚点 | `/admin/tag/[imageId]` | 名称、价格、跳转 URL（可选） |
| 锁定图 | 上传时勾选 locked，或 Visual Hub 后 4 格逻辑 | 第二屏 index ≥ 2 显示模糊 + 锁 |

### 3.4 样式与设计

| 改什么 | 文件 |
|--------|------|
| 全局颜色、hover 动效 | `app/globals.css` |
| 卡片组件 | `components/ui/JojoCard.tsx` |
| 各屏布局 | `components/screens/*.tsx` |

设计规范详见 [PROJECT_SPEC.md](./PROJECT_SPEC.md)。

---

## 4. 本地修改后回传线上

### 4.1 修改类型与操作对照

| 你改了什么 | 本地操作 | 线上操作 |
|------------|----------|----------|
| 页面文字 / 样式 / 组件代码 | 保存 → 刷新验证 | **重新部署**（见 4.2） |
| `env.local` 环境变量 | `npm run env:sync` → 重启 dev | 在 Cloudflare Dashboard 更新对应变量 |
| Supabase 数据（上传/删除图） | 后台操作 | **无需部署**，数据在云端已生效 |
| R2 CORS 白名单 | `npm run r2:cors` | 在 Cloudflare R2 控制台更新 CORS 或重跑脚本 |
| 数据库表结构 | Supabase SQL Editor | 同一 Supabase 项目，执行相同 SQL |

### 4.2 代码更新部署流程（推荐）

```bash
# 1. 本地验证
npm run build          # 确保构建通过
npm run dev            # 浏览器检查各屏

# 2. 提交到 Git（若使用版本管理）
git add .
git commit -m "描述你的修改"
git push origin main   # 或你的分支名

# 3. 部署到 Cloudflare
npm run deploy
```

若使用 **GitHub CI/CD**，`git push` 后 Cloudflare 会自动构建部署，无需手动 `npm run deploy`。

### 4.3 仅改环境变量（不改代码）

1. 修改本地 `env.local` 并 `npm run env:sync` 验证
2. 登录 Cloudflare Dashboard → Workers → Variables
3. 更新对应 `NEXT_PUBLIC_*` 或 Secrets
4. **无需重新部署代码**；若变量在构建时内联，则需重新 deploy 一次

### 4.4 仅改图片 / 模块数据（不改代码）

- **图片**：在 `/admin` 上传或删除 → 刷新线上页面即生效
- **第三屏模块**：改 `lib/kink-academy-modules.ts` 属于**代码变更**，需部署后才上线

### 4.5 回传检查清单

部署完成后逐项确认：

- [ ] 首页四屏文案、链接正确
- [ ] 图片加载正常（无裂图）
- [ ] `/admin` 可登录、可上传
- [ ] 外链跳转正确且带 ref（如需要）
- [ ] 手机竖屏布局正常

### 4.6 常见问题

| 现象 | 原因 | 处理 |
|------|------|------|
| Admin `Authentication failed` | 密钥对但数据库缺字段 | Supabase 执行 `001_add_image_role.sql` |
| Admin `Invalid admin key` | 密钥错误 | 核对 `ADMIN_API_KEY` |
| 上传 `Failed to fetch` | R2 CORS 未配置 | `npm run r2:cors` |
| 删了 R2 仍显示裂图 | 只删了文件没删记录 | `/admin` → Delete |
| 改了 env 本地无效 | 未 sync 或未重启 | `npm run env:sync` + 重启 dev |
| 改了 env 线上无效 | Cloudflare 未更新变量 | Dashboard 更新后重新 deploy |

---

## 附录

### 技术栈

- Next.js (App Router) + TypeScript
- Tailwind CSS v4
- Cloudflare R2 + Workers（OpenNext）
- Supabase

### 项目结构

```
app/                    # 页面与 API 路由
components/screens/     # 四屏主界面
components/admin/       # 管理后台
lib/                    # config、supabase、r2、模块数据
hooks/                  # useRefTracker、useFeaturedGallery 等
supabase/               # schema.sql、迁移
scripts/                # env:sync、r2:cors
env.local               # 环境变量（Cursor 可编辑）
middleware.ts           # ref + 子域名
wrangler.jsonc          # Cloudflare Workers 配置
```

### 相关文档

- [PROJECT_SPEC.md](./PROJECT_SPEC.md) — 完整项目计划书与设计规范
