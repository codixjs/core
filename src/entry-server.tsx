import { ServerSiderRender } from '../packages/server/dist';
import { Html } from './html';
import { createRouters } from './routers';

export default ServerSiderRender({
  html: Html,
  routers: createRouters,
  states: async () => ({
    assets: {},
    state: {}
  }),
  onAllReady(req, res, obj) {
    const client = obj.client;
    res.write(`<script>window.INITIALIZE_STATE = ${JSON.stringify(client.toJSON())}</script>`);
  }
})