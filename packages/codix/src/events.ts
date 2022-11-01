import mitt from 'mitt';
export const eventEmitter = mitt<{
  redirect: string,
  replace: string,
  change: undefined,
}>();

export function redirect(url: string, querys?: Record<string, string>) {
  url = url + formatQueries(querys);
  eventEmitter.emit('redirect', url);
}

export function replace(url: string, querys?: Record<string, string>) {
  url = url + formatQueries(querys);
  eventEmitter.emit('replace', url);
}

export function formatQueries(querys: Record<string, string> = {}) {
  const qs = new URLSearchParams(querys).toString();
  return qs ? '?' + qs : '';
}