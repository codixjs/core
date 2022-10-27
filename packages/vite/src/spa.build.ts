import type { Plugin } from 'vite';
import { OUTPUT_SPA_DICTIONARY } from './mode';
export function createSPABuilder(): Plugin {
  return {
    name: 'codix:build:spa',
    config(configs) {
      configs.build.outDir = OUTPUT_SPA_DICTIONARY;
    }
  }
}