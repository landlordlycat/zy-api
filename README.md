# 暴风资源 API

基于 Elysia + Bun 的视频资源聚合 API，支持多源切换。

## 🚀 功能特性

- ✅ 多 API 源支持（bfzy、ffzy、lzi）
- ✅ 自动切换 API 源
- ✅ 类型安全（TypeScript）
- ✅ 统一错误处理
- ✅ 请求限流
- ✅ CORS 支持
- ✅ OpenAPI 文档
- ✅ 深色主题

## 📦 安装

```bash
bun install
```

## 🔧 配置

复制环境变量示例：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
# API 源配置
API_BFZY=https://bfzyapi.com/api.php/provide/vod/
API_FFZY=https://api.ffzyapi.com/api.php/provide/vod/at/json/
API_LZI=https://cj.lziapi.com/api.php/provide/vod/at/json/

# 默认 API 源 (bfzy, ffzy, lzi)
API_DEFAULT_SOURCE=bfzy

# API 超时设置
API_TIMEOUT=10000

# 服务器配置
PORT=3000

# CORS 配置
CORS_ORIGIN=*

# 限流配置
RATE_LIMIT_DURATION=60000
RATE_LIMIT_MAX=100
```

## 🏃 运行

### 开发模式

```bash
bun run dev
```

### 生产模式

```bash
bun run build
bun dist/index.js
```

## 📖 API 文档

启动服务后访问：

- **本地**: http://localhost:3000/docs
- **生产**: https://api.bff.cc.cd/docs

## 🔌 API 接口

### 1. 获取视频列表

```
GET /list?page=1&limit=20&typeId=58&source=bfzy
```

**参数：**
- `page`: 页码（可选，默认 1）
- `limit`: 分页数量（可选，默认 20）
- `typeId`: 分类 ID（可选，默认 58）
- `source`: API 源（可选，默认 bfzy）

### 2. 获取分类列表

```
GET /types?source=bfzy
```

**参数：**
- `source`: API 源（可选，默认 bfzy）

### 3. 搜索视频

```
GET /search?wd=关键词&page=1&limit=20&source=bfzy
```

**参数：**
- `wd`: 搜索关键词（必填）
- `page`: 页码（可选，默认 1）
- `limit`: 分页数量（可选，默认 20）
- `source`: API 源（可选，默认 bfzy）

**注意：**
- 部分源（如 ffzy）可能会触发 WAF 验证
- 遇到验证码时，API 会自动切换到其他可用源
- 也可以手动切换源：`?source=lzi`

### 4. 获取视频详情

```
GET /detail/:id?source=bfzy
```

**参数：**
- `id`: 视频 ID（必填）
- `source`: API 源（可选，默认 bfzy）

### 5. 获取热门视频

```
GET /hot?typeId=58&page=1&limit=20&source=bfzy
```

**参数：**
- `typeId`: 分类 ID（可选，默认 58）
- `page`: 页码（可选，默认 1）
- `limit`: 分页数量（可选，默认 20）
- `source`: API 源（可选，默认 bfzy）

## ➕ 添加新 API 源

**只需修改 3 个地方：**

### 1. 修改 `src/config/index.ts`

在 `API_SOURCES` 对象中添加新源：

```typescript
export const API_SOURCES = {
  bfzy: getEnv('API_BFZY', 'https://bfzyapi.com/api.php/provide/vod/'),
  ffzy: getEnv('API_FFZY', 'https://api.ffzyapi.com/api.php/provide/vod/at/json/'),
  lzi: getEnv('API_LZI', 'https://cj.lziapi.com/api.php/provide/vod/at/json/'),
  
  // 添加新源
  newsource: getEnv('API_NEWSOURCE', 'https://newsource-api.com/api.php/provide/vod/'),
} as const
```

### 2. 修改 `src/types/index.ts`

在 `ApiSource` 类型中添加新源：

```typescript
export type ApiSource = 'bfzy' | 'ffzy' | 'lzi' | 'newsource'
```

### 3. 修改 `.env.example`

添加环境变量示例：

```env
API_NEWSOURCE=https://newsource-api.com/api.php/provide/vod/
```

**重启服务即可！**

```bash
bun run dev
```

## 📦 部署

### 构建项目

```bash
bun run build
```

### 上传到服务器

```bash
# 上传打包文件
scp dist/index.js root@your-server:/root/drama/

# 上传 public 目录
scp -r public/ root@your-server:/root/drama/

# 上传 .env 文件
scp .env root@your-server:/root/drama/
```

### 重启服务

```bash
ssh root@your-server
cd /root/drama
systemctl restart bfzy-api
```

## 🛠️ 项目结构

```
bfzy-api/
├── src/
│   ├── config/          # 配置文件
│   │   └── index.ts     # API 源、服务器配置
│   ├── plugin/          # 插件
│   │   ├── index.ts     # 插件统一导出
│   │   ├── openapi.ts   # OpenAPI 文档
│   │   ├── rateLimit.ts # 限流
│   │   ├── logger.ts    # 日志
│   │   ├── errorHandler.ts # 错误处理
│   │   ├── cors.ts      # CORS
│   │   └── static.ts    # 静态文件
│   ├── routes/          # 路由
│   │   ├── index.ts     # 路由统一导出
│   │   ├── list.ts      # 视频列表
│   │   ├── types.ts     # 分类列表
│   │   ├── search.ts    # 搜索
│   │   ├── detail.ts    # 详情
│   │   └── hot.ts       # 热门
│   ├── types/           # 类型定义
│   │   └── index.ts
│   ├── utils/           # 工具函数
│   │   ├── apiClient.ts # API 客户端
│   │   ├── dataTransform.ts # 数据转换
│   │   ├── errorHandler.ts # 错误处理
│   │   └── parsePlayUrl.ts # 解析播放地址
│   └── index.ts         # 入口文件
├── public/              # 静态文件
│   └── favicon.ico
├── .env.example         # 环境变量示例
├── .gitignore
├── bun.lock
├── package.json
├── tsconfig.json
└── README.md
```

## 📝 开发说明

### 添加新路由

1. 在 `src/routes/` 创建新文件
2. 导出路由实例
3. 在 `src/routes/index.ts` 导出
4. 在 `src/index.ts` 使用

### 添加新插件

1. 在 `src/plugin/` 创建新文件
2. 导出插件
3. 在 `src/plugin/index.ts` 导出
4. 在 `src/index.ts` 使用

## 📄 许可证

ISC

## 👤 作者

biscuit

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！