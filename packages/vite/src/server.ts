import { existsSync, statSync } from 'fs';
import { resolve } from 'path';
import type { Plugin, ViteDevServer } from 'vite';
import { ServerSiderRender, IncomingRequest } from '@codixjs/server';
import { resolveHTMLConfigs } from './html';
import { TConfigs } from './types';

export function createDevelopmentServer(options: TConfigs): Plugin {
  const file = resolve(process.cwd(), options.entries.server);
  if (!existsSync(file)) throw new Error('cannot find the ssr entry point:' + file);
  options.skips ||= [];
  options.rewrites ||= {};
  return {
    name: 'codix:ssr',
    apply: 'serve',
    configureServer(server: ViteDevServer) {
      server.middlewares.use(async (req, res, next) => {
        const root = server.config.root || process.cwd();
        const url = decodeURI(generateUrl(req.url));
        if (options.rewrites[url]) req.url = options.rewrites[url];
        if (options.skips.includes(url)) {
          console.log('[vite:codix:server:skip]', url);
          return next();
        }
        const _file = resolve(root, url.startsWith('/') ? '.' + url : url);
        if (existsSync(_file)) {
          const st = statSync(_file);
          if (st.isFile()) return next();
        }
        try {
          const renderer = await server.ssrLoadModule(file);
          if (typeof renderer.default !== 'object') return next();
          const result = renderer.default as ReturnType<typeof ServerSiderRender>;
          if (typeof result.middleware !== 'function') return next();
          const request = req as IncomingRequest;
          const props = resolveHTMLConfigs(options).props;
          request.HTMLAssets = props.assets;
          request.HTMLStates = props.state;
          result.middleware(request, res, (matched) => {
            if (!matched) return next();
          });
        } catch(e) {
          server.ssrFixStacktrace(e);
          res.statusCode = 500;
          res.end(e.message);
        }
      });
    }
  }
}

function generateUrl(url?: string): string {
  if (!url) {
    return '/'
  }
  // url with parameters
  if (url.indexOf('?') > 0) {
    return url.split('?')[0]
  }
  return url
}