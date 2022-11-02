import { Exception } from '@codixjs/codix';

export abstract class LocationException extends Exception {
  public readonly abstract url: string;
}

export class RedirectException extends LocationException {
  public readonly code = 302;
  constructor(public readonly url: string) {
    super('302 redirect:' + url);
  }
}

export class ReplaceException extends LocationException {
  public readonly code = 301;
  constructor(public readonly url: string) {
    super('301 redirect:' + url);
  }
}