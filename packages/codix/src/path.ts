import { compile, PathFunction } from 'path-to-regexp';
import { FunctionComponent } from 'react';
import { Application } from './core';
import { redirect, replace } from './events';
import { HistoryMode } from './mode';
import { MiddlewareConpact } from './types';
export class Path<T extends object = {}> {
  private readonly toPath: PathFunction<T>;
  constructor(
    public readonly url: string, 
    private readonly application: Application<HistoryMode>
  ) {
    this.toPath = compile(url, { encode: encodeURIComponent });
  }

  public toString(params?: T) {
    params = params || {} as T;
    return this.toPath(params);
  }

  public use(...components: (MiddlewareConpact | FunctionComponent)[]) {
    return this.application.useComponents<T>(this, ...components);
  }

  public redirect(
    props?: T, 
    querys?: Record<string, string>
  ): void {
    return redirectRouter<T>(this, props, querys);
  }

  public replace(
    props?: T, 
    querys?: Record<string, string>
  ): void {
    return replaceRouter<T>(this, props, querys);
  }
}

export function redirectRouter<T extends object>(
  object: Path<T>, 
  props?: T, 
  querys?: Record<string, string>
) {
  const url = object.toString(props);
  return redirect(url, querys);
}

export function replaceRouter<T extends object>(
  object: Path<T>, 
  props?: T, 
  querys?: Record<string, string>
) {
  const url = object.toString(props);
  return replace(url, querys);
}