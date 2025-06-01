import install from '@twind/with-web-components'
import { defineConfig } from '@twind/core'
import presetAutoprefix from '@twind/preset-autoprefix'
import presetTailwind from '@twind/preset-tailwind'
import Alpine from 'alpinejs'
import ResizeManager from './resizeManger'

declare global {
  interface Window {
    TwindScope: any
    twindConfig: any
    Alpine: any
    twindScopeDataStore?: any
  }
}

type StyleType = 'url' | 'inlineStyle'
type ScriptType = 'url' | 'inlineScript'
;(function (win) {
  const stylesList: Array<{ str: string; type: StyleType }> = []
  const scriptsList: Array<{ str: string; type: ScriptType }> = []

  initStyleAndScript(win.TwindScope?.style || [], win.TwindScope?.script || [])

  function initStyleAndScript(styleList: string[], scriptList: string[]) {
    styleList.forEach((str) => {
      let type = 'inlineStyle'
      if (/^https?:\/\//.test(str)) type = 'url'

      stylesList.push({
        type: type as 'url' | 'inlineStyle',
        str,
      })
    })

    scriptList.forEach((str) => {
      let type = 'inlineScript'
      if (/^https?:\/\//.test(str)) type = 'url'

      scriptsList.push({
        type: type as 'url' | 'inlineScript',
        str,
      })
    })
  }

  const withTwind = install(
    defineConfig({
      presets: [presetAutoprefix(), presetTailwind()],
      ...(win.TwindScope?.config || {}),
    })
  )

  class TwindScope extends withTwind(HTMLElement) {
    private props: { type: string; id: string } | {} = {}
    private alpineData: any = null

    // Static properties for data management
    private static instances = new WeakMap<HTMLElement, string>()
    private static responsiveDataMap = new Map<string, any>()
    private static cleanupTimer?: any
    private static unloadListenerAdded = false

    // Static method to get responsive data (for Alpine.js access)
    static getResponsiveData(instanceId: string) {
      return TwindScope.responsiveDataMap.get(instanceId)
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

    // Static method to initialize global resources
    static initializeGlobalResources() {
      // Ensure only one cleanup timer exists globally
      if (!TwindScope.cleanupTimer) {
        TwindScope.cleanupTimer = setInterval(
          TwindScope.cleanupOrphanedData,
          30000
        )
      }

      // Add page unload cleanup (only once)
      if (!TwindScope.unloadListenerAdded) {
        win.addEventListener('beforeunload', TwindScope.handlePageUnload)
        TwindScope.unloadListenerAdded = true
      }
    }

    // Static method for cleaning up orphaned data
    static cleanupOrphanedData() {
      const existingIds = Array.from(TwindScope.responsiveDataMap.keys())

      existingIds.forEach((instanceId) => {
        const element = document.querySelector(
          `[data-instance-id="${instanceId}"]`
        )
        if (!element) {
          TwindScope.responsiveDataMap.delete(instanceId)
        }
      })
    }

    // Static method for page unload cleanup
    static handlePageUnload() {
      // Clear the cleanup timer
      if (TwindScope.cleanupTimer) {
        clearInterval(TwindScope.cleanupTimer)
        TwindScope.cleanupTimer = undefined
      }

      // Clear all data
      TwindScope.responsiveDataMap.clear()
    }

    // Static method to manually trigger cleanup
    static triggerCleanup() {
      TwindScope.cleanupOrphanedData()
    }

    // Static method to get current instances count
    static getInstancesInfo() {
      const instanceIds = Array.from(TwindScope.responsiveDataMap.keys())

      return {
        totalInstances: instanceIds.length,
        instanceIds: instanceIds,
        hasCleanupTimer: !!TwindScope.cleanupTimer,
      }
    }

    // Static method to force cleanup all instances
    static destroyAllInstances() {
      // Stop cleanup timer
      if (TwindScope.cleanupTimer) {
        clearInterval(TwindScope.cleanupTimer)
        TwindScope.cleanupTimer = undefined
      }

      // Clear all data
      TwindScope.responsiveDataMap.clear()
      TwindScope.instances = new WeakMap()
    }

    constructor() {
      super()
      this.attachShadow({ mode: 'open' })

      // Initialize global resources on first instance creation
      TwindScope.initializeGlobalResources()

      this.integrateStyleAndScript()

      if (this.shadowRoot) {
        this.shadowRoot.innerHTML = this.innerHTML
        this.innerHTML = ''

        // setup alpine data of responsive hooks
        this.setupAlpineData()

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

    private setupAlpineData(): void {
      if (!this.shadowRoot?.firstElementChild) return

      const element = this.shadowRoot.firstElementChild as HTMLElement

      // add alpine data of responsive hooks with reactive properties
      this.alpineData = Alpine.reactive({
        windowWidth: win.innerWidth,
        windowHeight: win.innerHeight,
        // responsive breakpoint detection - using getter functions to ensure reactivity
        get isMobile() {
          return this.windowWidth < 768
        },
        get isTablet() {
          return this.windowWidth >= 768 && this.windowWidth < 1280
        },
        get isDesktop() {
          return this.windowWidth >= 1280
        },
      })

      // store data to global with better memory management
      const instanceId = this.getInstanceId()

      // Store instance reference in WeakMap for cleanup
      TwindScope.instances.set(this, instanceId)

      // Store in responsiveDataMap
      TwindScope.responsiveDataMap.set(instanceId, this.alpineData)

      // Check if element already has x-data attribute
      const existingXData = element.getAttribute('x-data')
      if (existingXData) {
        // For existing x-data, merge with our responsive data
        this.mergeWithExistingData(element, existingXData)
      } else {
        // No existing x-data, directly use Alpine's programmatic data setting
        this.setElementData(element, this.alpineData)
      }
    }

    private mergeWithExistingData(element: HTMLElement, existingXData: string) {
      try {
        const trimmedData = existingXData.trim()
        const dataType = this.detectXDataType(trimmedData)

        if (dataType === 'function') {
          // For function-based x-data, execute it and merge with responsive data
          const originalFunc = new Function('return ' + existingXData)()
          const originalData =
            typeof originalFunc === 'function' ? originalFunc() : originalFunc

          // Instead of recreating alpineData, merge user properties into existing reactive object
          Object.keys(originalData).forEach((key) => {
            if (!(key in this.alpineData)) {
              const descriptor = Object.getOwnPropertyDescriptor(
                originalData,
                key
              )
              if (descriptor) {
                Object.defineProperty(this.alpineData, key, descriptor)
              } else {
                this.alpineData[key] = originalData[key]
              }
            }
          })

          this.setElementData(element, this.alpineData)
        } else {
          // For object or expression-based x-data, use the original logic
          const staticData = new Function('return ' + existingXData)()

          Object.keys(staticData).forEach((key) => {
            if (!(key in this.alpineData)) {
              const descriptor = Object.getOwnPropertyDescriptor(
                staticData,
                key
              )
              if (descriptor) {
                Object.defineProperty(this.alpineData, key, descriptor)
              } else {
                this.alpineData[key] = staticData[key]
              }
            }
          })

          this.setElementData(element, this.alpineData)
        }
      } catch (e) {
        console.error('Failed to merge x-data:', e)
        // Fallback: just use responsive data
        this.setElementData(element, this.alpineData)
      }
    }

    private setElementData(element: HTMLElement, data: any) {
      // For Shadow DOM environments, we need to ensure Alpine can access the data
      // We'll use both the internal property and the x-data attribute approach

      // Method 1: Set the internal Alpine property
      Object.defineProperty(element, '__x_data', {
        value: () => data,
        writable: true,
        configurable: true,
      })

      // Method 2: Also store a reference that can be accessed via x-data
      // Create a unique identifier for this data
      const dataKey =
        'twindScopeData_' + Math.random().toString(36).substr(2, 9)

      // Store the data in a way that can be accessed from x-data
      if (!win.twindScopeDataStore) {
        win.twindScopeDataStore = {}
      }
      win.twindScopeDataStore[dataKey] = data

      // Set x-data to access the stored data
      element.setAttribute('x-data', `window.twindScopeDataStore['${dataKey}']`)
    }

    private detectXDataType(
      trimmedData: string
    ): 'function' | 'object' | 'expression' {
      // Check if it's a function (arrow function or regular function)
      const isFunctionData =
        trimmedData.startsWith('(') ||
        trimmedData.startsWith('function') ||
        /^\s*\(\s*\)\s*=>/.test(trimmedData) ||
        /^\s*\w+\s*\(\s*\)\s*{/.test(trimmedData)

      if (isFunctionData) {
        return 'function'
      }

      // Check if it's a simple object literal
      if (trimmedData.startsWith('{') && trimmedData.endsWith('}')) {
        return 'object'
      }

      return 'expression'
    }

    private setupResizeListener(): void {
      // 直接注册实例到 ResizeManager
      ResizeManager.getInstance().addInstance(this)
    }

    private removeResizeListener(): void {
      // 从 ResizeManager 移除实例
      ResizeManager.getInstance().removeInstance(this)

      // clean global data with better memory management
      const instanceId = TwindScope.instances.get(this)
      if (instanceId) {
        // Remove from WeakMap
        TwindScope.instances.delete(this)

        // Remove from window
        TwindScope.responsiveDataMap.delete(instanceId)

        // Clear the alpineData reference to help GC
        if (this.alpineData) {
          this.alpineData = null
        }
      }
    }

    private getInstanceId(): string {
      if (!this.dataset.instanceId) {
        this.dataset.instanceId = Math.random().toString(36).substr(2, 9)
      }
      return this.dataset.instanceId
    }

    attachClassAndId() {
      if (this.shadowRoot) {
        try {
          this.props = JSON.parse(this.dataset.props ?? '{}') || {}
        } catch (e) {
          console.error(e)
        }

        const firstElement = this.shadowRoot.firstElementChild as HTMLElement
        if (firstElement) {
          'type' in this.props && firstElement.classList.add(this.props.type)
          'id' in this.props &&
            (firstElement.id = this.props.type + '-' + this.props.id)
        }
      }
    }

    integrateStyleAndScript() {
      // Handle component-specific scripts from dataset.props
      if (this.shadowRoot) {
        try {
          const propsData = JSON.parse(this.dataset.props ?? '{}') || {}
          if (propsData.script) {
            const scriptElement = document.createElement('script')
            scriptElement.textContent = propsData.script
            this.shadowRoot.appendChild(scriptElement)
          }
        } catch (e) {
          console.error('Failed to parse component script:', e)
        }
      }

      if (stylesList.length > 0) {
        stylesList.forEach((style) => {
          if (!this.shadowRoot) return

          if (style.type === 'inlineStyle') {
            const sheet = new CSSStyleSheet()
            sheet.replaceSync(style.str)
            this.shadowRoot.adoptedStyleSheets = [
              ...this.shadowRoot.adoptedStyleSheets,
              sheet,
            ]
          }

          if (style.type === 'url') {
            const link = document.createElement('link')
            link.rel = 'stylesheet'
            link.href = style.str
            this.shadowRoot.appendChild(link)
          }
        })
      }

      if (scriptsList.length > 0) {
        scriptsList.forEach((script) => {
          if (!this.shadowRoot) return

          if (script.type === 'inlineScript') {
            const scriptElement = document.createElement('script')
            scriptElement.textContent = script.str
            this.shadowRoot.appendChild(scriptElement)
          }

          if (script.type === 'url') {
            const scriptElement = document.createElement('script')
            scriptElement.src = script.str
            this.shadowRoot.appendChild(scriptElement)
          }
        })
      }
    }
  }

  customElements.define('twind-scope', TwindScope)
})(window)
