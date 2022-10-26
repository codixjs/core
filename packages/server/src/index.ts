import { FunctionComponent, createElement, Fragment } from 'react';
import { IncomingMessage, ServerResponse } from 'http';
import { ServerSideHistoryMode } from './mode';
import { Exception } from './exception';
import { Application, HistoryMode } from '@codixjs/codix';
import { renderToPipeableStream, RenderToPipeableStreamOptions } from 'react-dom/server';

export interface THeaderScript {
  type?: string;
  crossOrigin?: 'anonymous' | 'use-credentials';
  src: string;
}
export interface TAssets {
  headerScripts?: (string | THeaderScript)[];
  headerPreloadScripts?: string[];
  headerCsses?: string[];
  bodyScripts?: (string | THeaderScript)[];
}
export interface THtmlProps<T extends Record<string, unknown>> {
  assets: TAssets,
  state?: T
}
export interface ServerSiderRenderOptions<T, U extends Record<string, unknown>> {
  html: FunctionComponent<THtmlProps<U>>,
  routers: (app: Application<HistoryMode>) => T, 
  states: () => Promise<THtmlProps<U>>,
  onAllReady?: (req: IncomingMessage, res: ServerResponse, object: T) => void; 
  urlFilter?: (url: string) => string,
}

export function ServerSiderRender<T, U extends Record<string, unknown>>(options: ServerSiderRenderOptions<T, U>) {
  return (req: IncomingMessage, res: ServerResponse, next: Function) => {
    const app = new Application(ServerSideHistoryMode);
    const injectResults = options.routers(app);

    let url = formatRequestLocation(req);
    if (typeof options.urlFilter === 'function') {
      url = options.urlFilter(url);
    }

    if (!app.match(url)) return next();
    options.states()
      .then(data => {
        let errored = false;
        const configs: RenderToPipeableStreamOptions = {
          onShellReady() {
            res.statusCode = 200;
            res.setHeader("Content-type", "text/html; charset=utf-8");
            stream.pipe(res);
          },
          onError(e: Exception) {
            switch (e.httpCode) {
              case 301:
              case 302:
                res.setHeader('Location', e.url);
                res.setHeader('Content-type', 'text/html; charset=utf-8');
                res.statusCode = e.httpCode;
                res.end(e.message);
                break;
              default:
                res.statusCode = 500;
                res.end(e.message);
            }
            errored = true;
          },
          onAllReady() {
            if (typeof options.onAllReady === 'function' && !errored) {
              options.onAllReady(req, res, injectResults);
            }
          }
        }
        const headers = req.headers as Record<string, string>;
        const { RunTime } = app.build();
        const page = createElement(RunTime, { href: url, headers }, createElement(Fragment));
        const root = createElement(options.html, data, page);
        const stream = renderToPipeableStream(root, configs);
      })
      .catch((e: any) => {
        res.statusCode = 500;
        res.end(e.message);
      })
  }
}

function formatRequestLocation(req: IncomingMessage) {
  const host = req.headers.host || '127.0.0.1';
  // @ts-ignore
  const originalUrl = req.originalUrl as string;
  const _url = originalUrl || req.url;
  const url = 'http://' + host + _url;
  return url;
}