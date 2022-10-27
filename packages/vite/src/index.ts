import { TConfigs } from "./types";
import { createHTMLServer, resolveHTMLConfigs, compileHTML } from './html';
import { createDevelopmentServer } from './server';
import { SSR, KIND } from './mode';
import { createSPABuilder } from './spa.build';
import { createClientBuilder } from './client.build';
import { createServerBuilder } from './server.build';
import { Plugin } from 'vite';
import { writeFileSync } from 'fs';
import { resolve } from 'path';

export default async function createCodixServer<T extends Record<string, unknown> = {}>(options: TConfigs<T>) {
  if (!!KIND) {
    const html = await compileHTML(resolveHTMLConfigs(options));
    const indexFile = resolve(process.cwd(), 'index.html');
    writeFileSync(indexFile, html, 'utf8');
  }
  return () => {
    const plugins: Plugin[] = [];
    if (SSR) {
      plugins.push(createDevelopmentServer(options));
    } else {
      if (!KIND) {
        plugins.push(createHTMLServer(resolveHTMLConfigs(options)));
      }
    }

    switch (KIND) {
      case 'client':
        plugins.push(createClientBuilder(options.entries.client));
        break;
      case 'server':
        plugins.push(createServerBuilder(options.entries.server));
        break;
      default: 
        plugins.push(createSPABuilder());
    }

    return plugins;
  }
}