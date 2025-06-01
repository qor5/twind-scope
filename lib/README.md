# TwindScope Library - Modular Architecture

This library has been refactored into a modular architecture for better maintainability and code organization.

## File Structure

```
lib/
├── README.md              # This file
├── index.ts              # Main entry point - exports everything
├── main.ts               # Backward compatibility wrapper
├── types.ts              # TypeScript type definitions
├── utils.ts              # Utility functions for styles and scripts
├── data-manager.ts       # Global data management and cleanup
├── alpine-integration.ts # Alpine.js integration logic
├── resize-manager.ts     # Window resize handling
└── twind-scope.ts        # Main TwindScope component class
```

## Modules Overview

### `types.ts`

- Contains all TypeScript type definitions
- Global window interface declarations
- Type definitions for styles, scripts, and component props

### `utils.ts`

- Style and script initialization functions
- Shadow DOM integration utilities
- Reusable utility functions

### `data-manager.ts`

- Global instance and data management
- Memory cleanup and garbage collection
- Orphaned data detection and cleanup

### `alpine-integration.ts`

- Alpine.js data setup and management
- Responsive data creation and merging
- x-data attribute handling

### `resize-manager.ts`

- Window resize event management
- Instance registration and updates
- Performance-optimized resize handling

### `twind-scope.ts`

- Main component class implementation
- Lifecycle management
- Component initialization and cleanup

### `index.ts`

- Main entry point that orchestrates everything
- Custom element registration
- Public API exports

### `main.ts`

- Backward compatibility wrapper
- Re-exports everything from the new structure

## Usage

### For new projects:

```typescript
import { TwindScope, DataManager } from './lib/index'
// or import specific modules
import { AlpineIntegration } from './lib/alpine-integration'
```

### For existing projects:

```typescript
// Existing imports continue to work
import { TwindScope } from './lib/main'
```

## Benefits of This Structure

1. **Better Maintainability**: Each module has a single responsibility
2. **Improved Testing**: Individual modules can be tested in isolation
3. **Better Code Organization**: Related functionality is grouped together
4. **Reduced Complexity**: Large monolithic file split into manageable pieces
5. **Enhanced Reusability**: Modules can be reused independently
6. **Backward Compatibility**: Existing code continues to work without changes

## Migration Guide

If you're upgrading from the monolithic structure:

1. **No Breaking Changes**: All existing imports will continue to work
2. **Optional Migration**: You can gradually migrate to import specific modules
3. **New Features**: Use the modular imports for new functionality

### Example Migration:

**Before:**

```typescript
import { TwindScope } from './lib/main'
```

**After (optional):**

```typescript
import { TwindScope } from './lib/index'
// or for more specific imports:
import { TwindScope } from './lib/twind-scope'
import { DataManager } from './lib/data-manager'
```

## Development

When making changes to the library:

1. **Types**: Add new types to `types.ts`
2. **Utilities**: Add utility functions to `utils.ts`
3. **Data Management**: Modify data handling in `data-manager.ts`
4. **Alpine Integration**: Update Alpine.js logic in `alpine-integration.ts`
5. **Resize Handling**: Modify resize logic in `resize-manager.ts`
6. **Main Component**: Update component logic in `twind-scope.ts`
7. **Public API**: Export new functionality in `index.ts`
