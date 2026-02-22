// API 响应基础类型
export interface ApiResponse<T = any> {
  error?: string
  data?: T
}

// API 源类型
// ⚠️ 重要：添加新 API 源时，请在 src/config/index.ts 的 API_SOURCES 中添加
export type ApiSource = 'bfzy' | 'ffzy' | 'lzi'

// 视频列表响应
export interface VideoListResponse {
  page: number
  pageCount: number
  total: number
  typeName: string
  list: VideoItem[]
}

// 视频项
export interface VideoItem {
  id: number
  title: string
  typeId: number
  typeName?: string
  time: string
  remarks: string
}

// 原始 API 视频数据
export interface RawVideoData {
  vod_id: number
  vod_name: string
  vod_en: string
  vod_play_from: string
  vod_play_url: string
  type_id: number
  type_name: string
  vod_time: string
  vod_remarks: string
  vod_content: string
  vod_actor: string
  vod_director: string
  vod_total: number
  vod_area: string
  vod_year: string
  vod_lang: string
  vod_pic: string
  vod_class: string
  vod_status: string
  vod_douban_id: string
  vod_douban_score: number
}

// 原始 API 分类数据
export interface RawCategoryData {
  type_id: number
  type_pid: number
  type_name: string
}

// 分类响应
export interface TypesResponse {
  total: number
  types: TypeItem[]
}

// 分类项
export interface TypeItem {
  id: number
  typeName: string
  children?: TypeItem[]
}

// 视频详情响应
export interface VideoDetailResponse {
  id: number
  introduction: string
  actors: string
  director: string
  total: number
  area: string
  year: string
  language: string
  cover: string
  typeId: number
  typeName: string
  title: string
  status: string
  remarks: string
  doubanUrl: string
  doubanScore: number
  time: string
  episodes: Episode[]
}

// 剧集
export interface Episode {
  name: string
  url: string
}
