# Tailwind Scope

A utility library that creates isolated scopes for Tailwind CSS using Web Components. It combines [Twind](https://twind.style/) (a Tailwind CSS-in-JS solution) with Shadow DOM to provide scoped styling [basic example(codePen)](https://codepen.io/danielchan27/full/RNPPqmG).

![](https://cdn.danni.cool/self/lGGNQifm.png)

## Features

- 🔍 **Isolated CSS Scopes**: Use Tailwind classes within shadow DOM for true isolation
- 🎯 **Component-specific Styling**: Apply styles only to specific components without affecting others
- 🧩 **Web Component Based**: Uses custom elements with shadow DOM
- ⚡ **Alpine.js Integration**: Includes Alpine.js for reactive components
- 🔄 **Dynamic Configuration**: Configure components via data attributes

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

## Global Configuration

You can configure Twind globally by setting `window.TwindScope` before the component is loaded:

```html
<script>
  window.TwindScope = {
    // Twind configuration
    config: {
      // Custom theme or other Twind options
    },
    // Global styles to apply to all twind-scope components
    style: [
      // Inline styles or URLs to CSS files
      'https://example.com/styles.css',
      'body { margin: 0; }',
    ],
    // Global scripts to include in all twind-scope components
    script: [
      // Inline scripts or URLs to JS files
      'https://example.com/script.js',
      'console.log("Hello from twind-scope!")',
    ],
  }
</script>
```

## Development

```bash
# Start development server
pnpm dev

# Build for production
pnpm build
```

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

# TwindScope 共享 Resize 事件解决方案

## 问题描述

在使用多个 `twind-scope` Shadow DOM 实例时，如果每个实例都单独监听 `resize` 事件，会导致：

- 性能问题：多个重复的事件监听器
- 内存泄漏风险：事件监听器未正确清理
- 代码冗余：重复的事件处理逻辑

## 解决方案

实现了一个全局的 `ResizeManager` 单例模式，让所有 `twind-scope` 实例共享同一个 resize 事件监听器。

### 核心特性

1. **单例模式**: 全局只有一个 resize 事件监听器
2. **自动管理**: 当有实例需要时自动添加监听器，当没有实例时自动移除
3. **Alpine.js 集成**: 为每个实例提供响应式的尺寸数据
4. **断点检测**: 内置常用的响应式断点判断
5. **错误处理**: 安全的回调执行，避免单个实例错误影响其他实例

## 实现原理

### ResizeManager 类

```typescript
class ResizeManager {
  private static instance: ResizeManager
  private listeners: Set<(width: number, height: number) => void> = new Set()
  private isListening = false

  // 单例模式
  static getInstance(): ResizeManager

  // 添加监听器
  addListener(callback: (width: number, height: number) => void): void

  // 移除监听器
  removeListener(callback: (width: number, height: number) => void): void
}
```

### TwindScope 集成

每个 `twind-scope` 实例：

1. 在 `connectedCallback` 时注册到 ResizeManager
2. 在 `disconnectedCallback` 时从 ResizeManager 注销
3. 维护自己的 Alpine.js 响应式数据
4. 通过回调函数更新自己的尺寸数据

## 使用方法

### 基础用法

```html
<twind-scope>
  <div class="p-4">
    <p x-text="`当前宽度: ${windowWidth}px`"></p>
    <p x-text="`当前高度: ${windowHeight}px`"></p>
  </div>
</twind-scope>
```

### 响应式断点检测

```html
<twind-scope>
  <div
    :class="{
    'bg-red-100': isMobile,
    'bg-yellow-100': isTablet,
    'bg-green-100': isDesktop
  }"
  >
    <div x-show="isMobile">移动端视图</div>
    <div x-show="isTablet">平板视图</div>
    <div x-show="isDesktop">桌面视图</div>
  </div>
</twind-scope>
```

### 自定义响应式逻辑

```html
<twind-scope>
  <div
    x-data="{
    get aspectRatio() {
      return (windowWidth / windowHeight).toFixed(2)
    },
    get isWideScreen() {
      return windowWidth / windowHeight > 1.5
    }
  }"
  >
    <p x-text="`屏幕比例: ${aspectRatio}`"></p>
    <div x-show="isWideScreen">宽屏模式</div>
  </div>
</twind-scope>
```

## 可用的响应式属性

每个 `twind-scope` 实例都可以访问以下响应式属性：

### 基础尺寸

- `windowWidth`: 当前窗口宽度
- `windowHeight`: 当前窗口高度

### 设备类型断点

- `isMobile`: 宽度 < 768px
- `isTablet`: 768px ≤ 宽度 < 1024px
- `isDesktop`: 宽度 ≥ 1024px

### Tailwind CSS 断点

- `isSmall`: 宽度 < 640px
- `isMedium`: 640px ≤ 宽度 < 1024px
- `isLarge`: 宽度 ≥ 1024px
- `isXLarge`: 宽度 ≥ 1280px
- `is2XLarge`: 宽度 ≥ 1536px

## 性能优势

### 对比传统方案

**传统方案（每个实例一个监听器）:**

```javascript
// 每个实例都这样做
window.addEventListener('resize', this.handleResize)
```

**优化方案（共享监听器）:**

```javascript
// 全局只有一个监听器
ResizeManager.getInstance().addListener(this.callback)
```

### 性能提升

1. **事件监听器数量**: 从 N 个减少到 1 个
2. **内存使用**: 显著减少重复的事件处理函数
3. **CPU 使用**: 减少重复的事件处理计算
4. **自动清理**: 避免内存泄漏

## 调试和验证

### 验证共享监听器

1. 打开浏览器开发者工具
2. 在 Console 中运行：
   ```javascript
   // 查看当前的事件监听器数量
   getEventListeners(window).resize.length
   ```
3. 应该看到只有 1 个 resize 监听器，无论有多少个 twind-scope 实例

### 性能监控

```javascript
// 监控 ResizeManager 状态
console.log('监听器数量:', ResizeManager.getInstance().listeners.size)
console.log('是否正在监听:', ResizeManager.getInstance().isListening)
```

## 最佳实践

1. **避免在组件内部再次监听 resize**: 直接使用提供的响应式属性
2. **使用计算属性**: 对于复杂的响应式逻辑，使用 Alpine.js 的 getter
3. **合理使用断点**: 优先使用内置的断点属性，减少重复计算
4. **测试不同屏幕尺寸**: 确保响应式逻辑在各种设备上正常工作

## 示例文件

查看 `example.html` 文件获取完整的使用示例，包括：

- 基础尺寸显示
- 响应式断点检测
- 自定义响应式逻辑
- 多实例协同工作

## 兼容性

- 支持所有现代浏览器
- 需要 Alpine.js 3.x
- 需要支持 Shadow DOM 的浏览器
- 需要支持 ES6+ 语法的环境
