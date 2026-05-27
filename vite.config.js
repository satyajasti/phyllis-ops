import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

function localApiPlugin() {
  return {
    name: 'local-vercel-api',
    configureServer(server) {
      server.middlewares.use('/api', async (req, res, next) => {
        try {
          const requestUrl = new URL(req.url || '/', 'http://localhost');
          const route = requestUrl.pathname.replace(/^\/+/, '');
          const supported = new Set(['auth', 'employees', 'zoho', 'roles', 'shifts', 'price-check']);
          if (!supported.has(route)) return next();

          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            try {
              req.query = Object.fromEntries(requestUrl.searchParams.entries());
              req.body = body ? JSON.parse(body) : {};

              res.status = code => {
                res.statusCode = code;
                return res;
              };
              res.json = data => {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(data));
              };

              const mod = await import(`./api/${route}.js?dev=${Date.now()}`);
              await mod.default(req, res);
            } catch (error) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: error.message }));
            }
          });
        } catch {
          next();
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), localApiPlugin()],
})
