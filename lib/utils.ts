import type { StyleItem, ScriptItem, StyleType, ScriptType } from './types'

export const stylesList: StyleItem[] = []
export const scriptsList: ScriptItem[] = []

export function initStyleAndScript(
  styleList: string[],
  scriptList: string[]
): void {
  styleList.forEach((str) => {
    let type: StyleType = 'inlineStyle'
    if (/^https?:\/\//.test(str)) type = 'url'

    stylesList.push({
      type,
      str,
    })
  })

  scriptList.forEach((str) => {
    let type: ScriptType = 'inlineScript'
    if (/^https?:\/\//.test(str)) type = 'url'

    scriptsList.push({
      type,
      str,
    })
  })
}

export function integrateStylesIntoShadowRoot(shadowRoot: ShadowRoot): void {
  if (stylesList.length > 0) {
    stylesList.forEach((style) => {
      if (style.type === 'inlineStyle') {
        const sheet = new CSSStyleSheet()
        sheet.replaceSync(style.str)
        shadowRoot.adoptedStyleSheets = [
          ...shadowRoot.adoptedStyleSheets,
          sheet,
        ]
      }

      if (style.type === 'url') {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = style.str
        shadowRoot.appendChild(link)
      }
    })
  }
}

export function integrateScriptsIntoShadowRoot(shadowRoot: ShadowRoot): void {
  if (scriptsList.length > 0) {
    scriptsList.forEach((script) => {
      if (script.type === 'inlineScript') {
        const scriptElement = document.createElement('script')
        scriptElement.textContent = script.str
        shadowRoot.appendChild(scriptElement)
      }

      if (script.type === 'url') {
        const scriptElement = document.createElement('script')
        scriptElement.src = script.str
        shadowRoot.appendChild(scriptElement)
      }
    })
  }
}

export function integrateComponentScript(
  shadowRoot: ShadowRoot,
  script: string
): void {
  const scriptElement = document.createElement('script')
  scriptElement.textContent = script
  shadowRoot.appendChild(scriptElement)
}
