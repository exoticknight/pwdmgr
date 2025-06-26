// 路由枚举 - 集中管理所有路由
export enum Routes {
  HOME = '',
  TABLE = 'table',
}

// 导航控制服务
class NavigationService {
  private allowNextNavigation = false
  private isInitialLoad = true

  // 检查是否允许导航
  canNavigate(): boolean {
    // 首次加载总是允许
    if (this.isInitialLoad) {
      this.isInitialLoad = false
      return true
    }

    // 如果有标记允许，就放行并清除标记
    if (this.allowNextNavigation) {
      this.allowNextNavigation = false
      return true
    }

    // 其他情况阻止
    return false
  }

  // 程序化导航 - 只能使用枚举值
  navigate(route: Routes): void {
    this.allowNextNavigation = true

    // 使用 history.pushState 和事件触发路由更新
    const path = route === Routes.HOME ? '/' : `/${route}`
    window.history.pushState({}, '', path)
    window.dispatchEvent(new PopStateEvent('popstate'))
  }
}

// 导出单例实例
export const navigationService = new NavigationService()
