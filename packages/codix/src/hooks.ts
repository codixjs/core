import { useContext } from 'react';
import { RequestContext } from './core';

export function useRequestQuery<T>(key: string, format?: (v: string | string[]) => T) {
  const request = useContext(RequestContext);
  if (!request) return null;
  const value = request.query[key];
  return format ? format(value) : value;
}

export function useRequestParam<T>(key: string, format?: (v: string) => T) {
  const request = useContext(RequestContext);
  if (!request) return null;
  const value = request.params[key];
  return format ? format(value) : value;
}

export function useRequestPath<T>(format?: (v: string) => T) {
  const request = useContext(RequestContext);
  if (!request) return null;
  const value = request.pathname;
  return format ? format(value) : value;
}

export function useRequestHash<T>(format?: (v: string) => T) {
  const request = useContext(RequestContext);
  if (!request) return null;
  const value = request.hash;
  return format ? format(value) : value;
}

export function useRequestHeader<T>(key: string, format?: (v: string) => T) {
  const request = useContext(RequestContext);
  if (!request) return null;
  const value = request.headers[key];
  return format ? format(value) : value;
}

export function useRequestState() {
  const request = useContext(RequestContext);
  if (!request) return null;
  return request.state;
}