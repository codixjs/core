import type { Plugin } from 'vite';
import { OUTPUT_SSR_CLIENT_DICTIONARY } from './mode';
import { resolve } from 'path';
export function createClientBuilder(file: string): Plugin {
  return {
    name: 'codix:build:ssr:client',
    config(configs) {
      configs.build.outDir = OUTPUT_SSR_CLIENT_DICTIONARY;
      configs.build.manifest = true;
      if (!configs.build.rollupOptions) configs.build.rollupOptions = {};
      if (!configs.build.rollupOptions.input) configs.build.rollupOptions.input = {};
      configs.build.rollupOptions.input = {
        index: resolve(process.cwd(), file),
      }
    }
  }
}