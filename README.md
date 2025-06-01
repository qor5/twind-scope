# Tailwind Scope

A utility library that creates isolated scopes for Tailwind CSS using Web Components. It combines [Twind](https://twind.style/) (a Tailwind CSS-in-JS solution) with Shadow DOM to provide scoped styling.

![Demo](https://cdn.danni.cool/self/lGGNQifm.png)

## Features

- 🔍 **Isolated CSS Scopes**: Use Tailwind classes within shadow DOM for true isolation
- 🎯 **Component-specific Styling**: Apply styles only to specific components without affecting others
- 🧩 **Web Component Based**: Uses custom elements with shadow DOM
- ⚡ **Alpine.js Integration**: Includes Alpine.js for reactive components
- 🔄 **Dynamic Configuration**: Configure components via data attributes
- 📱 **Responsive Utilities**: Built-in responsive breakpoint detection

## Installation

### CDN

Add the following script tag to your HTML:

```html
<script src="https://unpkg.com/twind-scope@latest/dist/twind-scope.js"></script>
```

### PNPM

```bash
pnpm add twind-scope
```

### ES Module

```javascript
import 'twind-scope'
```

## Quick Start

Once installed, you can immediately start using `<twind-scope>` elements:

```html
<twind-scope>
  <h1 class="text-3xl font-bold underline text-blue-600">Hello world!</h1>
</twind-scope>
```

[View Basic Example on CodePen](https://codepen.io/danielchan27/full/RNPPqmG)

## Basic Usage

### Simple Scoped Styling

```html
<twind-scope>
  <div class="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-lg">
    <h2 class="text-xl font-medium text-black">Card Title</h2>
    <p class="text-gray-500">This card has isolated Tailwind styles.</p>
  </div>
</twind-scope>
```

### Component Properties

Use the `data-props` attribute to configure components:

```html
<twind-scope data-props='{"type":"hero-section", "id":"hero_1"}'>
  <div class="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8">
    <h1 class="text-4xl font-bold">Hero Section</h1>
  </div>
</twind-scope>
```

**Available Properties:**

- `type`: Adds a class to the first element inside the shadow DOM
- `id`: Sets the ID of the first element (formatted as `${type}-${id}`)
- `script`: Inline JavaScript to execute within the component

## Alpine.js Integration

Tailwind Scope automatically initializes [Alpine.js](https://alpinejs.dev/) inside each component for reactive functionality.

### Basic Alpine.js Example

```html
<twind-scope>
  <div x-data="{ count: 0 }" class="p-4 bg-white rounded shadow">
    <h2 class="text-lg font-medium mb-2">Counter</h2>
    <p class="mb-4">
      Count: <span x-text="count" class="font-bold text-blue-600"></span>
    </p>
    <div class="flex space-x-2">
      <button
        @click="count++"
        class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        +
      </button>
      <button
        @click="count--"
        class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
      >
        -
      </button>
    </div>
  </div>
</twind-scope>
```

### Dynamic Class Toggling

```html
<twind-scope>
  <div x-data="{ isActive: false }" class="p-4">
    <div
      @click="isActive = !isActive"
      :class="isActive ? 'bg-green-100 border-green-500' : 'bg-gray-100 border-gray-300'"
      class="p-4 border-2 rounded cursor-pointer transition-colors duration-200"
    >
      <h3 x-text="isActive ? 'Active' : 'Inactive'" class="font-medium"></h3>
      <p
        x-text="isActive ? 'Click to deactivate' : 'Click to activate'"
        class="text-sm mt-1"
      ></p>
    </div>
  </div>
</twind-scope>
```

### Dropdown Component

```html
<twind-scope>
  <div x-data="{ open: false }" class="relative">
    <button
      @click="open = !open"
      class="px-4 py-2 bg-blue-500 text-white rounded"
    >
      Toggle Dropdown
    </button>
    <div
      x-show="open"
      class="absolute mt-2 w-48 bg-white rounded shadow-lg border"
    >
      <a href="#" class="block px-4 py-2 text-gray-800 hover:bg-blue-100"
        >Option 1</a
      >
      <a href="#" class="block px-4 py-2 text-gray-800 hover:bg-blue-100"
        >Option 2</a
      >
      <a href="#" class="block px-4 py-2 text-gray-800 hover:bg-blue-100"
        >Option 3</a
      >
    </div>
  </div>
</twind-scope>
```

## Responsive Utilities

Each `twind-scope` instance includes built-in responsive properties for breakpoint detection:

### Basic Responsive Usage

```html
<twind-scope>
  <div class="p-4">
    <p
      x-text="`Window: ${windowWidth}px × ${windowHeight}px`"
      class="text-sm text-gray-600"
    ></p>
    <div x-show="isMobile" class="bg-red-100 p-2 rounded">
      Mobile View (< 768px)
    </div>
    <div x-show="isTablet" class="bg-yellow-100 p-2 rounded">
      Tablet View (768px - 1279px)
    </div>
    <div x-show="isDesktop" class="bg-green-100 p-2 rounded">
      Desktop View (≥ 1280px)
    </div>
  </div>
</twind-scope>
```

### Custom Responsive Logic

```html
<twind-scope>
  <div
    x-data="{
    get aspectRatio() { return (windowWidth / windowHeight).toFixed(2) },
    get isWideScreen() { return windowWidth / windowHeight > 1.5 }
  }"
    class="p-4"
  >
    <p x-text="`Aspect Ratio: ${aspectRatio}`" class="mb-2"></p>
    <div x-show="isWideScreen" class="bg-blue-100 p-2 rounded">
      Wide Screen Mode
    </div>
  </div>
</twind-scope>
```

**Available Responsive Properties:**

- `windowWidth`: Current window width
- `windowHeight`: Current window height
- `isMobile`: Width < 768px
- `isTablet`: 768px ≤ width < 1280px
- `isDesktop`: Width ≥ 1280px

## JavaScript Integration

### Inline Scripts

Add component-specific JavaScript using the `script` property:

```html
<twind-scope data-props='{
  "type": "interactive-card",
  "script": "
    const button = this.querySelector(\'.toggle-btn\');
    button.addEventListener(\'click\', () => {
      button.classList.toggle(\'bg-green-500\');
      button.classList.toggle(\'bg-blue-500\');
    });
  "
}'>
  <div class="p-6 bg-white rounded-xl shadow-md">
    <h2 class="text-xl font-medium mb-4">Interactive Card</h2>
    <button class="toggle-btn px-4 py-2 bg-blue-500 text-white rounded">
      Toggle Color
    </button>
  </div>
</twind-scope>
```

### Dynamic Class Management

```html
<twind-scope data-props='{
  "script": "
    const counter = this.querySelector(\'#counter\');
    let count = 0;

    this.querySelector(\'.increment\').addEventListener(\'click\', () => {
      count++;
      counter.textContent = count;

      if (count > 5) {
        counter.className = \'font-bold text-red-500\';
      } else {
        counter.className = \'font-bold text-blue-500\';
      }
    });
  "
}'>
  <div class="p-4 border rounded">
    <h2 class="text-lg">Count: <span id="counter" class="font-bold text-blue-500">0</span></h2>
    <button class="increment px-3 py-1 bg-gray-200 rounded mt-2 hover:bg-gray-300">
      Increment
    </button>
  </div>
</twind-scope>
```

## Global Configuration

Configure Twind globally by setting `window.TwindScope` before loading the component:

```html
<script>
  window.TwindScope = {
    // Twind configuration
    config: {
      theme: {
        extend: {
          colors: {
            brand: '#1234ff',
          },
        },
      },
    },

    // Global styles for all components
    style: [
      'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap',
      `
        * { font-family: 'Inter', sans-serif; }
        .custom-shadow { box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
      `,
    ],

    // Global scripts for all components
    script: [
      'https://cdn.example.com/utilities.js',
      `
        // Global utility function
        function toggleClasses(element, ...classes) {
          classes.forEach(cls => element.classList.toggle(cls));
        }
        
        // Global Alpine.js components
        document.addEventListener('alpine:init', () => {
          Alpine.data('globalCounter', () => ({
            count: 0,
            increment() { this.count++ },
            decrement() { this.count-- }
          }))
        })
      `,
    ],
  }
</script>
```

### Using Global Configuration

```html
<twind-scope>
  <div
    x-data="globalCounter"
    class="p-4 bg-brand text-white rounded custom-shadow"
  >
    <p>Global Counter: <span x-text="count"></span></p>
    <button
      @click="increment()"
      class="px-2 py-1 bg-white text-brand rounded mr-2"
    >
      +
    </button>
    <button @click="decrement()" class="px-2 py-1 bg-white text-brand rounded">
      -
    </button>
  </div>
</twind-scope>
```

## How It Works

Tailwind Scope creates a custom `<twind-scope>` element that:

1. **Creates Shadow DOM**: Establishes an isolated DOM tree
2. **Applies Twind**: Initializes Tailwind CSS-in-JS within the shadow DOM
3. **Moves Content**: Transfers your HTML content into the shadow DOM
4. **Initializes Alpine.js**: Sets up Alpine.js reactivity within the isolated scope
5. **Applies Configuration**: Adds type/ID classes and executes scripts
6. **Provides Responsive Data**: Injects responsive breakpoint properties

This approach ensures complete style isolation, preventing CSS conflicts between different parts of your application.

## Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Run tests
pnpm test
```

## Dependencies

- [@twind/core](https://twind.style/): Core Twind functionality
- [@twind/preset-autoprefix](https://twind.style/): Autoprefixer for Twind
- [@twind/preset-tailwind](https://twind.style/): Tailwind CSS preset for Twind
- [@twind/with-web-components](https://twind.style/): Web Component integration for Twind
- [Alpine.js](https://alpinejs.dev/): Lightweight JavaScript framework for reactivity

## Browser Support

- Chrome 53+
- Firefox 63+
- Safari 10.1+
- Edge 79+

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.
