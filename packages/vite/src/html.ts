import { createServer } from 'vite';
import { existsSync } from 'fs';
import { resolve } from 'path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Plugin } from 'vite';
import { TConfigs } from './types';
import { SSR } from './mode';
import { THtmlProps, ServerSiderRender } from '@codixjs/server';

export function createHTMLServer<T extends Record<string, unknown> = {}>(options: {
  serverRenderFile: string,
  props?: THtmlProps<T>,
}): Plugin {
  return {
    name: 'codix:html',
    async transformIndexHtml() {
      const serverFile = resolve(process.cwd(), options.serverRenderFile);
      if (!existsSync(serverFile)) throw new Error('cannot find server render file:' + serverFile);
      const currentEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      const server = await createServer();
      const render = await server.ssrLoadModule(serverFile);
      const htmlComponent = render.default as ReturnType<typeof ServerSiderRender>;
      const _html = renderToStaticMarkup(createElement(htmlComponent.html, options.props))
      await server.close();
      process.env.NODE_ENV = currentEnv;
      return _html;
    }
  }
}

// headerScripts: [
//   {
//     src: undefined,
//     type: 'module',
//     content: `import RefreshRuntime from '/@react-refresh';RefreshRuntime.injectIntoGlobalHook(window);window.$RefreshReg$ = () => {};window.$RefreshSig$ = () => (type) => type;window.__vite_plugin_react_preamble_installed__ = true`,
//   }
// ],
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
          src: options.entries.client,
          type: 'module'
        }
      ]
    }
  } else {
    htmlConfigs.props.assets = {
      bodyScripts: [
        {
          src: options.entries.spa,
          type: 'module'
        }
      ]
    }
  }
  return htmlConfigs;
}