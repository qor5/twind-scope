declare global {
  interface Window {
    TwindScope: any
    twindConfig: any
    Alpine: any
    twindScopeDataStore?: any
  }
}

export type StyleType = 'url' | 'inlineStyle'
export type ScriptType = 'url' | 'inlineScript'

export interface TwindScopeProps {
  type?: string
  id?: string
  script?: string
}

export interface ResponsiveData {
  windowWidth: number
  windowHeight: number
  readonly isMobile: boolean
  readonly isTablet: boolean
  readonly isDesktop: boolean
}

export interface StyleItem {
  str: string
  type: StyleType
}

export interface ScriptItem {
  str: string
  type: ScriptType
}
