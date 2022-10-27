import { resolve } from 'path';

export const SSR = process.env.SSR === 'true';
export const KIND = process.env.KIND as 'spa' | 'client' | 'server';

export const OUTPUT_SPA_DICTIONARY = resolve(process.cwd(), 'dist', 'spa');
export const OUTPUT_SSR_CLIENT_DICTIONARY = resolve(process.cwd(), 'dist', 'ssr', 'client');
export const OUTPUT_SSR_SERVER_DICTIONARY = resolve(process.cwd(), 'dist', 'ssr', 'server');