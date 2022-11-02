export abstract class Exception extends Error {
  public readonly abstract code: string | number;
}