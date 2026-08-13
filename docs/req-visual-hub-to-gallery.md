# 需求：第二屏改为 Gallery 角色列表

> 状态：**已实现**（首页第二屏复用角色瀑布，点击进 `/gallery/[setId]`）  
> 原则：**尽量小改动**页面路由与整体首页结构，只替换第二屏内容与点击行为。

---

## 1. 背景（现状）

首页四屏结构（`components/HomePage.tsx`）不变：

| 顺序 | 组件 | 说明 |
|------|------|------|
| 1 | `HeroScreen` | 首屏，不动 |
| 2 | `VisualHub` | 当前：Archive 精选图宫格 + 分页 + Free Look / 锁定格，点击多跳外链或 `/gallery` |
| 3 | `KinkAcademy` | 不动 |
| 4 | `GearShop` | 不动 |

独立页面（已存在，尽量复用）：

| 路由 | 内容 |
|------|------|
| `/gallery` | 角色集瀑布列表（`CharacterGalleryPage` → `CharacterWaterfall`） |
| `/gallery/[setId]` | 某角色 **5 张预览图** + 付费墙（`CharacterPreviewScroller`，`CHARACTER_SLOT_COUNT = 5`） |

---

## 2. 目标

1. **删掉第二屏现有内容**：去掉 Visual Hub 的精选分页宫格、Free Look / 锁图标、圆点分页、以及基于 Archive / `useFeaturedGallery` 的展示逻辑。
2. **第二屏改为与 `/gallery` 相同的内容与排版**：角色封面双列瀑布（名称条、竖版 9:16 卡片等），数据来自角色集 API（与 gallery 页一致）。
3. **点击某角色后直接进入 5 张预览页**：跳转 `/gallery/[setId]`，不再先经过「整页 gallery 再点一次」作为第二屏的主路径；也不再跳 Patreon / `VISUAL_HUB_IMAGE_LINKS` 等外链作为第二屏主行为。
4. **尽量小改**：不改首页路由 `/`、不拆四屏骨架、不新建平行路由；优先改 `VisualHub`（或薄封装复用现有 gallery 组件），能复用则复用。

---

## 3. 范围与非目标

### 做

- 替换第二屏 UI 与数据源为「角色集列表」。
- 卡片点击 → `/gallery/[setId]`（5 张预览 + paywall）。
- 在第二屏内保留合理的加载更多 / 无限滚动（与 gallery 行为对齐，可按屏高做轻量裁剪，但排版形式一致）。
- 第二屏仍挂在首页滚动流中（`id="visual-hub"` 可保留，避免锚点大面积失效）。

### 不做（本需求）

- 不改第一 / 三 / 四屏内容与外链逻辑。
- 不强制删除 `/gallery` 路由（仍可作为独立入口或返回页保留）。
- 不改 Admin 角色上传、存储、5 槽位模型。
- 不借机重构 `ScreenShell` / 全站导航 / Ref 体系（除非第二屏点击必须带现有追踪，则沿用现有方式，不做新体系）。

---

## 4. 交互说明

```
首页滚动 → 第二屏（角色封面双列列表，同 gallery 排版）
                ↓ 点击某一角色卡片
         /gallery/[setId]（竖滑 5 张预览 + 末页 Paywall）
```

- 列表封面、标题文案风格对齐 `CharacterWaterfall`（「View All Profiles」等可保留或按第二屏 `ScreenShell` 标签微调，以「看起来像 gallery」为准）。
- 预览页返回：可继续指向 `/gallery` 或 `/#visual-hub`；**优先选改动最小的现有 `backHref`**，若体验明显断裂再单开小改。

---

## 5. 建议实现方式（小改优先）

推荐顺序（改动由小到大）：

1. **首选**：在 `VisualHub.tsx` 内删除 Hub 分页 / `HubCell` / `useFeaturedGallery`，改为拉取 `/api/character-sets`，渲染逻辑直接复用或抽取 `CharacterWaterfall` / `CharacterCell`。
2. **避免**：新建第二套瀑布组件、改 `HomePage` 屏顺序、把 `/gallery` 嵌进 iframe、大改路由树。
3. **数据**：与 gallery 共用同一套 character-sets 接口与类型；若第二屏仍包在 `FeaturedGalleryProvider` 内且不再使用，可在实现时顺便从 `HomePage` 去掉该 Provider（属清理，非必须首 PR）。

涉及文件（预期触及，实现时以最小 diff 为准）：

| 文件 | 预期 |
|------|------|
| `components/screens/VisualHub.tsx` | 主改：换内容与点击 |
| `components/gallery/CharacterWaterfall.tsx` | 可选：抽出可复用列表，供第二屏与 `/gallery` 共用 |
| `components/HomePage.tsx` | 仅当可去掉无用 Provider 时微调 |
| `docs/visual-hub-links.md` / README 第二屏说明 | 实现后同步文档（外链表可能废弃或标注「第二屏不再使用」） |

---

## 6. 验收标准

- [x] 第二屏不再出现旧 Visual Hub 的 Free Look / 锁定格 / 多页圆点分页。
- [x] 第二屏视觉与信息结构与 `/gallery` 角色列表一致（双列竖版封面 + 角色名）。
- [x] 点击任一角色卡片，进入该角色的 **5 张预览**页（`/gallery/[setId]`），可继续滑到付费墙。
- [x] 首页仍为 Hero → 第二屏 → Academy → Gear 顺序；无需为完成本需求改动其它屏。
- [x] 无角色数据时有空态；加载中有与 gallery 类似的提示。
- [x] 改动集中、可回滚；不引入与本需求无关的样式/文案大重构。

### 实现备注

| 文件 | 变更 |
|------|------|
| `components/screens/VisualHub.tsx` | 黑底 ScreenShell + `CharacterWaterfall` + 无限滚动 |
| `hooks/useCharacterSetsFeed.tsx` | 新建：与 `/gallery` 共用角色集分页拉取 |
| `components/gallery/CharacterGalleryPage.tsx` | 改用同一 hook |
| `components/gallery/CharacterWaterfall.tsx` | 增加 `embedded`；卡片仍链到 `/gallery/[setId]` |

---

## 7. 开放问题（实现前可快速拍板）

1. 第二屏完全跟 `/gallery` 黑底  
   -外框/屏标签可保留以维持首页分区；**内容区排版跟 gallery**，颜色以「像 gallery」为准，避免大改壳子。
2. `/gallery` 独立页保留 
   - **建议**：保留；第二屏只是首页内嵌同款列表。
3. 旧 `VISUAL_HUB_IMAGE_LINKS` / Featured Hub API 不删除？  
   - **建议**：本需求以 UI 切换为准；死代码与文档可在同一小 PR 或紧随其后的清理 PR 处理。
