import React, { createContext, createElement, Fragment, PropsWithChildren, useDeferredValue, useEffect, useMemo, useState } from 'react';
import { Router } from '@codixjs/router';
import { HistoryMode } from './mode';
import { Path } from './path';
import { eventEmitter } from './events';
import { withMiddleware } from './with';
import type { FunctionComponent } from 'react';
import type { RequestState, MiddlewareConpact } from './types';

export const RequestContext = createContext<RequestState>(null);
export class Application<H extends HistoryMode> {
  private readonly prefix: string;
  private readonly history: H;
  private readonly middlewares: MiddlewareConpact[] = [];
  public host: string = '';
  private readonly router = new Router({
    caseSensitive: true,
    ignoreTrailingSlash: true,
    maxParamLength: +Infinity,
  })

  constructor(history: { new(): H }, prefix: string = '/'){
    if (!prefix || !prefix.endsWith('/')) {
      throw new Error('prefix must end with `/`');
    }
    this.prefix = prefix;
    this.history = new history();
    eventEmitter.on('redirect', (url: string) => {
      this.history.redirect(this.encodePrefix(url));
    });
    eventEmitter.on('replace', (url: string) => {
      this.history.replace(this.encodePrefix(url));
    });
  }

  private decodePrefix(url: string) {
    url = url.startsWith(this.prefix) ? url.substring(this.prefix.length) : url;
    return !url.startsWith('/') ? '/' + url : url;
  }

  private encodePrefix(url: string) {
    return this.prefix + (url.startsWith('/') ? url.substring(1) : url);
  }

  private createNewContext(
    href: string, 
    headers: Record<string, string> = {}, 
    state: Record<string, string> = {},
    pathes: Record<string, any> = {},
  ) {
    const url = new URL(href);
    const query: Record<string, string> = {};
    for (const [key, value] of url.searchParams.entries()) query[key] = value;
    const pathname = this.decodePrefix(url.pathname);
    const matched = this.router.find(pathname);
    const context: RequestState = {
      hash: url.hash,
      pathname,
      query: query,
      params: matched ? matched.params : {},
      hostname: url.hostname,
      headers,
      state,
      pathes,
    }
    return {
      matched, context,
    }
  }

  public use<T extends object = {}>(component: FunctionComponent<T>, props?: T) {
    this.middlewares.push(withMiddleware(component, props));
    return this;
  }

  public path<T extends object = {}>(path: string): Path<T> {
    return new Path<T>(path, this);
  }

  public compile(middlewares: MiddlewareConpact[]) {
    let i = middlewares.length;
    let next: React.ReactNode = createElement(Fragment);
    while (i--) {
      next = createElement(middlewares[i].component, middlewares[i].props, next);
    }
    return next;
  }

  public useComponents<T extends object = {}>(pather: Path<T>, ...components: (MiddlewareConpact | FunctionComponent)[]) {
    if (!components.length) throw new Error('Bind function: components.length must be >= 1, now is ' + components.length);
    const _components = components.map(component => {
      if (typeof component === 'function') return withMiddleware(component);
      return component;
    });
    const createVirtualDispatcher = () => {
      return [...this.middlewares, ..._components].filter(Boolean);
    }
    this.router.on(pather.url, createVirtualDispatcher);
    return pather;
  }

  public bind<T extends object = {}>(path: string, ...components: (MiddlewareConpact | FunctionComponent)[]) {
    return this.path<T>(path).use(...components);
  }

  public match(url: string): boolean {
    const locate = new URL(url);
    return !!this.router.find(this.decodePrefix(locate.pathname));
  }

  public build() {
    const RunTime = (props: PropsWithChildren<{ 
      href: string, 
      headers?: Record<string, string>, 
      state?: Record<string, string> ,
      pathes?: Record<string, any>,
    }>) => {
      const { matched, context } = useMemo(() => {
        return this.createNewContext(props.href, props.headers, props.state, props.pathes);
      }, [props.href, props.headers, props.state]);
      return createElement(
        RequestContext.Provider, 
        { value: context }, 
        !!matched 
          ? this.compile(matched.handler())
          : props.children
      )
    }
    const Bootstrap = (props: React.PropsWithChildren<{ pathes?: Record<string, any> }>) => {
      const [href, setHref] = useState<string>(this.history.getLocation());
      const _href = useDeferredValue(href);
      useEffect(() => {
        const handler = () => setHref(this.history.getLocation());
        const _handler = () => eventEmitter.emit('change');
        const feedback = this.history.listen(_handler);
        eventEmitter.on('change', handler);
        return () => {
          eventEmitter.off('change', handler);
          feedback();
        }
      }, []);
      return createElement(RunTime, { href: _href, pathes: props.pathes }, props.children);
    }
    return {
      Bootstrap,
      RunTime,
    };
  }
}