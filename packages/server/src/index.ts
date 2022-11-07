import { createElement, Fragment } from 'react';
import { ServerSideHistoryMode } from './mode';
import { LocationException } from './exception';
import { Application } from '@codixjs/codix';
import { renderToPipeableStream, RenderToPipeableStreamOptions } from 'react-dom/server';
import { ServerSiderRenderOptions, IncomingRequest } from './types';
import type { IncomingMessage, ServerResponse } from 'http';

export * from './scripts';
export * from './preloads';
export * from './css';
export * from './types';
export * from './exception';
export * from './mode';

export function ServerSiderRender<T extends Record<string, any> = {}, U extends Record<string, unknown> = {}>(options: ServerSiderRenderOptions<T, U>) {
  return {
    html: options.html,
    prefix: options.prefix,
    middleware: (req: IncomingRequest<U>, res: ServerResponse, next: (mached: boolean) => void) => {
      const app = new Application(ServerSideHistoryMode, options.prefix || '/');
      app.host = req.headers.host;
      const injectResults = options.routers(app);
  
      let url = formatRequestLocation(req);
      if (typeof options.urlFilter === 'function') {
        url = options.urlFilter(url);
      }
  
      if (!app.match(url)) return next(false);
      
      let errored = false;
      const configs: RenderToPipeableStreamOptions = {
        onShellReady() {
          res.statusCode = 200;
          res.setHeader("Content-type", "text/html; charset=utf-8");
          stream.pipe(res);
        },
        onError(e: LocationException) {
          switch (e.code) {
            case 301:
            case 302:
              res.setHeader('Location', e.url);
              res.setHeader('Content-type', 'text/html; charset=utf-8');
              res.statusCode = e.code;
              res.end(e.message);
              break;
            default:
              res.statusCode = typeof e.code === 'number' ? e.code : 500;
              res.end(e.message);
          }
          errored = true;
          next(true);
        },
        onAllReady() {
          if (typeof options.onAllReady === 'function' && !errored) {
            options.onAllReady(req, res, injectResults);
          }
          if (!errored) next(true);
        }
      }
      const headers = req.headers as Record<string, string>;
      const { RunTime } = app.build();
      const page = createElement(RunTime, { href: url, headers, pathes: injectResults }, createElement(Fragment));
      const root = createElement(options.html, { assets: req.HTMLAssets, state: req.HTMLStates }, page);
      const stream = renderToPipeableStream(root, configs);
    }
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