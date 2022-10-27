import { existsSync } from 'fs';
import { resolve } from 'path';
import type { Plugin, ViteDevServer } from 'vite';

export function createDevelopmentServer(options: {
  input: string,
  skips?: string[],
  rewrites?: Record<string, string>,
}): Plugin {
  const file = resolve(process.cwd(), options.input);
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
        if (existsSync(resolve(root, url.startsWith('/') ? '.' + url : url))) return next();
        try {
          const renderer = await server.ssrLoadModule(file);
          if (typeof renderer.default !== 'function') return next();
          renderer.default(req, res, next);
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