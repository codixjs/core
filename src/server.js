const express = require('express');
const {createServer} = require('vite');

async function bootstrap() {
  const app = express();
  const vite = await createServer({
    server: { 
      middlewareMode: 'ssr',
      proxy: {
        '/micro': {
          changeOrigin: true,
          target: 'http://api.baizhun.cn'
        }
      }
    }
  })
  
  app.use(vite.middlewares);
  
  app.use('*', async (req, res, next) => {
    try {
      const render = await vite.ssrLoadModule('/src/entry-server.tsx')
      render.default(req, res, next);
    } catch (e) {
      vite.ssrFixStacktrace(e)
      console.error(e)
      res.status(500).end(e.message)
    }
  })
  
  app.listen(8000, () => {
    console.log('http://127.0.0.1:8000')
  })
}


bootstrap();