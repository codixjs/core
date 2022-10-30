---
sidebar: auto
sidebarDepth: 2
next: apis.md
prev: false
---

# 指南

它是一套基于`React@18.x`的前端开发架构，能够快速生成`SPA`与`SSR`项目代码。
同时它支持`Render-as-You-Fetch`的异步数据渲染方式，通过`React@18.x`的`renderToPipeableStream`方式渲染出页面流数据。
它也是目前唯一一套基于`React@18.x`的SSR完整解决方案。

## 工作原理

它不改变任何`React`的编写和启动方式。它的职责是生成一个用于启动的组件提供给`React`用于启动页面。
这使得本架构可以兼容很多`React`支持的其他框架，用户不必要担心兼容性的问题。
当然，本架构遵循`React`的默认推荐的组件方式，即函数组件。

```ts {8,9,11}
import React from 'react';
import createNewRouters from '../index';
import { Application, PopstateHistoryMode } from '@codixjs/codix';
import { createRoot } from 'react-dom/client';

const app = new Application(PopstateHistoryMode);
export const routers = createNewRouters(app);
const { Bootstrap } = app.build();
const react = createRoot(document.getElementById('root'));

react.render(<Bootstrap pathes={routers}>404 Not Found</Bootstrap>);
```

## 快速上手

它支持`npm create`命令来快速创建项目。

> 注意：项目完全采用`TypeScript`开发方式，普通`JavaScript`方式不推荐，所以项目创建完毕是基于`TS`语法的。

1. 创建并进入一个新目录

```bash
$ npm create codix-app <project name>
```

2. 进入项目

```bash
$ cd <project name>
```

3. 安装依赖

```bash
$ npm i
```

4. 启动开发

```bash
$ npm run dev # 启动spa开发模式
$ npm run dev:ssr # 启动ssr开发模式
```

5. 编译项目

```bash
$ npm run build:spa # 启动spa编译
$ npm run build:client # 启动ssr的client端编译
$ npm run build:server # 启动ssr的server端编译
$ npm run build # 启动聚合编译 将所有模式都生成产物
```

6. SSR产物启动

```bash
$ node server.js
```

或者需要使用`PM2`启动的：

```bash
$ pm2 start server.js
```

现在你已经完整体验了整个项目开发流程。你会发现我们使用的是`Vite`来开发项目，而非`Webpack`。
主要的考虑是`Vite`目前对`React`开发的支持度非常不错，也是下一代开发工具。`Vite`的优势可以看官网介绍。

## 模块介绍

官方提供的架构模块如下：

- [@codixjs/codix](https://github.com/codixjs/core/tree/master/packages/codix) 核心框架代码
- [@codixjs/router](https://github.com/codixjs/core/tree/master/packages/router) 路由管理控制模块
- [@codixjs/fetch](https://github.com/codixjs/core/tree/master/packages/fetch) 支持`SPA`与`SSR`无差异的异步数据渲染模块
- [@codixjs/server](https://github.com/codixjs/core/tree/master/packages/server) 服务端渲染核心代码
- [@codixjs/vite](https://github.com/codixjs/core/tree/master/packages/vite) `Vite`的开发及编译插件兼容模块

## 项目目录

:::vue
.
├── src
│   ├── entries _(**入口文件集合**)_
│   │   ├── `client.tsx` _(**SSR的Client端启动文件**)_
│   │   ├── `server.tsx` _(**SSR的server端导出模块文件**)_
│   │   └── `spa.js` _(**SPA启动文件**)_
│   ├── pages
│   │   ├── `index` _(**首页路由文件夹**)_
│   │   │   ├── index.module.less _(**样式文件**)_
│   │   │   └── index.tsx _(**组件文件**)_
│   │   └── `...` _(**更多路由文件夹**)_
│   ├── `hooks.ts` _(**通用HOOKS集合**)_
│   ├── `html.tsx` _(**项目模板文件，基于React组件渲染导出**)_
│   ├── `index.ts` _(**路由聚合文件**)_
│   ├── style.less 
│   └── `vite-env.d.ts` _(**TS全局类型定义文件**)_
├── .gitignore
├── favicon.svg
├── index.html
├── package.json
├── README.md
├── `server.js` _(**生成环境SSR启动入口文件**)_
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
:::

一般的，我们将业务代码都是放到`pages`下面的，每个路由都新建一个文件夹来处理，每个文件夹导出一个页面级组件。

- `/src/entries/*` 文件夹内容不要改动
- `/src/hooks.ts` 文件一般不需要改动，直接调用已封装的函数即可。
- `/src/html.tsx` 文件一般不需要改动，除非需要在输出的HTML加上自定义内容。
- `/src/index.ts` 在`pages`下所有的路由组件都需要在这个文件内`import`进来后定义路由，同时对这个文件导出结果进行追加。

::: warning 注意
如果没有特殊的需求，尽量不要改动项目的目录结构。
如果非要改动结构，请参考`package.json`的`config`字段进行相应改动。
:::

## 项目配置

项目的配置参数在`package.json`的`config`字段中定义，它的类型如下：

```ts
export interface TConfigs<T extends Record<string, unknown> = {}> {
  entries: {
    spa: string,
    client: string,
    server: string,
  },
  skips?: string[],
  rewrites?: Record<string, string>,
  templateStates?: T,
}
```

### entries

各端的入口文件路径配置地址。

::: warning 注意
基址都基于本项目路径。
:::

- `spa` 基于`SPA`模式下的入口文件
- `client` 基于`SSR`模式下的`client`端入口文件
- `server` 基于`SSR`模式下的`server`端入口文件

### skips

在SSR模式下，需要不处理的URL路径。在开发模式下，以下的路径是不需要我们来处理的，由`Vite`自动处理，所以我们需要跳过。

```ts
"skips": [
  "/@react-refresh",
  "/@id/vite/modulepreload-polyfill",
  "/@vite/client"
]
```

当然你也可以添加一些自己认为不需要处理的路径。

### rewrites

在SSR模式下，需要重写的URL路径规则。一般的，如果在收到`/index.html`的时候，意味着获取`/`路由，你需要在这里配置：

```ts
"rewrites": {
  "/index.html": "/"
}
```

如果有其他需要重写的路由，也在这里配置。

### templateStates

在任何模式下，生成HTML页面内容的时候都是基于`src/html.tsx`来生成的。
我们可以提供这里的一些额外的数据参数供渲染。

HTML组件内容如下

```tsx
import React from 'react';
import { Scripts, PreLoads, Css, THtmlProps } from '@codixjs/server';

export default function HTML(props: React.PropsWithChildren<THtmlProps<{}>>) {
  return <html lang="en">
    <head>
      <meta charSet="UTF-8" />
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Vite App</title>
      <Scripts dataSource={props.assets.headerScripts} />
      <PreLoads dataSource={props.assets.headerPreloadScripts}/>
      <Css dataSource={props.assets.headerCsses} />
    </head>
    <body>
      <div id="root">{props.children}</div>
      <Scripts dataSource={props.assets.bodyScripts} />
    </body>
  </html>
}
```

那么`THtmlProps<T>`中的`T`即为`templateStates`的数据。

## 创建新的页面及路由

我们需要根据以下步骤来创建：

1. 创建页面文件夹。文件夹都存放在`/src/pages`目录下。比如我们创建一个`welcome`页面，那么我们就创建以下的文件

- `/src/pages/welcome/index.tsx` 组件内容
- `/src/pages/welcome/index.module.less` 组件样式

> 一般的，组件和样式是同名处理，只是添加的后缀不一样。

- */src/pages/welcome/index.tsx*

```tsx
import React from 'react';
import styles from './index.module.less';
export default function Welcome() {
  return <div className={styles.bg}>Welcome, every one!</div>
}
```

- */src/pages/welcome/index.module.less*

```less
.bg{
  background-color: #f8f8f8;
}
```

2. 需要将此组件注册到系统内部。注册文件为`/src/index.ts`:

```ts {9,11}
import { Application, HistoryMode, withImport } from '@codixjs/codix';
import { Client, ClientProvider } from '@codixjs/fetch';
export default function(app: Application<HistoryMode>) {
  const client = new Client();
  if (typeof window !== 'undefined' && window.INITIALIZE_STATE) {
    client.initialize(window.INITIALIZE_STATE);
  }
  app.use(ClientProvider, { client });
  const welcome = app.bind('/welcome', ...withImport(() => import('./pages/welcome'), { fallback: 'loading...' }));
  return {
    welcome,
    client,
  }
}
```

以上使用了动态`import`方式导入，我们也可以使用常规的导入方式：

```ts {3,10,12}
import { Application, HistoryMode, withImport } from '@codixjs/codix';
import { Client, ClientProvider } from '@codixjs/fetch';
import WelcomePage from './pages/welcome';
export default function(app: Application<HistoryMode>) {
  const client = new Client();
  if (typeof window !== 'undefined' && window.INITIALIZE_STATE) {
    client.initialize(window.INITIALIZE_STATE);
  }
  app.use(ClientProvider, { client });
  const welcome = app.bind('/welcome', WelcomePage);
  return {
    welcome,
    client,
  }
}
```

::: tip 恭喜你
只需要简单的两步，我们就已经将路由绑定了。是不是很简单？
:::

## 使用无差别的异步数据流

系统提供了基于`Render-as-You-Fetch`方式的兼容`SPA`与`SSR`的异步数据流获取方式，需要使用到的是`@codixjs/fetch`库来支持。

```tsx {1,3,16}
import { useAsync } from '@codixjs/fetch';
function Welcome() {
  const { data, success, error, execute, loading } = useAsync('custom-id', () => {
    return new Promise<{ a: number }>((resolve, reject) => {
      setTimeout(() => resolve({
        a: Date.now()
      }), 5000);
    })
  })

  return <div className={styles.bg}>
    <span>Welcome, now Timestamp is {
      loading
        ? 'load'
        : success
        ? data.a
        : error.message
    }</span>
  </div>
}
```

> `useAsync`的回调内容，可以是任意的异步处理得到的结果，比如`ajax`获取等等...

这种数据获取方式也是被`React`官方推崇的方式。请大家尽量使用这种方式来获取数据。
至于在`useEffect`内获取数据的方式，这里不推荐。

## 页面级跳转方式

不论是`hashchange`模式还是`popstate`模式，系统做了统一的处理，包括`SSR`模式下的`301`和`302`跳转兼容。

`redirect` 与 `replace` 的区别在于：

- `redirect` 向浏览器历史堆栈种添加一条记录。
- `replace` 将当前浏览器的堆栈的当前节点替换。

接下来，一起看下具体的使用方式。

### redirect

系统提供的最底层的调用方式。

```ts
import { redirect } from '@codixjs/codix';
redirect('/project?id=2');
```

### replace

系统提供的最底层的调用方式。

```ts
import { replace } from '@codixjs/codix';
replace('/project?id=2');
```

### Path.redirect

通过具体的路由对象进行跳转。
在`/src/index.ts`种定义了很多路由，比如有如下的定义：

```ts
const project = app.bind<{ id: number }>('/project/:id(\\d+)', Component);
```

那么我们就可以通过以下的方式进行跳转

```ts
project.redirect({ id: 2 });
```

### Path.replace

通过具体的路由对象进行跳转。
在`/src/index.ts`种定义了很多路由，比如有如下的定义：

```ts
const project = app.bind<{ id: number }>('/project/:id(\\d+)', Component);
```

那么我们就可以通过以下的方式进行跳转

```ts
project.replace({ id: 2 });
```

### redirectRouter

同多确定`Path`路由的方式进行跳转。
在`/src/index.ts`种定义了很多路由，比如有如下的定义：

```ts
const project = app.bind<{ id: number }>('/project/:id(\\d+)', Component);
```

那么我们就可以通过以下的方式进行跳转

```ts
import { redirectRouter } from '@codixjs/codix';
redirectRouter(project, { id: 2 });
```

### replaceRouter

同多确定`Path`路由的方式进行跳转。
在`/src/index.ts`种定义了很多路由，比如有如下的定义：

```ts
const project = app.bind<{ id: number }>('/project/:id(\\d+)', Component);
```

那么我们就可以通过以下的方式进行跳转

```ts
import { replaceRouter } from '@codixjs/codix';
replaceRouter(project, { id: 2 });
```

### hook: usePath

通过一个统一的hooks集合进行选择性跳转。
在`/src/entries/spa.tsx`与`/src/entries/client.tsx`中都注入了`pathes`数据：

```tsx {2,7,11}
import React from 'react';
import createNewRouters from '../index';
import { Application, PopstateHistoryMode } from '@codixjs/codix';
import { createRoot } from 'react-dom/client';

const app = new Application(PopstateHistoryMode);
export const routers = createNewRouters(app);
const { Bootstrap } = app.build();
const react = createRoot(document.getElementById('root'));

react.render(<Bootstrap pathes={routers}>404 Not Found</Bootstrap>);
```

那么久可以通过hooks进行选择性跳转。

```tsx {3,4}
import { usePath } from '/src/hooks';
function Welcome() {
  const path = usePath('project');
  const onclick = () => path.redirect({ id: 2 });
  return <button onClick={onclick}>Jump page to other!</button>
}
```

## 自定义SSR内容输出

`/src/entries/server.ts` 的服务端渲染入口导出的是一个http的中间件。所以，用户可以将此中间件用于任何中间件的服务中，类似`express`与`koa`。
但是在输出HTML内容之前需要用户自己实现4个流程：

1. 将`client`端的`manifest`资源解析出`TAssets`类型。
1. 将`client`端的静态资源，通过静态资源中间件导出。
1. 使用[http-proxy-middleware](https://www.npmjs.com/package/http-proxy-middleware)来实现客户端请求的代理。
1. 将静态资源写入到`req.HTMLAssets`中。
1. 使用`/src/entries/server.ts`导入到服务中将内容输出。

> 具体代码可以参考项目的`server.js`文件

### 解析TAssets资源数据

```ts {2,4}
const path = require('path');
const { getAssets } = await import('@codixjs/vite');
const clientDictionary = path.resolve(__dirname, 'dist', 'ssr', 'client');
const assets: TAssets = await getAssets('src/entries/client.tsx', clientDictionary);
```

> 注意: 在没修改任何项目配置的时候， `src/entries/client.tsx` 是固定的，否则需要用户自己确定这个入口文件。

### 客户端资源中间件

```ts {2}
const serveStatic = require('serve-static');
app.use(serveStatic(clientDictionary));
```

### 使用代理中间件

```ts
const { createProxyMiddleware } = require('http-proxy-middleware');
app.use(createProxyMiddleware('/api', {
  target: 'https://api.china.cn',
  changeOrigin: true,
}))
```

### 输出文本内容

```ts {2,5}
const render = await import('./dist/ssr/server/server.mjs');
const runner = render.default.middleware;
// ...
app.all('*', (req, res, next) => {
  req.HTMLAssets = assets;
  req.HTMLStates = {};
  runner(req, res, next);
})
```