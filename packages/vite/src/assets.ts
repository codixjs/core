import { TAssets, THeaderScript } from '@codixjs/server';
import { existsSync } from 'fs';
import { resolve } from 'path';

export async function getAssets(
  prefix: string, 
  inputClientFile: string, 
  outputClientDir: string, 
  manifest: any
): Promise<TAssets> {
  const headerScripts: THeaderScript[] = [];
  const headerPreloadScripts: string[] = [];
  const headerCsses: string[] = [];
  if (!existsSync(outputClientDir)) throw new Error('miss client output dictionary');
  if (!manifest[inputClientFile]) throw new Error('Not Found');
  headerScripts.push({
    type: 'module',
    crossOrigin: 'anonymous',
    src: formatPath(prefix, manifest[inputClientFile].file),
  });
  const imports = manifest[inputClientFile].imports || [];
  headerPreloadScripts.push(...imports.map((s: string) => {
    if (manifest[s]) {
      return formatPath(prefix, manifest[s].file);
    }
  }).filter(Boolean));
  const csses = manifest[inputClientFile].css || [];
  headerCsses.push(...csses.map((c: string) => {
    return formatPath(prefix, c);
  }))
  return {
    headerScripts,
    headerPreloadScripts,
    headerCsses,
  }
}

function formatPath(prefix: string, file: string) {
  return resolve(
    prefix,
    file.startsWith('/') 
      ? '.' + file
      : file
  )
}