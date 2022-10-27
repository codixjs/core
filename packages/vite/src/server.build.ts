import type { Plugin } from 'vite';
import { OUTPUT_SSR_DICTIONARY } from './mode';
import { TConfigs } from './types';
import { resolve } from 'path';
export function createServerBuilder(file: string): Plugin {
  return {
    name: 'codix:build:ssr:server',
    config(configs) {
      configs.build.outDir = OUTPUT_SSR_DICTIONARY;
      configs.build.ssr = resolve(process.cwd(), file);
      if (configs.build.rollupOptions?.manualChunks) {
        delete configs.build.rollupOptions.manualChunks;
      }
    }
  }
}