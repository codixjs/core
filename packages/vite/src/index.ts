import { TConfigs } from "./types";
import { createHTMLServer, resolveHTMLConfigs } from './html';
import { createDevelopmentServer } from './server';
import { SSR, KIND } from './mode';
import { createSPABuilder } from './spa.build';
import { createClientBuilder } from './client.build';
import { createServerBuilder } from './server.build';
import type { Plugin } from 'vite';

export default function createCodixServer<T extends Record<string, unknown> = {}>(options: TConfigs<T>) {
  const plugins: Plugin[] = [
    createHTMLServer(resolveHTMLConfigs(options)),
  ];

  if (SSR) {
    plugins.push(createDevelopmentServer(options))
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