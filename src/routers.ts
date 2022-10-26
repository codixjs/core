import { Application, HistoryMode, withImport } from '../packages/codix/dist';
import { Client, ClientProvider } from '../packages/fetch/dist';
export function createRouters(app: Application<HistoryMode>) {
  const client = new Client();
  // @ts-ignore
  if (typeof window !== 'undefined' && window.INITIALIZE_STATE) {
    // @ts-ignore
    client.initialize(window.INITIALIZE_STATE);
  }
  app.use(ClientProvider, { client });
  const welcome = app.bind('/', ...withImport(() => import('./welcome'), { fallback: 'loading...' }));
  return {
    welcome,
    client,
  }
}