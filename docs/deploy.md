# The Stand Archive — 部署说明书

目标域名：**artslab.fun**  
运行时：**Cloudflare Workers**（OpenNext）  
数据：**Supabase**（元数据）+ **Cloudflare R2**（图片文件）

推荐流程：

```
本地准备 → 推送 GitHub → Cloudflare 连接仓库部署 → 绑定域名 → 上传内容验证
```

---

## 0. 架构一览

```
用户访问 https://artslab.fun
        │
        ▼
Cloudflare Workers（Next.js 站点）
        ├── Supabase  ← 图片/角色集元数据
        └── R2 bucket ← 实际图片文件（archive/ gear/ gallery/ My_AI_Output/）
```

| 服务 | 作用 | 是否进 GitHub |
|------|------|---------------|
| 代码仓库 | 页面、API、配置 | ✅ 是 |
| Supabase | 数据库表与记录 | ❌ 单独配置 |
| R2 | 图片文件 | ❌ 单独配置 |
| `env.local` 密钥 | Admin / DB / R2 密钥 | ❌ **绝不要提交** |

---

## 1. 本地准备（部署前必做）

### 1.1 安装依赖并验证构建

```powershell
cd d:\AUTOMAT\Xtiaozhuanye
npm install
npm run build
```

构建失败则不要继续部署。

### 1.2 配置本地环境变量

1. 复制 `.env.example` 的内容到 `env.local`（根目录已有可直接编辑）
2. 填入真实值
3. 同步给 Next.js：

```powershell
npm run env:sync
```

4. 本地启动验证：

```powershell
npm run dev
```

打开：http://localhost:3000

### 1.3 环境变量清单

**Secrets（敏感，Cloudflare 里选 Encrypt）：**

| 变量 | 说明 |
|------|------|
| `ADMIN_API_KEY` | 管理后台登录密钥 |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 服务端密钥 |
| `R2_ACCESS_KEY_ID` | R2 API Access Key |
| `R2_SECRET_ACCESS_KEY` | R2 API Secret |

**Plaintext（公开/半公开）：**

| 变量 | 说明 | artslab.fun 示例 |
|------|------|------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | — |
| `R2_ACCOUNT_ID` | Cloudflare Account ID | — |
| `R2_BUCKET_NAME` | R2 桶名 | `stand-archive` |
| `R2_PUBLIC_URL` | R2 公开访问前缀 | `https://pub-xxx.r2.dev` |
| `NEXT_PUBLIC_FANCLUB_URL` | Patreon 默认链接 | `https://patreon.com/AstraBloom` |
| `NEXT_PUBLIC_ACADEMY_URL` | Academy 默认链接 | `https://astroa.fun` |
| `NEXT_PUBLIC_SHOP_URL` | Shop 默认链接 | `https://shop.astroa.fun` |
| `ROOT_DOMAIN` | 主域名 | `artslab.fun` |
| `NEXT_PUBLIC_ROOT_DOMAIN` | 前端用主域名 | `artslab.fun` |
| `REF_SUBDOMAIN_MAP` | 子域名 ref 映射 JSON | `{"alice":"ins_acc_01"}` |

---

## 2. Supabase 数据库

打开 [Supabase Dashboard](https://supabase.com/dashboard) → 你的项目 → **SQL Editor**。

### 全新项目

执行整份：

```
supabase/schema.sql
```

### 已有项目（表已存在）

按顺序执行迁移：

1. `supabase/migrations/001_add_image_role.sql`
2. `supabase/migrations/002_gear_gallery_roles.sql`
3. `supabase/migrations/003_character_sets.sql` ← **角色画廊必需**

若漏跑 `003`，线上会出现：

```
Could not find the table 'public.character_sets' in the schema cache
```

---

## 3. Cloudflare R2

### 3.1 创建桶

1. Cloudflare Dashboard → **R2** → Create bucket  
2. 名称与 `R2_BUCKET_NAME` 一致（如 `stand-archive`）  
3. 开启公开访问 / 记下 **Public URL**，填入 `R2_PUBLIC_URL`

### 3.2 创建 API Token

R2 → Manage R2 API Tokens → Create  
权限：Object Read & Write（对应桶）  
得到 `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY`

### 3.3 配置 CORS（Admin 浏览器直传必需）

`scripts/r2-cors.json` 已包含：

- `http://localhost:3000`
- `https://artslab.fun`
- `https://www.artslab.fun`

执行：

```powershell
npx wrangler login
npm run r2:cors
```

上传时报 `Failed to fetch` / CORS → 多半是 CORS 未更新或线上域名未加入白名单。

---

## 4. 推送到 GitHub

### 4.1 确认密钥不会进仓库

`.gitignore` 已忽略：

- `env.local` / `.env.local`
- `node_modules/` / `.next/` / `.open-next/`
- `.wrangler/` / `img/`

执行 `git status` 时，**不能**出现 `env.local`。

### 4.2 首次提交并推送

```powershell
cd d:\AUTOMAT\Xtiaozhuanye

# 若尚未配置 Git 身份（仅首次）
git config --global user.email "你的GitHub邮箱"
git config --global user.name "你的GitHub用户名"

# 暂存并提交
git add .
git status
git commit -m "Initial commit: The Stand Archive bridge and gallery"

# 在 GitHub 新建空仓库（不要勾选 Add README），然后：
git remote add origin https://github.com/你的用户名/仓库名.git
git branch -M main
git push -u origin main
```

---

## 5. Cloudflare Workers 部署

### 方式 A：GitHub 自动部署（推荐）

1. 打开 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. **Workers & Pages** → **Create** → **Connect to Git**
3. 授权 GitHub，选择仓库，分支 `main`
4. 构建设置：

| 项 | 值 |
|----|-----|
| Root directory | `/` |
| Build command | `npm install && npx opennextjs-cloudflare build` |
| Deploy command | `npx wrangler deploy` |
| Node.js | **20** 或更高 |

若界面只有一条命令，可写成：

```bash
npm install && npx opennextjs-cloudflare build && npx wrangler deploy
```

5. **Settings → Variables**  
   把第 1.3 节全部变量配齐（Secrets 用 Encrypt）
6. 保存后触发 **Deploy**

之后：本地改代码 → `git push` → Cloudflare 自动构建部署。

### 方式 B：本地一键部署

适合临时发布：

```powershell
npx wrangler login
npm run deploy
```

仍需在 Cloudflare Dashboard 配置环境变量与自定义域名。

Worker 名称见 `wrangler.jsonc`：`the-stand-archive`。

---

## 6. 绑定域名 artslab.fun

1. Workers → `the-stand-archive` → **Settings** → **Domains & Routes**
2. Add Custom Domain：
   - `artslab.fun`
   - `www.artslab.fun`
3. 若启用子域名 ref 追踪，再加泛域名：

```
*.artslab.fun  →  指向同一 Worker
```

并确认：

```
ROOT_DOMAIN=artslab.fun
NEXT_PUBLIC_ROOT_DOMAIN=artslab.fun
```

---

## 7. 上线后：上传内容

图片**不在 GitHub**里，需在线上 Admin 上传。

打开：https://artslab.fun/admin  
用 `ADMIN_API_KEY` 登录。

| 内容 | 后台路径 | R2 路径 | 用途 |
|------|----------|---------|------|
| 归档图 | `/admin/upload` | `archive/` | 第 1、2 屏随机池 |
| Hero 头像 | `/admin/hero` | `avatars/` | 第 1 屏头像 |
| Gear 商品 | `/admin/upload/gear` | `gear/` | 第 4 屏（可增删改） |
| 图库打点 | `/admin/upload/gallery` | `gallery/` | 第 5 屏展开图库 |
| 角色集 | `/admin/characters` | `My_AI_Output/{角色}/01~05.webp` | `/gallery` |

角色图建议：**9:16 竖图**（如 1080×1920）。

---

## 8. 上线验证清单

- [ ] https://artslab.fun 首页四屏正常
- [ ] 第 2 屏点击跳转 `/gallery`
- [ ] https://artslab.fun/gallery 瀑布流有角色封面
- [ ] `/gallery/{角色}`：上下滑 5 张预览 + 第 6 张付费卡
- [ ] 付费卡 `UNLOCK NOW` 新开标签页跳 Patreon
- [ ] `/admin` 可登录、可上传
- [ ] `/admin/upload/gear` 可管理/删除商品
- [ ] `/admin/characters` 可管理角色集
- [ ] 图片无裂图、无 CORS 报错
- [ ] 手机竖屏布局正常
- [ ] 各屏 CTA 外链正确

---

## 9. 日常维护

| 你改了什么 | 怎么上线 |
|------------|----------|
| 页面/代码 | `git push`（或本地 `npm run deploy`） |
| 环境变量 | Cloudflare Variables 更新 → Redeploy |
| 图片/商品/角色数据 | 线上 `/admin` 操作，**无需重新部署** |
| 数据库表结构 | Supabase SQL Editor 跑迁移 |
| R2 CORS | 改 `scripts/r2-cors.json` → `npm run r2:cors` |

---

## 10. 常见问题

| 现象 | 原因 | 处理 |
|------|------|------|
| Build 失败 | 依赖/语法错误 | 本地先 `npm run build` |
| Admin `Invalid admin key` | 密钥不一致 | 核对 Cloudflare `ADMIN_API_KEY` |
| 上传 `Failed to fetch` | R2 CORS | `npm run r2:cors`，确认含 `artslab.fun` |
| `character_sets` 表不存在 | 未跑迁移 003 | 执行 `003_character_sets.sql` |
| 图片 404 / 裂图 | `R2_PUBLIC_URL` 错误或只删了 R2 文件 | 检查公开 URL；删图用 Admin Delete |
| 改了 env 线上无效 | Variables 未保存或未 Redeploy | 保存后重新部署 |
| Git 推送含密钥 | `env.local` 被提交 | 立刻改密钥并移出仓库 |

---

## 11. 关键命令速查

```powershell
# 本地
npm install
npm run env:sync
npm run dev
npm run build

# R2 CORS
npx wrangler login
npm run r2:cors

# 部署
npm run deploy          # 本地直部署
# 或 git push origin main  # GitHub → Cloudflare 自动部署
```

---

## 12. 推荐首次上线顺序（照着勾）

1. [ ] `npm run build` 本地通过  
2. [ ] Supabase 执行 schema / 迁移（含 `003`）  
3. [ ] R2 桶 + Public URL + API Token  
4. [ ] `npm run r2:cors`  
5. [ ] `env.local` 配齐，本地 `/admin` 能上传  
6. [ ] GitHub 推送（确认无 `env.local`）  
7. [ ] Cloudflare 连接仓库 + 填 Variables + Deploy  
8. [ ] 绑定 `artslab.fun` / `www.artslab.fun`  
9. [ ] 线上 Admin 上传内容  
10. [ ] 按第 8 节验证清单检查  

完成以上即可正式对外访问 **https://artslab.fun**。
