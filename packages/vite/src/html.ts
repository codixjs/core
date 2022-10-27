import { createServer } from 'vite';
import { existsSync } from 'fs';
import { resolve } from 'path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Plugin } from 'vite';
import type { FunctionComponent } from 'react';
import { TConfigs } from './types';
import { SSR } from './mode';

export function createHTMLServer(options: {
  html: string,
  props?: any,
}): Plugin {
  return {
    name: 'codix:html',
    async transformIndexHtml() {
      const htmlFile = resolve(process.cwd(), options.html);
      if (!existsSync(htmlFile)) throw new Error('cannot find html template:' + htmlFile);
      const currentEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      const server = await createServer();
      const render = await server.ssrLoadModule(htmlFile);
      const htmlComponent = render.default as FunctionComponent;
      const _html = renderToStaticMarkup(createElement(htmlComponent, options.props))
      await server.close();
      process.env.NODE_ENV = currentEnv;
      return _html;
    }
  }
}

export function resolveHTMLConfigs(options: TConfigs) {
  const htmlConfigs = {
    html: options.template,
    props: null,
  }

  if (SSR) {
    htmlConfigs.props = {
      bodyScripts: [
        {
          src: options.entries.spa,
          type: 'module'
        }
      ]
    }
  } else {
    htmlConfigs.props = {
      // headerScripts: [
      //   {
      //     src: undefined,
      //     type: 'module',
      //     content: `import RefreshRuntime from '/@react-refresh';RefreshRuntime.injectIntoGlobalHook(window);window.$RefreshReg$ = () => {};window.$RefreshSig$ = () => (type) => type;window.__vite_plugin_react_preamble_installed__ = true`,
      //   }
      // ],
      bodyScripts: [
        {
          src: options.entries.client,
          type: 'module'
        }
      ]
    }
  }
  return htmlConfigs;
}