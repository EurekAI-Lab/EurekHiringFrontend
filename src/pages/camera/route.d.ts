// 声明 route 标签的类型定义，避免 WebStorm 报错
declare module '*.vue' {
  interface ComponentCustomProperties {
    $route: any
  }
}

// 声明 route 标签
declare global {
  namespace JSX {
    interface IntrinsicElements {
      route: any
    }
  }
}

export {}