// Generic deep object access type definitions
// These types can be used in any scenario requiring deep object access, not limited to state management

// Recursive type: generate all possible nested paths (string keys only)
export type DeepPaths<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? K | `${K}.${DeepPaths<T[K]>}`
          : K
        : never
    }[keyof T]
  : never

// Get value type based on path string
export type DeepValue<T, P extends string> = P extends keyof T
  ? T[P]
  : P extends `${infer K}.${infer Rest}`
    ? K extends keyof T
      ? DeepValue<T[K], Rest>
      : never
    : never
