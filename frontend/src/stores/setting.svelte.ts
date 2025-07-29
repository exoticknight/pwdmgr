import type { DeepPaths, DeepValue } from '@/types/deep-access'
import type { Setting } from '@/types/setting'
import { DEFAULT_SETTINGS } from '@/consts/setting'

// 设置状态接口
interface SettingState {
  data: Setting
  initialized: boolean
}

// 设置存储类 - 直接实现，不依赖通用基类
class SettingStore {
  private state = $state<SettingState>({
    data: DEFAULT_SETTINGS,
    initialized: false,
  })

  // 响应式 getter - 返回当前数据
  get data(): Setting {
    return this.state.data
  }

  // 检查是否已初始化
  get initialized(): boolean {
    return this.state.initialized
  }

  // 初始化设置 - 支持传入部分设置进行合并
  initialize(settings?: Partial<Setting>): void {
    if (settings) {
      // 深度合并设置，确保所有默认值都存在
      this.state.data = this.deepMerge(DEFAULT_SETTINGS, settings)
    }
    else {
      // 使用默认设置
      this.state.data = DEFAULT_SETTINGS
    }
    this.state.initialized = true
  }

  // 获取设置 - 支持顶级键
  getSetting<K extends keyof Setting>(key: K): Setting[K]
  // 获取设置 - 使用类型安全的字符串路径
  getSetting<P extends DeepPaths<Setting>>(path: P): DeepValue<Setting, P>
  // 获取设置 - 提供默认值
  getSetting<R>(path: string, defaultValue: R): R
  getSetting(keyOrPath: unknown, defaultValue?: unknown): unknown {
    if (!this.state.initialized) {
      return defaultValue
    }

    const pathStr = String(keyOrPath)
    if (pathStr.includes('.')) {
      // 处理嵌套路径
      return this.getNestedValue(this.state.data, pathStr, defaultValue)
    }
    else {
      // 处理顶级属性
      const typedData = this.state.data as unknown as Record<string, unknown>
      const value = typedData[pathStr]
      return value !== undefined ? value : defaultValue
    }
  }

  // 更新设置 - 支持顶级键
  updateSetting<K extends keyof Setting>(key: K, value: Setting[K]): void
  // 更新设置 - 使用类型安全的字符串路径
  updateSetting<P extends DeepPaths<Setting>>(path: P, value: DeepValue<Setting, P>): void
  updateSetting(keyOrPath: unknown, value: unknown): void {
    if (!this.state.initialized) {
      throw new Error('Setting store not initialized')
    }

    const pathStr = String(keyOrPath)
    if (pathStr.includes('.')) {
      // 处理嵌套路径
      this.setNestedValue(this.state.data, pathStr, value)
    }
    else {
      // 处理顶级属性
      const typedData = this.state.data as unknown as Record<string, unknown>
      typedData[pathStr] = value
    }
  }

  // 批量更新设置
  updateSettings(updates: Partial<Setting>): void {
    if (!this.state.initialized) {
      throw new Error('Setting store not initialized')
    }

    this.state.data = this.deepMerge(this.state.data, updates)
  }

  // 重置设置
  reset(): void {
    this.state.data = DEFAULT_SETTINGS
    this.state.initialized = false
  }

  // 导出设置（用于持久化）
  export(): Readonly<Setting> {
    if (!this.state.initialized) {
      throw new Error('Setting store not initialized')
    }

    return $state.snapshot(this.state.data) as Readonly<Setting>
  }

  // 私有方法：深度合并对象
  private deepMerge<A, B>(target: A, source: B): A & B {
    const result = { ...target } as Record<string, unknown>

    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        const sourceValue = source[key]
        const targetValue = result[key]

        if (
          sourceValue !== null
          && typeof sourceValue === 'object'
          && !Array.isArray(sourceValue)
          && targetValue !== null
          && typeof targetValue === 'object'
          && !Array.isArray(targetValue)
        ) {
          // 递归合并嵌套对象
          result[key] = this.deepMerge(targetValue, sourceValue)
        }
        else {
          // 直接赋值
          result[key] = sourceValue
        }
      }
    }

    return result as A & B
  }

  // 私有方法：设置嵌套值
  private setNestedValue(obj: unknown, path: string, value: unknown): void {
    const keys = path.split('.')
    let current = obj as Record<string, unknown>

    // 遍历到最后一级的父对象
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]
      if (!(key in current) || typeof current[key] !== 'object' || current[key] === null) {
        current[key] = {}
      }
      current = current[key] as Record<string, unknown>
    }

    // 设置最终值
    const lastKey = keys[keys.length - 1]
    if (lastKey) {
      current[lastKey] = value
    }
  }

  // 私有方法：获取嵌套值
  private getNestedValue(obj: unknown, path: string, defaultValue?: unknown): unknown {
    const keys = path.split('.')
    let current = obj

    for (const key of keys) {
      if (current == null || typeof current !== 'object' || !(key in current)) {
        return defaultValue
      }
      current = (current as Record<string, unknown>)[key]
    }

    return current !== undefined ? current : defaultValue
  }
}

// 创建单例实例
const setting = new SettingStore()

// 导出实例和类型
export { setting, SettingStore }
export type { SettingState }
