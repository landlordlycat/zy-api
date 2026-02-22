# 暴风资源 API

基于 Elysia + Bun + SQLite 的视频资源聚合 API，支持多源切换和动态源管理。

## 🚀 功能特性

- ✅ 多 API 源支持（bfzy、ffzy、lzi）
- ✅ SQLite 数据库管理 API 源
- ✅ 动态添加/启用/禁用 API 源
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
# 数据库配置
DB_PATH=./data/zy-api.db

# API 管理密钥（用于 API 源管理接口鉴权）
API_ADMIN_KEY=admin123

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

### 6. API 源管理

所有管理接口都需要在请求头中添加鉴权信息：

```
Authorization: Bearer admin123
```

#### 6.1 获取所有 API 源

```
GET /sources
```

**响应示例：**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "bfzy",
      "url": "https://bfzyapi.com/api.php/provide/vod/",
      "is_enabled": 1,
      "is_default": 1,
      "timeout": 10000,
      "remark": "暴风资源",
      "created_at": 1234567890,
      "updated_at": 1234567890
    }
  ],
  "total": 1
}
```

#### 6.2 获取启用的 API 源

```
GET /sources/enabled
```

#### 6.3 获取默认 API 源

```
GET /sources/default
```

#### 6.4 根据名称获取 API 源

```
GET /sources/:name
```

**参数：**

- `name`: API 源名称（如 bfzy、ffzy、lzi）

#### 6.5 创建 API 源

```
POST /sources
Authorization: Bearer admin123
```

**请求体：**

```json
{
  "name": "newsource",
  "url": "https://newsource-api.com/api.php/provide/vod/",
  "timeout": 10000,
  "remark": "新资源"
}
```

**参数：**

- `name`: 源名称（必填，1-50 字符，唯一）
- `url`: API 地址（必填，有效的 URI）
- `timeout`: 超时时间（可选，1000-60000ms，默认 10000）
- `remark`: 备注（可选，最多 200 字符）

#### 6.6 更新 API 源

```
PUT /sources/:id
Authorization: Bearer admin123
```

**请求体：**

```json
{
  "name": "newsource",
  "url": "https://newsource-api.com/api.php/provide/vod/",
  "is_enabled": 1,
  "is_default": 0,
  "timeout": 10000,
  "remark": "新资源"
}
```

**参数：**

- `name`: 源名称（可选，1-50 字符）
- `url`: API 地址（可选，有效的 URI）
- `is_enabled`: 是否启用（可选，0 或 1）
- `is_default`: 是否为默认源（可选，0 或 1）
- `timeout`: 超时时间（可选，1000-60000ms）
- `remark`: 备注（可选，最多 200 字符）

#### 6.7 删除 API 源

```
DELETE /sources/:id
Authorization: Bearer admin123
```

## ➕ 添加新 API 源

现在无需修改代码，直接调用 API 接口即可添加新源：

```bash
# 创建新 API 源
curl -X POST http://localhost:3000/sources \
  -H "Authorization: Bearer admin123" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "newsource",
    "url": "https://newsource-api.com/api.php/provide/vod/",
    "timeout": 10000,
    "remark": "新资源"
  }'

# 设置为默认源
curl -X PUT http://localhost:3000/sources/1 \
  -H "Authorization: Bearer admin123" \
  -H "Content-Type: application/json" \
  -d '{"is_default": 1}'
```

**无需重启服务，立即生效！**

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

# 上传数据库文件（如果已有数据）
scp data/zy-api.db* root@your-server:/root/drama/data/
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
│   │   └── index.ts     # 服务器配置、数据库源加载
│   ├── db/              # 数据库
│   │   └── index.ts     # SQLite 数据库初始化和 CRUD 操作
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
│   │   ├── hot.ts       # 热门
│   │   └── sources.ts   # API 源管理
│   ├── types/           # 类型定义
│   │   └── index.ts
│   ├── utils/           # 工具函数
│   │   ├── apiClient.ts # API 客户端
│   │   ├── dataTransform.ts # 数据转换
│   │   ├── errorHandler.ts # 错误处理
│   │   └── parsePlayUrl.ts # 解析播放地址
│   └── index.ts         # 入口文件
├── data/                # 数据库文件目录
│   ├── zy-api.db        # SQLite 数据库文件
│   ├── zy-api.db-shm    # 共享内存文件
│   └── zy-api.db-wal    # 写前日志文件
├── public/              # 静态文件
│   └── favicon.ico
├── dist/                # 编译输出目录
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
