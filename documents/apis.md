---
sidebar: auto
sidebarDepth: 2
next: false
prev: guide.md
---

# APIS

官方提供的架构模块如下：

- [@codixjs/codix](https://github.com/codixjs/core/tree/master/packages/codix) 核心框架代码
- [@codixjs/router](https://github.com/codixjs/core/tree/master/packages/router) 路由管理控制模块
- [@codixjs/fetch](https://github.com/codixjs/core/tree/master/packages/fetch) 支持`SPA`与`SSR`无差异的异步数据渲染模块
- [@codixjs/server](https://github.com/codixjs/core/tree/master/packages/server) 服务端渲染核心代码
- [@codixjs/vite](https://github.com/codixjs/core/tree/master/packages/vite) `Vite`的开发及编译插件兼容模块

> 我们将对每个模块进行API的详细讲解。

## @codixjs/codix

`Codixjs`核心架构。

### Modes

系统一共分为两种模式：

- `hashchange` 传统的hash浏览器模式
- `popstate` 新的HTML5的浏览器模式

它们的统一结构实现：

```ts
abstract class HistoryMode {
  public abstract getLocation(): string;
  public abstract listen(callback: () => void): () => void;
  public abstract redirect(url: string): void;
  public abstract replace(url: string): void;
}
```

如果需要实现一种新的模式，需要实现已上的类。

比如：

```ts
import { HistoryMode } from '@codixjs/codix';
import { RedirectException, ReplaceException } from './exception';
export class NewHistoryMode extends HistoryMode {
  public getLocation(): string {}
  public listen(callback: () => void): () => void {}
  public redirect(url: string) {}
  public replace(url: string) {}
}
```

- `getLocation` 告诉系统如何获取当前的URL路径。
- `listen` 告诉系统如何监听浏览器的URL变化，返回一个取消监听的方法。
- `redirect` 告诉系统如何进行redirect跳转。
- `replace` 告诉系统如何进行replace跳转。

### Application

`Codixjs`核心类，用于路由的分发和匹配。它的定义如下：

**Arguments**

- `mode: HistoryMode` 需要确定使用的模式，每个模式都继承自 `HistoryMode`。
- `prefix: string` 项目URL前缀。默认为`/`。

**Returns**

返回一个`Application`对象。


```ts {2}
import { Application, PopstateHistoryMode } from '@codixjs/codix';
const app = new Application(PopstateHistoryMode, '/project');
```

### Middlewares

为应用添加新的全局中间件组件。每个页面都会经过这些中间件来包裹。

**Arguments**

- `component: React.FunctionComponent<React.PropsWithChildren<T>>` 组件。
- `props: T` 组件渲染时候用到props数据。

**Returns**

- `this: Application` 返回Application对象。

```tsx
import React from 'react';
function SomeMiddleware(props: React.PropsWithChildren<{ a: number }>) {
  return <div>{props.children}</div>
}
app.use(SomeMiddleware, { a: 100 });
```

### Path

`Path`对象是一个用于编译URL的对象，通过`path-to-regexp`模块实现。
定义路由方式：

```ts
const path = app.path('/project/:id(\\d+)');
path.use(...Components);
```

- `app.path(id: string): Path` 定义路由
- `path.use(...components: React.FunctionComponent[]): Path` 设置路由

系统还有一个聚合方法：

```ts
application.bind<T extends object = {}>(
  path: string, 
  ...components: (MiddlewareConpact | FunctionComponent)[]
): Path<T>
```

所以以上的方法可以简化为：

```ts
const path = app.bind<{ id: number }>('/project/:id(\\d+)', ...Components);
```

#### Path.toString

获取具体的URL字符串

```ts
const path = app.path('/project/:id(\\d+)');
path.toString({ id: 2 });
// /project/2
```

### With

用于在路由中间件上包裹特殊的使用方式，我们约定通过`with`前缀定。

```ts
app.bind(
  '/',
  withMiddleware(A, { a: 100 }),
  ...withSuspense(B, { fallback: 'loading...', props: { a: 200 } }),
  ...withImport(C, { fallback: 'loading...' })
)
```

目前有三种：

**withMiddleware**

使用特定props的组件中间件包裹

```ts
withMiddleware<T extends object = {}>(component: FunctionComponent<T>, props?: T): MiddlewareConpact<T>
```

**withSuspense**

使用`Suspense`包裹组件

```ts
withSuspense<T extends object = {}>(component: FunctionComponent<T>, options?: {
  fallback?: React.ReactNode;
  props?: T;
}): readonly [MiddlewareConpact<React.SuspenseProps>, MiddlewareConpact<T>]
```

**withImport**

使用动态`import`加载组件

```ts
type Importor = Parameters<typeof React.lazy>[0]
withImport<T extends object = {}>(callback: Importor, options?: {
  fallback?: React.ReactNode;
  props?: T;
}): readonly [MiddlewareConpact<React.SuspenseProps>, MiddlewareConpact<any>]
```

### Hooks

`codixjs`提供很多hooks供用户使用，用于处理request请求或者其他能力。

#### useRequestQuery

获取URL连接上的`query`参数，并格式化

**Arguments**

- `key: string` 参数名
- `format?: (v: string | string[]) => T`

```ts
import { useRequestQuery } from '@codixjs/coidx';
// /prject?id=2
const id = useRequestQuery('id', Number);
// 2
```

#### useRequestParam

获取URL连接上的`path`参数，并格式化

**Arguments**

- `key: string` 参数名
- `format?: (v: string | string[]) => T`

```ts
import { useRequestParam } from '@codixjs/coidx';
// /project/:id(\\d+) -> /project/2
const id = useRequestParam('id', Number);
// 2
```

#### useRequestPath

获取URL的pathname数据，并格式化

**Arguments**

- `format?: (v: string | string[]) => T`

```ts
import { useRequestPath } from '@codixjs/coidx';
// /project/abc/test
const id = useRequestPath((u) => u + '/2');
// /project/abc/test/2
```

#### useRequestHash

获取URL连接上的`hash`参数，并格式化

**Arguments**

- `format?: (v: string | string[]) => T`

```ts
import { useRequestHash } from '@codixjs/coidx';
// /project/2#abc
const id = useRequestHash(x => x + 'e');
// abce
```

#### useRequestHeader

在`SSR`模式下，返回请求的所有headers中的某个属性值

**Arguments**

- `key: string` 参数名
- `format?: (v: string | string[]) => T`

```ts
import { useRequestHeader } from '@codixjs/coidx';
// {'x-powered': 99}
const id = useRequestHeader('x-powered', Number);
// 99
```

#### useRequestState

在`SSR`模式下，返回请求的所有state中的某个属性值

**Arguments**

- `key: string` 参数名
- `format?: (v: string | string[]) => T`

```ts
import { useRequestState } from '@codixjs/coidx';
// {'powered': 99}
const id = useRequestState('powered', Number);
// 99
```

## @codixjs/fetch

异步数据流获取方式，支持`Render-as-You-Fetch`。

