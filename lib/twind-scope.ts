import install from '@twind/with-web-components'
import { defineConfig } from '@twind/core'
import presetAutoprefix from '@twind/preset-autoprefix'
import presetTailwind from '@twind/preset-tailwind'
import Alpine from 'alpinejs'
import ResizeManager from './resize-manager'
import { DataManager } from './data-manager'
import { AlpineIntegration } from './alpine-integration'
import {
  integrateStylesIntoShadowRoot,
  integrateScriptsIntoShadowRoot,
  integrateComponentScript,
} from './utils'
import type { TwindScopeProps, BreakpointType } from './types'

export class TwindScope extends install(
  defineConfig({
    presets: [presetAutoprefix(), presetTailwind()],
    ...(window.TwindScope?.config || {}),
  })
)(HTMLElement) {
  private props: TwindScopeProps = {}
  private alpineData: any = null

  // Static method to get responsive data (for Alpine.js access)
  static getResponsiveData(instanceId: string) {
    return DataManager.getResponsiveData(instanceId)
  }

  // Public method to update responsive data (for ResizeManager)
  updateResponsiveData(width: number, height: number): void {
    if (this.alpineData) {
      this.alpineData.windowWidth = width
      this.alpineData.windowHeight = height

      // Debug logging to help track updates
      console.debug('TwindScope: Updated responsive data', {
        instanceId: this.dataset.instanceId,
        width,
        height,
        isMobile: this.alpineData.isMobile,
        isTablet: this.alpineData.isTablet,
        isDesktop: this.alpineData.isDesktop,
      })
    }
  }

  // Static method to manually trigger cleanup
  static triggerCleanup() {
    DataManager.triggerCleanup()
  }

  // Static method to get current instances count
  static getInstancesInfo() {
    return DataManager.getInstancesInfo()
  }

  // Static method to force cleanup all instances
  static destroyAllInstances() {
    DataManager.destroyAllInstances()
  }

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })

    // Initialize global resources on first instance creation
    DataManager.initializeGlobalResources()

    this.integrateStyleAndScript()

    if (this.shadowRoot) {
      this.shadowRoot.innerHTML = this.innerHTML
      this.innerHTML = ''

      // setup alpine data of responsive hooks
      this.setupAlpineData({
        breakpoints: window.TwindScope?.config?.breakpoints,
      })

      Alpine.initTree(this.shadowRoot.firstElementChild as HTMLElement)
    }
  }

  connectedCallback(): void {
    super.connectedCallback()
    this.attachClassAndId()
    this.setupResizeListener()
  }

  disconnectedCallback(): void {
    this.shadowRoot &&
      Alpine.destroyTree(this.shadowRoot.firstElementChild as HTMLElement)

    // remove resize listener
    this.removeResizeListener()

    super.disconnectedCallback()
  }

  private setupAlpineData({
    breakpoints,
  }: {
    breakpoints: BreakpointType
  }): void {
    if (!this.shadowRoot?.firstElementChild) return

    const instanceId = this.getInstanceId()

    // Store instance reference in WeakMap for cleanup
    DataManager.setInstance(this, instanceId)

    // Setup Alpine data using the integration module
    this.alpineData = AlpineIntegration.setupAlpineData(
      this.shadowRoot,
      instanceId,
      breakpoints
    )
  }

  private setupResizeListener(): void {
    // Directly register instance to ResizeManager
    ResizeManager.getInstance().addInstance(this)
  }

  private removeResizeListener(): void {
    // Remove instance from ResizeManager
    ResizeManager.getInstance().removeInstance(this)

    // clean global data with better memory management
    const instanceId = DataManager.getInstance(this)
    if (instanceId) {
      // Remove from WeakMap
      DataManager.deleteInstance(this)

      // Remove from window
      DataManager.deleteResponsiveData(instanceId)

      // Clean up twindScopeDataStore
      this.cleanupTwindScopeDataStore()

      // Clear the alpineData reference to help GC
      if (this.alpineData) {
        this.alpineData = null
      }
    }
  }

  private cleanupTwindScopeDataStore(): void {
    if (this.shadowRoot?.firstElementChild) {
      const element = this.shadowRoot.firstElementChild as HTMLElement
      AlpineIntegration.cleanupTwindScopeDataStore(element)
    }
  }

  private getInstanceId(): string {
    if (!this.dataset.instanceId) {
      this.dataset.instanceId = Math.random().toString(36).substr(2, 9)
    }
    return this.dataset.instanceId
  }

  private attachClassAndId() {
    if (this.shadowRoot) {
      try {
        this.props = JSON.parse(this.dataset.props ?? '{}') || {}
      } catch (e) {
        console.error(e)
      }

      const firstElement = this.shadowRoot.firstElementChild as HTMLElement
      if (firstElement) {
        if ('type' in this.props) {
          const typeArray = this.props['type']?.split(' ') || []
          typeArray.forEach((type) => {
            type && firstElement.classList.add(type)
          })
        }

        if ('id' in this.props && this.props.id !== '') {
          firstElement.id = String(this.props.id)
        }
      }
    }
  }

  private integrateStyleAndScript() {
    if (!this.shadowRoot) return

    // Handle component-specific scripts from dataset.props
    try {
      const propsData = JSON.parse(this.dataset.props ?? '{}') || {}
      if (propsData.script) {
        integrateComponentScript(this.shadowRoot, propsData.script)
      }
    } catch (e) {
      console.error('Failed to parse component script:', e)
    }

    // Integrate global styles and scripts
    integrateStylesIntoShadowRoot(this.shadowRoot)
    integrateScriptsIntoShadowRoot(this.shadowRoot)
  }
}
