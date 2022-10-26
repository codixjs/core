export abstract class Exception extends Error {
  public readonly abstract httpCode: number;
  public readonly abstract url: string;
}

export class RedirectException extends Exception {
  public readonly httpCode = 302;
  constructor(public readonly url: string) {
    super('302 redirect:' + url);
  }
}

export class ReplaceException extends Exception {
  public readonly httpCode = 301;
  constructor(public readonly url: string) {
    super('301 redirect:' + url);
  }
}