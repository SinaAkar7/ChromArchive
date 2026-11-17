import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';
import metImageHandler from './api/met-image.ts';

function metImageProxyPlugin(): Plugin {
  const mount = (middlewares: {
    use: (
      path: string,
      fn: (
        req: Parameters<typeof metImageHandler>[0],
        res: Parameters<typeof metImageHandler>[1]
      ) => void
    ) => void;
  }) => {
    middlewares.use('/api/met-image', (req, res) => {
      void metImageHandler(req, res);
    });
  };

  return {
    name: 'chromarchive-met-image-proxy',
    configureServer(server) {
      mount(server.middlewares);
    },
    configurePreviewServer(server) {
      mount(server.middlewares);
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), metImageProxyPlugin()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
