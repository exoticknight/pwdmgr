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

  // 程序化导航
  navigate(path: string): void {
    this.allowNextNavigation = true
    // 使用原生方式导航
    if (path === '/table') {
      window.location.hash = '#table'
    }
    else {
      window.location.hash = '#'
    }
  }
}

// 导出单例实例
export const navigationService = new NavigationService()
