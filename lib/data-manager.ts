export class DataManager {
  // Static properties for data management
  private static instances = new WeakMap<HTMLElement, string>()
  private static responsiveDataMap = new Map<string, any>()
  private static cleanupTimer?: any
  private static unloadListenerAdded = false

  // Static method to get responsive data (for Alpine.js access)
  static getResponsiveData(instanceId: string) {
    return DataManager.responsiveDataMap.get(instanceId)
  }

  // Static method to initialize global resources
  static initializeGlobalResources() {
    // Ensure only one cleanup timer exists globally
    if (!DataManager.cleanupTimer) {
      DataManager.cleanupTimer = setInterval(
        DataManager.cleanupOrphanedData,
        30000
      )
    }

    // Add page unload cleanup (only once)
    if (!DataManager.unloadListenerAdded) {
      window.addEventListener('beforeunload', DataManager.handlePageUnload)
      DataManager.unloadListenerAdded = true
    }
  }

  // Static method for cleaning up orphaned data
  static cleanupOrphanedData() {
    const existingIds = Array.from(DataManager.responsiveDataMap.keys())

    existingIds.forEach((instanceId) => {
      const element = document.querySelector(
        `[data-instance-id="${instanceId}"]`
      )
      if (!element) {
        DataManager.responsiveDataMap.delete(instanceId)
      }
    })

    // Clean up orphaned twindScopeDataStore entries
    if (window.twindScopeDataStore) {
      const dataKeys = Object.keys(window.twindScopeDataStore)
      dataKeys.forEach((dataKey) => {
        // Check if any element still references this dataKey
        const element = document.querySelector(
          `[data-twind-data-key="${dataKey}"]`
        )
        if (!element) {
          delete window.twindScopeDataStore[dataKey]
        }
      })

      // If twindScopeDataStore becomes empty, clean it up entirely
      if (Object.keys(window.twindScopeDataStore).length === 0) {
        delete window.twindScopeDataStore
      }
    }
  }

  // Static method for page unload cleanup
  static handlePageUnload() {
    // Clear the cleanup timer
    if (DataManager.cleanupTimer) {
      clearInterval(DataManager.cleanupTimer)
      DataManager.cleanupTimer = undefined
    }

    // Clear all data
    DataManager.responsiveDataMap.clear()

    // Clean up twindScopeDataStore
    if (window.twindScopeDataStore) {
      delete window.twindScopeDataStore
    }
  }

  // Static method to manually trigger cleanup
  static triggerCleanup() {
    DataManager.cleanupOrphanedData()
  }

  // Static method to get current instances count
  static getInstancesInfo() {
    const instanceIds = Array.from(DataManager.responsiveDataMap.keys())

    return {
      totalInstances: instanceIds.length,
      instanceIds: instanceIds,
      hasCleanupTimer: !!DataManager.cleanupTimer,
    }
  }

  // Static method to force cleanup all instances
  static destroyAllInstances() {
    // Stop cleanup timer
    if (DataManager.cleanupTimer) {
      clearInterval(DataManager.cleanupTimer)
      DataManager.cleanupTimer = undefined
    }

    // Clear all data
    DataManager.responsiveDataMap.clear()
    DataManager.instances = new WeakMap()

    // Clean up twindScopeDataStore
    if (window.twindScopeDataStore) {
      delete window.twindScopeDataStore
    }
  }

  // Instance management methods
  static setInstance(element: HTMLElement, instanceId: string) {
    DataManager.instances.set(element, instanceId)
  }

  static getInstance(element: HTMLElement): string | undefined {
    return DataManager.instances.get(element)
  }

  static deleteInstance(element: HTMLElement) {
    DataManager.instances.delete(element)
  }

  static setResponsiveData(instanceId: string, data: any) {
    DataManager.responsiveDataMap.set(instanceId, data)
  }

  static deleteResponsiveData(instanceId: string) {
    DataManager.responsiveDataMap.delete(instanceId)
  }
}
