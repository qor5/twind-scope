import './types'
import { initStyleAndScript } from './utils'
import { TwindScope } from './twind-scope'

// Initialize styles and scripts from global TwindScope configuration
;(function (win) {
  initStyleAndScript(win.TwindScope?.style || [], win.TwindScope?.script || [])

  // Register the custom element
  customElements.define('twind-scope', TwindScope)
})(window)

// Export the TwindScope class for external use
export { TwindScope }
export { DataManager } from './data-manager'
export { AlpineIntegration } from './alpine-integration'
export { default as ResizeManager } from './resize-manager'
export * from './types'
export * from './utils'
