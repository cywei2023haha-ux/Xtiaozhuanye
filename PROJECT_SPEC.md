# 项目计划书：The Stand Archive 全栈引流图集系统

> 技术管理与开发总设计图。基于 **「新野兽主义 JOJO 撞色风」** 全栈引流图集系统。

---

## 1. 项目定位与商业闭环

本项目旨在打造一个面向全球（欧美本土为主）的高转化、高带宽免疫、具备极强视觉冲击力的 **私域流量多综合体洗牌机（Bridge Page & Visual Hub）**。通过将 **JOJO 奇妙冒险的新野兽主义波普撞色美学** 与 **Kinfolk 杂志感排版** 结合，将来自 X (Twitter)、Instagram、Pinterest、Facebook 矩阵的多渠道流量进行洗牌与最大化变现（LTV）。

### 四大核心变现链接与链路闭环

```
                        ┌─── [ 流量入口：X, Ins, Pinterest, FB 矩阵 ] (?ref=source)
                        │
                        ▼
┌────────────────────────────────────────────────────────┐
│   独立中间页 (The Visual Hub) - 4屏黄金长度 / 动态加载    │
└───────────────────────┬──────────────┬───────────────┘
                        │              │
        ┌───────────────┼──────────────┴──────────────┐
        ▼ (主转化线 70%)  ▼ (硬核内容 15%)               ▼ (实体带货 15%)
 ┌──────────────┐┌──────────────┐┌────────────────────────┐
 │ Paid Fan Club││ Kink Academy ││       Gear Shop        │
 │ (OnlyFans/   ││ (BDSM 独立   ││ (成人用品商城 - 情境带货)
 │  Fansly)     ││  教程站点)   ││ 图片内嵌[🛒Get This Setup]
 └──────────────┘└──────────────┘└────────────────────────┘
```

---

## 2. 核心技术栈选型（Serverless 极客架构）

为保证极致的加载速度、接近零的冷启动成本、以及完美的 **多账号绝对防关联**，拒绝使用传统独立 VPS 服务器，采用以下架构：

| 组件 | 选型 | 说明 |
|------|------|------|
| 前端全栈框架 | **Next.js (App Router)** | 毫秒级多端响应，支持增量静态生成（ISR） |
| 媒体资产托管 | **Cloudflare R2** | 0 出网流量费，对抗海量刷图流量 |
| 实时图片处理 | **Cloudflare Images** | 3MB 原图压缩为 100–150KB WebP/AVIF |
| 全栈托管平台 | **Cloudflare Pages** 或 Vercel | 全球边缘网络，自动 DDoS 防御 |
| 轻量级数据库 | **Supabase (PostgreSQL)** | JSONB 存储图集坐标与关联商品属性 |

---

## 3. 页面结构与黄金 4 屏排版规范（移动端优先）

页面整体采用 **非对称卡片流（Asymmetric Card Flow）**。移动端自动降级为流畅的垂直瀑布流（不超过 4 屏），PC 端展开为极具张力的漫画分镜网格。

### 设计 Token

| Token | 值 | 用途 |
|-------|-----|------|
| 主黄 | `#FFCC00` | Header、Gear Shop 横幅 |
| 主紫 | `#D600FF` | Header 撞色 |
| 荧光绿 | `#00FFCC` | 硬阴影、商品锚点 |
| 边框 | `4px solid #000` | 卡片粗边框 |
| 硬阴影 | `8px 8px 0px #00FFCC` | JOJO 风格投影 |

### 移动端 4 屏内容布局

#### 第 1 屏：The Hero Screen（身份与冲动付费）

- **元素**：巨型 JOJO 撞色字体 Header（`#FFCC00` × `#D600FF`）+ 个人高质感头像 + 【付费订阅站（Fansly/OnlyFans）】置顶大卡片
- **逻辑**：截流冲动型高意愿粉丝，缩短变现路径

#### 第 2 屏：The Visual Hub（欲望催化剂 - 无限流图集前菜）

- **元素**：2×3 紧凑黑粗框网格。前 2 张为 Free Look（高清大片）；后 4 张采用 Tailwind `blur-md` 叠加荧光色 🔒 锁头图标
- **逻辑**：吊足胃口。点击模糊卡片不跳转页面，而是弹出漫画对白框提示去 Fansly 解锁

#### 第 3 屏：The Kink Academy（硬核理智型留存）

- **元素**：【BDSM 教程站】专属分镜卡片。深炭黑/暗皮革背景质感，极简无衬线大字
- **逻辑**：转化深度同好，用高价值系统化知识锁定高净值用户

#### 第 4 屏：The Gear Shop（电商转化与无限延伸）

- **元素**：【成人用品商城】横幅。芥末黄底色 × 纯黑粗体字
- **逻辑**：情境带货。横幅下方挂载闪烁微动效按钮：`LOAD MORE UNCENSORED VISUALS 🔄`
- **核心机制**：默认页面至此结束（仅 4 屏，确保所有变现链接获得 100% 曝光）。点击按钮后，前端异步从 Supabase 拉取并渲染后续图集，满足重度刷图需求，同时保证首屏加载速度

---

## 4. 关键功能与技术细节设计

### ① 动态多账号防关联（URL 参数 / 子域名解析）

在不同平台、不同矩阵大号发帖时，统一挂载带参数的子域名链接（如 `alice.yourdomain.com?ref=ins_acc_01`）。

- 在 Cloudflare 后台开启泛域名解析（`*.yourdomain.com`）
- 前端 JS 自动拦截 URL 参数，对 Fansly、教程站、商城链接动态注入 `?utm_source=ins_acc_01` 等追踪参数
- **目的**：**一套核心代码，千人千面**。防范 Link Correlation 导致的矩阵账号连带封杀，并实现精准的全渠道转化漏斗追踪

### ② 图物联动（Image-Product Tagging）

Supabase 数据库存储结构：

```json
{
  "image_id": "img_bdsm_999",
  "r2_url": "/archive/heavy_kink_01.jpg",
  "is_locked": true,
  "associated_products": [
    {
      "product_id": "leather_whip_01",
      "name": "高级手工牛皮鞭",
      "price": "$49.99",
      "shop_url": "https://yourshop.com/product/whip",
      "position_x": "65%",
      "position_y": "40%"
    }
  ]
}
```

- **前端渲染**：图片 `relative` 定位，商品标签 `absolute` 按 `position_x/y` 百分比漂浮。点击弹出 JOJO 风格漫画对话气泡，点击 🛒 EQUIP NOW 带参数跳转完成带货

---

## 5. 项目落地执行步骤（Cursor 开发指南）

### 阶段一：视觉组件开发

> 请根据设计书中的【新野兽主义 JOJO 风格】规范，在骨架代码上补全排版。要求实现 4px 黑色粗边框、无模糊的硬阴影（如 `shadow-[8px_8px_0px_#00FFCC]`），并为 PC 端卡片设计 Hover 悬停动效（位移、色块反转、阴影加厚）。

### 阶段二：动态加载与图物联动开发

> 编写大图展示卡片，支持传入关联商品的 JSON 坐标数据。在图片对应坐标上渲染荧光绿向外圈扩散动画的锚点。编写「LOAD MORE」按钮，实现滚动或点击动态异步加载后续图片卡片，并引入虚拟列表（Virtual List）防止几万张图导致手机浏览器崩溃。

### 阶段三：管理后台工具开发

> 生成极简管理后台页面。支持 3MB 大图拖拽上传至 Cloudflare R2。上传成功后展示图片，并允许鼠标点击打点。点击任意位置弹出表单，输入关联的成人用品商城商品信息，将坐标与图片数据自动保存至 Supabase。

---

## 6. 推荐目录结构

```
app/
├── page.tsx                 # 4 屏主页面
├── layout.tsx
├── admin/
│   ├── upload/page.tsx
│   └── tag/[id]/page.tsx
└── api/
    ├── images/route.ts
    └── upload/route.ts
components/
├── screens/                 # Hero / VisualHub / KinkAcademy / GearShop
├── ProductTag.tsx
├── ComicDialog.tsx
└── VirtualGallery.tsx
hooks/
└── useRefTracker.ts
lib/
├── supabase.ts
├── r2.ts
└── ref-injector.ts
middleware.ts                # ref + 子域名解析
```
