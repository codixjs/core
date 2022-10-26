import mitt from 'mitt';
export const eventEmitter = mitt<{
  redirect: string,
  replace: string,
  change: undefined,
}>();

export function redirect(url: string) {
  eventEmitter.emit('redirect', url);
}

export function replace(url: string) {
  eventEmitter.emit('replace', url);
}