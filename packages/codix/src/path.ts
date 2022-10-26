import { compile, PathFunction } from 'path-to-regexp';
import { redirect, replace } from './events';
export class Path<T extends object = {}> {
  private readonly toPath: PathFunction<T>;
  constructor(url: string) {
    this.toPath = compile(url, { encode: encodeURIComponent });
  }

  public toString(params?: T) {
    params = params || {} as T;
    return this.toPath(params);
  }
}

export function redirectRouter<T extends object>(object: Path<T>, props?: T) {
  const url = object.toString(props);
  return redirect(url);
}

export function replaceRouter<T extends object>(object: Path<T>, props?: T) {
  const url = object.toString(props);
  return replace(url);
}