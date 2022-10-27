import { createElement, Fragment } from 'react';
import { IncomingMessage, ServerResponse } from 'http';
import { ServerSideHistoryMode } from './mode';
import { Exception } from './exception';
import { Application } from '@codixjs/codix';
import { renderToPipeableStream, RenderToPipeableStreamOptions } from 'react-dom/server';
import { ServerSiderRenderOptions, IncomingRequest } from './types';

export * from './scripts';
export * from './preloads';
export * from './css';
export * from './types';
export * from './exception';
export * from './mode';
export function ServerSiderRender<T, U extends Record<string, unknown> = {}>(options: ServerSiderRenderOptions<T, U>) {
  return {
    html: options.html,
    middleware: (req: IncomingRequest<U>, res: ServerResponse, next: Function) => {
      const app = new Application(ServerSideHistoryMode);
      const injectResults = options.routers(app);
  
      let url = formatRequestLocation(req);
      if (typeof options.urlFilter === 'function') {
        url = options.urlFilter(url);
      }
  
      if (!app.match(url)) return next();
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