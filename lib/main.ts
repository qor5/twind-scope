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

    constructor() {
      super()
      this.attachShadow({ mode: 'open' })

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

      // add alpine data of responsive hooks
      this.alpineData = Alpine.reactive({
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
        // responsive breakpoint detection
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

      // store data to global, so alpine.js can access
      const instanceId = this.getInstanceId()
      ;(window as any)[`TwindScopeResize_${instanceId}`] = this.alpineData

      // Check if element already has x-data attribute
      const existingXData = element.getAttribute('x-data')
      if (existingXData) {
        // If there's existing x-data, we need to merge it with our responsive data
        // We'll modify the existing x-data to include our responsive hooks
        try {
          // Parse existing x-data if it's a simple object literal
          if (
            existingXData.trim().startsWith('{') &&
            existingXData.trim().endsWith('}')
          ) {
            // For simple object literals, we can merge them
            const mergedData = `{ ...${existingXData}, ...window.TwindScopeResize_${instanceId} }`
            element.setAttribute('x-data', mergedData)
          } else {
            // For complex expressions, we'll create a wrapper function
            element.setAttribute(
              'x-data',
              `(() => {
              const originalData = ${existingXData};
              const responsiveData = window.TwindScopeResize_${instanceId};
              return { ...originalData, ...responsiveData };
            })()`
            )
          }
        } catch (e) {
          // If parsing fails, fallback to function approach
          element.setAttribute(
            'x-data',
            `(() => {
            const originalData = ${existingXData};
            const responsiveData = window.TwindScopeResize_${instanceId};
            return { ...originalData, ...responsiveData };
          })()`
          )
        }
      } else {
        // No existing x-data, just use our responsive data
        element.setAttribute('x-data', `window.TwindScopeResize_${instanceId}`)
      }
    }

    private setupResizeListener(): void {
      // 直接注册实例到 ResizeManager
      ResizeManager.getInstance().addInstance(this)
    }

    private removeResizeListener(): void {
      // 从 ResizeManager 移除实例
      ResizeManager.getInstance().removeInstance(this)

      // clean global data
      const instanceId = this.getInstanceId()
      delete (window as any)[`TwindScopeResize_${instanceId}`]
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
