export default class ResizeManager {
  private static instance: ResizeManager
  private instances: Set<any> = new Set() // 直接管理实例
  private isListening = false

  static getInstance(): ResizeManager {
    if (!ResizeManager.instance) {
      ResizeManager.instance = new ResizeManager()
    }
    return ResizeManager.instance
  }

  addInstance(instance: any): void {
    this.instances.add(instance)

    if (!this.isListening) {
      this.startListening()
    }

    // 立即更新实例数据
    this.updateInstance(instance, window.innerWidth, window.innerHeight)
  }

  removeInstance(instance: any): void {
    this.instances.delete(instance)

    if (this.instances.size === 0 && this.isListening) {
      this.stopListening()
    }
  }

  private startListening(): void {
    if (this.isListening) return

    this.isListening = true
    window.addEventListener('resize', this.handleResize)
  }

  private stopListening(): void {
    if (!this.isListening) return

    this.isListening = false
    window.removeEventListener('resize', this.handleResize)
  }

  private handleResize = (): void => {
    const width = window.innerWidth
    const height = window.innerHeight

    // 直接更新所有实例，只有一个循环
    this.instances.forEach((instance) => {
      try {
        this.updateInstance(instance, width, height)
      } catch (error) {
        console.error('Error updating instance:', error)
      }
    })
  }

  private updateInstance(instance: any, width: number, height: number): void {
    if (
      instance.updateResponsiveData &&
      typeof instance.updateResponsiveData === 'function'
    ) {
      instance.updateResponsiveData(width, height)
    } else {
      console.warn(
        'ResizeManager: updateResponsiveData method not found on instance'
      )
    }
  }
}
