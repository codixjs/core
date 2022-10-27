import { TAssets, THeaderScript } from '@codixjs/server';
import { OUTPUT_SSR_CLIENT_DICTIONARY } from './mode';
import { existsSync } from 'fs';
import { resolve } from 'path';
// file: options.client short address
export function getAssets(file: string): TAssets {
  const headerScripts: THeaderScript[] = [];
  const headerPreloadScripts: string[] = [];
  const headerCsses: string[] = [];
  const clientDir = OUTPUT_SSR_CLIENT_DICTIONARY;
  if (!existsSync(clientDir)) throw new Error('miss client output dictionary');
  const manifest_file = resolve(clientDir, 'manifest.json');
  if (!existsSync(manifest_file)) throw new Error('miss client manifest.json');
  const manifest = require(manifest_file);
  file = file.startsWith('/') ? file.substring(1) : file;
  if (!manifest[file]) throw new Error('Not Found');
  headerScripts.push({
    type: 'module',
    crossOrigin: 'anonymous',
    src: manifest[file].file.startsWith('/') ? manifest[file].file : '/' + manifest[file].file,
  });
  const imports = manifest[file].imports || [];
  headerPreloadScripts.push(...imports.map((s: string) => {
    if (manifest[s]) {
      return manifest[s].file.startsWith('/') ? manifest[s].file : '/' + manifest[s].file;
    }
  }).filter(Boolean));
  const csses = manifest[file].css || [];
  headerCsses.push(...csses.map((c: string) => {
    return c.startsWith('/') ? c : '/' + c;
  }))
  return {
    headerScripts,
    headerPreloadScripts,
    headerCsses,
  }
}