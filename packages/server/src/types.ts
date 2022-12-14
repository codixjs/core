import { FunctionComponent } from 'react';
import { Application, HistoryMode } from '@codixjs/codix';
import { IncomingMessage } from 'http';
import { PassThrough } from 'stream';

export interface THeaderScript {
  type?: string;
  crossOrigin?: 'anonymous' | 'use-credentials';
  src: string;
  content?: string;
}
export interface TAssets {
  headerScripts?: (string | THeaderScript)[];
  headerPreloadScripts?: string[];
  headerCsses?: string[];
  bodyScripts?: (string | THeaderScript)[];
}
export interface THtmlProps<T extends Record<string, unknown> = {}> {
  assets: TAssets,
  state?: T
}
export interface ServerSiderRenderOptions<T, U extends Record<string, unknown> = {}> {
  prefix?: string,
  html: FunctionComponent<THtmlProps<U>>,
  routers: (app: Application<HistoryMode>) => T, 
  onAllReady?: (stream: PassThrough, object: T) => void; 
  urlFilter?: (url: string) => string,
}

export type THTML<T extends Record<string, unknown> = {}> = FunctionComponent<THtmlProps<T>>;

export interface IncomingRequest<T extends Record<string, unknown> = {}> extends IncomingMessage {
  HTMLAssets?: TAssets,
  HTMLStates?: T
}