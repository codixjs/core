import { TAssets, THeaderScript } from '@codixjs/server';
import { existsSync } from 'fs';
import { resolve } from 'path';
// eg.
// getAssets('src/entries/client.tsx', '/Users/evioshen/code/github/pjblog/test/dist/ssr/client');
export async function getAssets(prefix: string, inputClientFile: string, outputClientDir: string): Promise<TAssets> {
  const headerScripts: THeaderScript[] = [];
  const headerPreloadScripts: string[] = [];
  const headerCsses: string[] = [];
  if (!existsSync(outputClientDir)) throw new Error('miss client output dictionary');
  const manifest_file = resolve(outputClientDir, 'manifest.json');
  if (!existsSync(manifest_file)) throw new Error('miss client manifest.json');
  const manifest = await getManifest(manifest_file);
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

async function getManifest(path: string) {
  try {
    return require(path);
  } catch (e) {
    const result = await import(path, { assert: { type: 'json' } });
    return result.default;
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