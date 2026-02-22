import { Database } from 'bun:sqlite'

// 数据库文件路径
const DB_PATH = process.env.DB_PATH || './data/zy-api.db'

let db: Database | null = null

/**
 * 获取数据库实例（单例模式）
 */
export const getDb = (): Database => {
  if (!db) {
    // 确保数据目录存在
    const fs = require('fs')
    const path = require('path')
    const dbDir = path.dirname(DB_PATH)

    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true })
    }

    db = new Database(DB_PATH)
    db.exec('PRAGMA journal_mode = WAL')
    db.exec('PRAGMA foreign_keys = ON')
  }
  return db
}

/**
 * 初始化数据库表结构
 */
export const initDb = (): void => {
  const database = getDb()

  // 创建 api_sources 表
  database.exec(`
    CREATE TABLE IF NOT EXISTS api_sources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      url TEXT NOT NULL,
      is_enabled INTEGER DEFAULT 1,
      is_default INTEGER DEFAULT 0,
      timeout INTEGER DEFAULT 10000,
      remark TEXT,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    );

    CREATE INDEX IF NOT EXISTS idx_api_sources_name ON api_sources(name);
    CREATE INDEX IF NOT EXISTS idx_api_sources_enabled ON api_sources(is_enabled);
  `)

  // 插入默认数据（如果表为空）
  const count = database.query('SELECT COUNT(*) as count FROM api_sources').get() as { count: number }
  if (count.count === 0) {
    const now = Math.floor(Date.now() / 1000)
    database.exec(`
      INSERT INTO api_sources (name, url, is_enabled, is_default, timeout, remark, created_at, updated_at) VALUES
        ('bfzy', 'https://bfzyapi.com/api.php/provide/vod/', 1, 1, 10000, '暴风资源', ${now}, ${now}),
        ('ffzy', 'https://api.ffzyapi.com/api.php/provide/vod/at/json/', 1, 0, 10000, '非凡资源', ${now}, ${now}),
        ('lzi', 'https://cj.lziapi.com/api.php/provide/vod/at/json/', 1, 0, 10000, '量子资源', ${now}, ${now});
    `)
  }
}

/**
 * API 源类型定义
 */
export interface ApiSource {
  id: number
  name: string
  url: string
  is_enabled: number
  is_default: number
  timeout: number
  remark: string | null
  created_at: number
  updated_at: number
}

/**
 * 创建 API 源
 */
export const createApiSource = (name: string, url: string, timeout: number = 10000, remark: string = ''): ApiSource => {
  const database = getDb()
  const now = Math.floor(Date.now() / 1000)

  const stmt = database.prepare(`
    INSERT INTO api_sources (name, url, is_enabled, is_default, timeout, remark, created_at, updated_at)
    VALUES (?, ?, 1, 0, ?, ?, ?, ?)
  `)

  stmt.run(name, url, timeout, remark, now, now)

  const inserted = database.query('SELECT * FROM api_sources WHERE id = last_insert_rowid()').get() as ApiSource
  return inserted
}

/**
 * 获取所有 API 源
 */
export const getAllApiSources = (): ApiSource[] => {
  const database = getDb()
  return database.query('SELECT * FROM api_sources ORDER BY id').all() as ApiSource[]
}

/**
 * 获取启用的 API 源
 */
export const getEnabledApiSources = (): ApiSource[] => {
  const database = getDb()
  return database.query('SELECT * FROM api_sources WHERE is_enabled = 1 ORDER BY id').all() as ApiSource[]
}

/**
 * 根据 name 获取 API 源
 */
export const getApiSourceByName = (name: string): ApiSource | null => {
  const database = getDb()
  const result = database.query('SELECT * FROM api_sources WHERE name = ?').get(name) as ApiSource | undefined
  return result || null
}

/**
 * 获取默认 API 源
 */
export const getDefaultApiSource = (): ApiSource | null => {
  const database = getDb()
  const result = database.query('SELECT * FROM api_sources WHERE is_default = 1 AND is_enabled = 1 LIMIT 1').get() as ApiSource | undefined
  return result || null
}

/**
 * 更新 API 源
 */
export const updateApiSource = (id: number, updates: Partial<Omit<ApiSource, 'id' | 'created_at'>>): boolean => {
  const database = getDb()
  const now = Math.floor(Date.now() / 1000)

  const fields: string[] = []
  const values: any[] = []

  if (updates.name !== undefined) {
    fields.push('name = ?')
    values.push(updates.name)
  }
  if (updates.url !== undefined) {
    fields.push('url = ?')
    values.push(updates.url)
  }
  if (updates.is_enabled !== undefined) {
    fields.push('is_enabled = ?')
    values.push(updates.is_enabled)
  }
  if (updates.is_default !== undefined) {
    // 如果设置为默认源，先取消其他默认源
    if (updates.is_default === 1) {
      database.exec('UPDATE api_sources SET is_default = 0 WHERE is_default = 1')
    }
    fields.push('is_default = ?')
    values.push(updates.is_default)
  }
  if (updates.timeout !== undefined) {
    fields.push('timeout = ?')
    values.push(updates.timeout)
  }
  if (updates.remark !== undefined) {
    fields.push('remark = ?')
    values.push(updates.remark)
  }

  if (fields.length === 0) {
    return false
  }

  fields.push('updated_at = ?')
  values.push(now)
  values.push(id)

  const stmt = database.prepare(`UPDATE api_sources SET ${fields.join(', ')} WHERE id = ?`)
  const result = stmt.run(...values)

  return result.changes > 0
}

/**
 * 删除 API 源
 */
export const deleteApiSource = (id: number): boolean => {
  const database = getDb()
  const stmt = database.prepare('DELETE FROM api_sources WHERE id = ?')
  const result = stmt.run(id)
  return result.changes > 0
}

/**
 * 关闭数据库连接
 */
export const closeDb = (): void => {
  if (db) {
    db.close()
    db = null
  }
}
