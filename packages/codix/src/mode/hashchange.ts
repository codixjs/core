import { HistoryMode } from './implements';

export class HashChangeHistoryMode extends HistoryMode {
  private format(hash: string) {
    if (!hash) return '/';
    return hash.startsWith('#') ? hash.substring(1) : hash;
  }

  public getLocation(): string {
    return window.location.origin + this.format(window.location.hash);
  }

  public listen(callback: () => void) {
    window.addEventListener('hashchange', callback);
    return () => window.removeEventListener('hashchange', callback);
  }

  public redirect(url: string): void {
    window.location.hash = url;
  }

  public replace(path: string): void {
    const i = window.location.href.indexOf('#');
    window.location.replace(
      window.location.href.slice(0, i >= 0 ? i : 0) + '#' + path
    )
  }
}