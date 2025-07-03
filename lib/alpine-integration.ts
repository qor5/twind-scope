import Alpine from 'alpinejs'
import type { BreakpointType, ResponsiveData } from './types'
import { DataManager } from './data-manager'

export class AlpineIntegration {
  static createResponsiveData(
    width: number,
    height: number,
    breakpoints?: BreakpointType
  ): ResponsiveData {
    // if breakpoints is not provided, use default values
    const { tablet = 768, desktop = 1280 } = breakpoints || {}

    return Alpine.reactive({
      windowWidth: width,
      windowHeight: height,
      // responsive breakpoint detection - using getter functions to ensure reactivity
      get isMobile() {
        return this.windowWidth < tablet
      },
      get isTablet() {
        return this.windowWidth >= tablet && this.windowWidth < desktop
      },
      get isDesktop() {
        return this.windowWidth >= desktop
      },
    })
  }

  static setupAlpineData(
    shadowRoot: ShadowRoot,
    instanceId: string,
    breakpoints: BreakpointType
  ): any {
    if (!shadowRoot?.firstElementChild) return null

    const element = shadowRoot.firstElementChild as HTMLElement

    // add alpine data of responsive hooks with reactive properties
    const alpineData = AlpineIntegration.createResponsiveData(
      window.innerWidth,
      window.innerHeight,
      breakpoints
    )

    // Store in responsiveDataMap
    DataManager.setResponsiveData(instanceId, alpineData)

    // Check if element already has x-data attribute
    const existingXData = element.getAttribute('x-data')
    if (existingXData) {
      // For existing x-data, merge with our responsive data
      AlpineIntegration.mergeWithExistingData(
        element,
        existingXData,
        alpineData
      )
    } else {
      // No existing x-data, directly use Alpine's programmatic data setting
      AlpineIntegration.setElementData(element, alpineData)
    }

    return alpineData
  }

  static mergeWithExistingData(
    element: HTMLElement,
    existingXData: string,
    alpineData: any
  ) {
    try {
      const trimmedData = existingXData.trim()
      const dataType = AlpineIntegration.detectXDataType(trimmedData)

      if (dataType === 'function') {
        // For function-based x-data, execute it and merge with responsive data
        const originalFunc = new Function('return ' + existingXData)()
        const originalData =
          typeof originalFunc === 'function' ? originalFunc() : originalFunc

        // Instead of recreating alpineData, merge user properties into existing reactive object
        Object.keys(originalData).forEach((key) => {
          if (!(key in alpineData)) {
            const descriptor = Object.getOwnPropertyDescriptor(
              originalData,
              key
            )
            if (descriptor) {
              Object.defineProperty(alpineData, key, descriptor)
            } else {
              alpineData[key] = originalData[key]
            }
          }
        })

        AlpineIntegration.setElementData(element, alpineData)
      } else {
        // For object or expression-based x-data, use the original logic
        const staticData = new Function('return ' + existingXData)()

        Object.keys(staticData).forEach((key) => {
          if (!(key in alpineData)) {
            const descriptor = Object.getOwnPropertyDescriptor(staticData, key)
            if (descriptor) {
              Object.defineProperty(alpineData, key, descriptor)
            } else {
              alpineData[key] = staticData[key]
            }
          }
        })

        AlpineIntegration.setElementData(element, alpineData)
      }
    } catch (e) {
      console.error('Failed to merge x-data:', e)
      // Fallback: just use responsive data
      AlpineIntegration.setElementData(element, alpineData)
    }
  }

  static setElementData(element: HTMLElement, data: any) {
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
    const dataKey = 'twindScopeData_' + Math.random().toString(36).substr(2, 9)

    // Store the data in a way that can be accessed from x-data
    if (!window.twindScopeDataStore) {
      window.twindScopeDataStore = {}
    }
    window.twindScopeDataStore[dataKey] = data

    // Store the dataKey in the element for cleanup purposes
    element.dataset.twindDataKey = dataKey

    // Set x-data to access the stored data
    element.setAttribute('x-data', `window.twindScopeDataStore['${dataKey}']`)
  }

  static detectXDataType(
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

  static cleanupTwindScopeDataStore(element: HTMLElement): void {
    const dataKey = element.dataset.twindDataKey

    if (dataKey && window.twindScopeDataStore) {
      delete window.twindScopeDataStore[dataKey]
      delete element.dataset.twindDataKey

      // If twindScopeDataStore becomes empty, clean it up entirely
      if (Object.keys(window.twindScopeDataStore).length === 0) {
        delete window.twindScopeDataStore
      }
    }
  }
}
