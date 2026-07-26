# Kink Academy 模块外链对照表（第三屏）

第三屏 20 条模块均可点击跳转。每条可配置**独立链接**；未配置的条目统一跳转到默认地址。

## 默认链接

| 场景 | URL |
|------|-----|
| 未单独配置的模块 | https://astroa.fun |

默认地址来自 `lib/config.ts` → `LINKS.academy`（环境变量 `NEXT_PUBLIC_ACADEMY_URL`）。

## 如何配置「一条目一链」

1. 在 **`lib/kink-academy-modules.ts`** 确认模块序号 `num`（如 `"01"`）与标题
2. 编辑 **`lib/kink-academy-links.ts`**，在 `KINK_ACADEMY_MODULE_LINKS` 中追加：

```ts
export const KINK_ACADEMY_MODULE_LINKS: Record<string, string> = {
  "01": "https://astroa.fun/products/first-time-kink",
  "05": "https://astroa.fun/products/pegging-starter",
};
```

3. **同步更新下方对照表**（本文件）
4. 保存后重新部署（或本地 `npm run dev` 刷新）

> 模块标题/描述在 `kink-academy-modules.ts` 维护；链接在本文件对应的 `kink-academy-links.ts` 维护，互不影响。

## 点击行为

| 区域 | 点击跳转 |
|------|----------|
| 列表中任一条模块 | `KINK_ACADEMY_MODULE_LINKS[num]` 或默认 astroa.fun |
| 底部「Enter The Academy →」 | `LINKS.academy`（与默认链接相同） |

外链会自动附带 ref 追踪，`utm_medium=academy`。

## 模块 ↔ 链接对照表

在 `lib/kink-academy-links.ts` 配置后，在此记录便于查阅：

| num | 标题（参考） | 跳转链接 | 备注 |
|-----|-------------|----------|------|
| _(暂无专属链接)_ | — | — | 全部走默认 astroa.fun |

### 填写示例

| num | 标题（参考） | 跳转链接 | 备注 |
|-----|-------------|----------|------|
| `01` | 100 First Time Kink Challenges | https://astroa.fun/products/... | 专属商品页 |
| `02` | 24 Bondage Tasks for Beginners | _(默认)_ | 未配置，点按走默认 |

完整 20 条标题见 `lib/kink-academy-modules.ts`。

## 相关文件

| 文件 | 作用 |
|------|------|
| `lib/kink-academy-links.ts` | **链接配置**（必改） |
| `lib/kink-academy-modules.ts` | 20 条标题 / 描述 |
| `docs/kink-academy-links.md` | 本对照文档 |
| `components/screens/KinkAcademy.tsx` | 第三屏 UI |
