import { HistoryMode } from '@codixjs/codix';
import { RedirectException, ReplaceException } from './exception';

export class ServerSideHistoryMode extends HistoryMode {
  public getLocation(): string {
    return;
  }

  public listen(callback: () => void): () => void {
    return () => {}
  }

  public redirect(url: string) {
    throw new RedirectException(url);
  }

  public replace(url: string) {
    throw new ReplaceException(url);
  }
}