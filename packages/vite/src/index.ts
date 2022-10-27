import { TConfigs } from "./types";
import { createHTMLServer, resolveHTMLConfigs } from './html';
import { createDevelopmentServer } from './server';
import { SSR, KIND } from './mode';
import { createSPABuilder } from './spa.build';
import { createClientBuilder } from './client.build';
import { createServerBuilder } from './server.build';
import { Plugin } from 'vite';

export default async function createCodixServer<T extends Record<string, unknown> = {}>(options: TConfigs<T>) {
  const plugins: Plugin[] = [];
  if (SSR) {
    plugins.push(createDevelopmentServer(options));
  } else {
    plugins.push(createHTMLServer(resolveHTMLConfigs(options)));
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