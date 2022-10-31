import { createServer, ViteDevServer } from 'vite';
import { existsSync } from 'fs';
import { resolve, relative } from 'path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Plugin } from 'vite';
import { TConfigs } from './types';
import { KIND, SSR } from './mode';
import { THtmlProps, ServerSiderRender, THeaderScript } from '@codixjs/server';

const injectionScript: THeaderScript = {
  src: undefined,
  type: 'module',
  content: `
  import RefreshRuntime from '/@react-refresh';
  RefreshRuntime.injectIntoGlobalHook(window);
  window.$RefreshReg$ = () => {};
  window.$RefreshSig$ = () => (type) => type;
  window.__vite_plugin_react_preamble_installed__ = true`,
}

export function createHTMLServer<T extends Record<string, unknown> = {}>(options: {
  serverRenderFile: string,
  props?: THtmlProps<T>,
}): Plugin {
  let template: string = undefined;
  return {
    name: 'codix:html',
    enforce: 'pre',
    async load(id: string) {
      if (id === resolve(process.cwd(), 'index.html')) {
        return await compileHTMLWhenBuild(options);
      }
    },
    async transformIndexHtml() {
      if (KIND !== 'spa') {
        return template;
      }
    },
    async configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (template) return next();
        template = await compileHTMLWithServer(server, options.serverRenderFile, options.props);
        next();
    })
    }
  }
}

async function compileHTMLWithServer<T extends Record<string, unknown> = {}>(
  server: ViteDevServer, 
  serverFile: string, 
  props?: THtmlProps<T>,
) {
  const render = await server.ssrLoadModule(serverFile);
  const htmlComponent = render.default as ReturnType<typeof ServerSiderRender>;
  return renderToStaticMarkup(createElement(htmlComponent.html, props));
}

export async function compileHTMLWhenBuild<T extends Record<string, unknown> = {}>(options: {
  serverRenderFile: string,
  props?: THtmlProps<T>,
}) {
  const serverFile = resolve(process.cwd(), options.serverRenderFile);
  if (!existsSync(serverFile)) throw new Error('cannot find server render file:' + serverFile);
  console.log('Rendering Template ...');
  const server = await createServer({ mode: 'development' });
  await server.listen(9517);
  const html = await compileHTMLWithServer(server, serverFile, options.props);
  await server.close();
  return html;
}

export function resolveHTMLConfigs<T extends Record<string, unknown> = {}>(options: TConfigs<T>) {
  const htmlConfigs: { serverRenderFile: string, props: THtmlProps<T> } = {
    serverRenderFile: options.entries.server,
    props: {
      state: options.templateStates,
      assets: {}
    },
  }

  if (SSR) {
    htmlConfigs.props.assets = {
      bodyScripts: [
        {
          src: getAbsoluteURL(options.entries.client),
          type: 'module'
        }
      ]
    }
  } else {
    htmlConfigs.props.assets = {
      bodyScripts: [
        {
          src: getAbsoluteURL(options.entries.spa),
          type: 'module'
        }
      ]
    }
  }
  if (!KIND) {
    htmlConfigs.props.assets.headerScripts = [injectionScript];
  }
  return htmlConfigs;
}

function getAbsoluteURL(url: string) {
  const file = resolve(process.cwd(), url);
  const between = relative(process.cwd(), file);
  return between.startsWith('/') ? between : '/' + between;
}