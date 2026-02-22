import type { VideoItem, RawVideoData, TypeItem, RawCategoryData } from '../types'

/**
 * 转换原始视频数据为视频项
 */
export function transformVideoItem(item: RawVideoData): VideoItem {
  return {
    id: item.vod_id,
    title: item.vod_name,
    typeId: item.type_id,
    typeName: item.type_name,
    time: item.vod_time,
    remarks: item.vod_remarks,
  }
}

/**
 * 批量转换视频数据
 */
export function transformVideoList(items: RawVideoData[], limit: number): VideoItem[] {
  return items.slice(0, limit).map(transformVideoItem)
}

/**
 * 批量转换视频数据（隐藏 list 中的 typeName）
 */
export function transformVideoListWithoutTypeName(items: RawVideoData[], limit: number): VideoItem[] {
  return items.slice(0, limit).map((item) => {
    const { typeName, ...rest } = transformVideoItem(item)
    return rest
  })
}

/**
 * 转换分类数据
 */
export function transformCategories(categories: RawCategoryData[]): TypeItem[] {
  const map = new Map<number, RawCategoryData & { children: RawCategoryData[] }>()

  // 初始化所有节点
  categories.forEach((item: RawCategoryData) => {
    map.set(item.type_id, { ...item, children: [] })
  })

  // 构建树形结构
  const roots = categories
    .filter((item: RawCategoryData) => item.type_pid === 0)
    .map((item: RawCategoryData) => {
      const node = map.get(item.type_id)
      if (!node) return null

      categories.forEach((child: RawCategoryData) => {
        if (child.type_pid === item.type_id) {
          node.children.push(map.get(child.type_id)!)
        }
      })

      return node
    })
    .filter(Boolean) as (RawCategoryData & { children: RawCategoryData[] })[]

  // 递归转换
  const transformItem = (item: RawCategoryData & { children?: any[] }): TypeItem => {
    const { type_id, type_name, children } = item
    const result: TypeItem = {
      id: type_id,
      typeName: type_name,
    }
    if (children && children.length > 0) {
      result.children = children.map(transformItem)
    }
    return result
  }

  return roots.map(transformItem)
}
