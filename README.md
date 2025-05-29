# Tailwind Scope

A utility library that creates isolated scopes for Tailwind CSS using Web Components. It combines [Twind](https://twind.style/) (a Tailwind CSS-in-JS solution) with Shadow DOM to provide scoped styling.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
  - [NPM](#npm)
  - [CDN](#cdn)
- [Usage](#usage)
- [Development](#development)
- [Building](#building)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)

## Features

- 🔍 **Isolated CSS Scopes**: Use Tailwind classes within shadow DOM for true isolation
- 🎯 **Component-specific Styling**: Apply styles only to specific components without affecting others
- 🧩 **Web Component Based**: Uses custom elements with shadow DOM
- ⚡ **Alpine.js Integration**: Includes Alpine.js for reactive components
- 🔄 **Dynamic Configuration**: Configure components via data attributes

## Installation

### NPM

Install via npm:

```bash
npm install @your-scope/tailwind-scope
```

Or via pnpm:

```bash
pnpm add @your-scope/tailwind-scope
```

### CDN

You can also include Tailwind Scope directly from UNPKG:

```html
<script src="https://unpkg.com/@your-scope/tailwind-scope/dist/common-container-scope.umd.cjs"></script>
```

Or use a specific version:

```html
<script src="https://unpkg.com/@your-scope/tailwind-scope@1.0.0/dist/common-container-scope.umd.cjs"></script>
```

For ES modules:
```html
<script type="module">
  import TwindScope from 'https://unpkg.com/@your-scope/tailwind-scope/dist/common-container-scope.js'
</script>
```

## Usage

### Basic Usage

```html
<twind-scope>
  <h1 class="text-3xl font-bold underline">Hello world!</h1>
</twind-scope>
```

### With Component Properties

```html
<twind-scope data-props='{"type":"hero-image-horizontal", "id":"hero_1"}'>
  <h1 class="text-3xl font-bold underline">Hello world!</h1>
</twind-scope>
```

The `data-props` attribute accepts a JSON string with the following properties:

- `type`: Adds a class to the first element inside the shadow DOM
- `id`: Sets the ID of the first element inside the shadow DOM (as `${type}-${id}`)
- `script`: Optional inline JavaScript to execute within the component

### Using Scripts with Tailwind

#### Inline Scripts in Components

You can add component-specific JavaScript by including a script property in the data-props:

```html
<twind-scope data-props='{
  "type": "interactive-card",
  "id": "card_1",
  "script": "
    const button = this.querySelector('.btn');
    button.addEventListener('click', () => {
      button.classList.toggle('bg-green-500');
      button.classList.toggle('bg-blue-500');
    });
  "
}'>
  <div class="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-md">
    <h2 class="text-xl font-medium text-black">Interactive Card</h2>
    <button class="mt-4 px-4 py-2 bg-blue-500 text-white rounded btn">
      Toggle Color
    </button>
  </div>
</twind-scope>
```

#### Global Scripts

To include scripts in all your `twind-scope` components, use the global configuration:

```html
<script>
  window.TwindScope = {
    script: [
      // External script
      'https://cdn.example.com/my-utilities.js',

      // Inline script that will run in all components
      `
        // This function will be available in all twind-scope components
        function toggleClasses(element, ...classes) {
          classes.forEach(className => element.classList.toggle(className));
        }
      `,
    ],
  }
</script>
```

#### Combining Dynamic Classes with Scripts

You can use JavaScript to dynamically add or remove Tailwind classes:

```html
<twind-scope data-props='{
  "script": "
    const counter = this.querySelector(\'#counter\');
    let count = 0;

    this.querySelector(\'.increment\').addEventListener(\'click\', () => {
      count++;
      counter.textContent = count;

      // Add/remove Tailwind classes based on state
      if (count > 5) {
        counter.classList.add(\'text-red-500\');
        counter.classList.remove(\'text-blue-500\');
      } else {
        counter.classList.add(\'text-blue-500\');
        counter.classList.remove(\'text-red-500\');
      }
    });
  "
}'>
  <div class="p-4 border rounded">
    <h2 class="text-lg">Counter: <span id="counter" class="text-blue-500">0</span></h2>
    <button class="increment px-2 py-1 bg-gray-200 rounded mt-2">Increment</button>
  </div>
</twind-scope>
```

### Alpine.js Integration with Tailwind

[Alpine.js](https://alpinejs.dev/) is a lightweight JavaScript framework that offers reactive and declarative capabilities. Tailwind Scope automatically initializes Alpine.js inside each component, making it easy to create interactive UI elements with isolated styling.

#### Basic Alpine.js Example

```html
<twind-scope>
  <div x-data="{ count: 0 }" class="p-4 bg-white rounded shadow">
    <h2 class="text-lg font-medium mb-2">Alpine.js Counter</h2>
    <p class="mb-4">
      Current count: <span x-text="count" class="font-bold"></span>
    </p>
    <div class="flex space-x-2">
      <button
        @click="count++"
        class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Increment
      </button>
      <button
        @click="count--"
        class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Decrement
      </button>
    </div>
  </div>
</twind-scope>
```

#### Toggling Tailwind Classes with Alpine.js

You can dynamically toggle Tailwind classes based on Alpine.js state:

```html
<twind-scope>
  <div x-data="{ isActive: false }" class="p-4 bg-white rounded shadow">
    <div
      @click="isActive = !isActive"
      :class="isActive ? 'bg-blue-100 border-blue-500' : 'bg-gray-100 border-gray-300'"
      class="p-4 border-2 rounded cursor-pointer transition-colors duration-200"
    >
      <h3
        class="font-medium"
        x-text="isActive ? 'Active State' : 'Inactive State'"
      ></h3>
      <p
        class="mt-2 text-sm"
        x-text="isActive ? 'Click to deactivate' : 'Click to activate'"
      ></p>
    </div>
  </div>
</twind-scope>
```

#### Alpine.js Dropdown Example

Here's how to create a dropdown menu using Alpine.js with Tailwind classes:

```html
<twind-scope>
  <div x-data="{ open: false }" class="relative">
    <button
      @click="open = !open"
      class="px-4 py-2 bg-blue-500 text-white rounded"
    >
      Toggle Dropdown
    </button>

    <div x-show="open" class="absolute mt-2 w-48 bg-white rounded shadow-lg">
      <a href="#" class="block px-4 py-2 text-gray-800 hover:bg-blue-100"
        >Option 1</a
      >
      <a href="#" class="block px-4 py-2 text-gray-800 hover:bg-blue-100"
        >Option 2</a
      >
    </div>
  </div>
</twind-scope>
```

#### Complex Example: Form with Validation

```html
<twind-scope>
  <div
    x-data="{ 
    email: '',
    password: '',
    errors: {},
    validateForm() {
      this.errors = {};
      if (!this.email) this.errors.email = 'Email is required';
      if (!this.password) this.errors.password = 'Password is required';
      return Object.keys(this.errors).length === 0;
    },
    submitForm() {
      if (this.validateForm()) {
        alert('Form submitted successfully!');
      }
    }
  }"
    class="max-w-md mx-auto p-6 bg-white rounded shadow-md"
  >
    <h2 class="text-xl font-semibold mb-4">Login Form</h2>

    <div class="mb-4">
      <label class="block text-gray-700 mb-1">Email</label>
      <input
        type="email"
        x-model="email"
        class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
        :class="errors.email ? 'border-red-500' : 'border-gray-300'"
      />
      <p
        x-show="errors.email"
        x-text="errors.email"
        class="mt-1 text-sm text-red-500"
      ></p>
    </div>

    <div class="mb-6">
      <label class="block text-gray-700 mb-1">Password</label>
      <input
        type="password"
        x-model="password"
        class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
        :class="errors.password ? 'border-red-500' : 'border-gray-300'"
      />
      <p
        x-show="errors.password"
        x-text="errors.password"
        class="mt-1 text-sm text-red-500"
      ></p>
    </div>

    <button
      @click="submitForm()"
      class="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 focus:outline-none"
    >
      Log In
    </button>
  </div>
</twind-scope>
```

#### Accessing Alpine.js Inside Script

You can also access Alpine.js functionality within your component's script:

```html
<twind-scope data-props='{
  "script": "
    const container = this.querySelector(\'.alpine-container\');

    // Access Alpine.js data on an element
    const getData = () => Alpine.$data(container);

    // Register a custom event handler
    this.querySelector(\'.special-action\').addEventListener(\'click\', () => {
      const data = getData();
      data.count += 10; // Update Alpine state directly
    });
  "
}'>
  <div x-data="{ count: 0 }" class="alpine-container p-4 bg-white rounded shadow">
    <p class="mb-4">Count: <span x-text="count"></span></p>
    <div class="flex space-x-2">
      <button @click="count++" class="px-3 py-1 bg-blue-500 text-white rounded">
        Add 1
      </button>
      <button class="special-action px-3 py-1 bg-green-500 text-white rounded">
        Add 10
      </button>
    </div>
  </div>
</twind-scope>
```

For more information on Alpine.js capabilities and directives, refer to the [official Alpine.js documentation](https://alpinejs.dev/start-here).

#### Global Configuration with Alpine.js

```html
<script>
  window.TwindScope = {
    config: {
      // Twind configurations
    },
    style: [
      // Style configurations
    ],
    script: [
      // Custom Alpine.js components or plugins
      `
        document.addEventListener('alpine:init', () => {
          Alpine.data('counter', () => ({
            count: 0,
            increment() { this.count++ },
            decrement() { this.count-- }
          }))
        })
      `,
    ],
  }
</script>

<!-- Then use in your component -->
<twind-scope>
  <div x-data="counter" class="p-4 bg-white rounded shadow">
    <p>Count: <span x-text="count"></span></p>
    <button
      @click="increment()"
      class="px-3 py-1 bg-blue-500 text-white rounded"
    >
      +
    </button>
    <button
      @click="decrement()"
      class="px-3 py-1 bg-red-500 text-white rounded"
    >
      -
    </button>
  </div>
</twind-scope>
```

## Development

### Local Development

```bash
# Clone the repository
git clone https://github.com/yourusername/tailwind-scope.git
cd tailwind-scope

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### Building

This project uses GitHub Actions for automated builds. The build process is triggered automatically when code is pushed to the master branch.

To build manually:

```bash
# Build for production
pnpm build
```

### Publishing a New Version

1. Update the version number:
```bash
npm version patch  # or minor or major
```

2. Push to GitHub including tags:
```bash
git push --follow-tags
```

3. GitHub Actions will automatically build and create a release

## How It Works

Tailwind Scope creates a custom element called `<twind-scope>` that:

1. Uses Shadow DOM to create an isolated DOM tree
2. Applies Twind (Tailwind CSS-in-JS) within that shadow DOM
3. Moves your content into the shadow DOM
4. Initializes Alpine.js within the shadow DOM if present
5. Applies any specified type/ID to the first child element

This approach allows you to use Tailwind classes in isolation, preventing style conflicts between different parts of your application.

## Dependencies

- [@twind/core](https://twind.style/): Core Twind functionality
- [@twind/preset-autoprefix](https://twind.style/): Autoprefixer for Twind
- [@twind/preset-tailwind](https://twind.style/): Tailwind CSS preset for Twind
- [@twind/with-web-components](https://twind.style/): Web Component integration for Twind
- [Alpine.js](https://alpinejs.dev/): Lightweight JavaScript framework for reactivity
