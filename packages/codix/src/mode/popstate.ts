import { HistoryMode } from './implements';
import { eventEmitter } from '../events';

export class PopstateHistoryMode extends HistoryMode {
  public getLocation(): string {
    return window.location.href;
  }

  public listen(callback: () => void) {
    window.addEventListener('popstate', callback);
    return () => window.removeEventListener('popstate', callback);
  }

  public redirect(url: string): void {
    window.history.pushState(null, null, url);
    eventEmitter.emit('change');
  }

  public replace(url: string): void {
    window.history.replaceState(null, null, url);
    eventEmitter.emit('change');
  }
}