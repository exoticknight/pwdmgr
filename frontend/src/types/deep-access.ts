// 通用深度对象访问类型定义
// 这些类型可以在任何需要深度对象访问的场景中使用，不限于状态管理

// 递归类型：生成所有可能的嵌套路径（只包含字符串键）
export type DeepPaths<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? K | `${K}.${DeepPaths<T[K]>}`
          : K
        : never
    }[keyof T]
  : never

// 根据路径字符串获取对应的值类型
export type DeepValue<T, P extends string> = P extends keyof T
  ? T[P]
  : P extends `${infer K}.${infer Rest}`
    ? K extends keyof T
      ? DeepValue<T[K], Rest>
      : never
    : never
