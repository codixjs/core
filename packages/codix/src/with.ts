import React, { FunctionComponent, Suspense } from 'react';
import type { MiddlewareConpact } from './types';

export function withMiddleware<T extends object = {}>(component: FunctionComponent<T>, props?: T): MiddlewareConpact<T> {
  return {
    component, props,
  }
}

export function withSuspense<T extends object = {}>(component: FunctionComponent<T>, options: {
  fallback?: React.ReactNode,
  props?: T
} = {}) {
  return [
    withMiddleware(Suspense, { fallback: options.fallback }),
    withMiddleware(component, options.props),
  ] as const;
}

type Importor = Parameters<typeof React.lazy>[0]
export function withImport<T extends object = {}>(callback: Importor, options: {
  fallback?: React.ReactNode,
  props?: T
} = {}) {
  const component = React.lazy(callback);
  return withSuspense(component, options);
}