import { TConfigs } from "./types";
import { createHTMLServer, resolveHTMLConfigs } from './html';
import { createDevelopmentServer } from './server';
import { SSR, KIND } from './mode';
import { createSPABuilder } from './spa.build';
import { createClientBuilder } from './client.build';
import { createServerBuilder } from './server.build';
import type { Plugin } from 'vite';

export default function createCodixServer<T extends Record<string, unknown> = {}>(options: TConfigs<T>) {
  const plugins: Plugin[] = [];

  // console.log('项目环境变量：')
  // console.log('项目模式：', SSR ? 'SSR' : 'SPA')
  // console.log('编译模式：', KIND ? KIND.toUpperCase() : 'SPA');

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