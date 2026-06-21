import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const salesforceProxyTarget = env.VITE_SF_INSTANCE_URL;

  return {
    plugins: [react()],
    server: salesforceProxyTarget
      ? {
          proxy: {
            '/services': {
              target: salesforceProxyTarget,
              changeOrigin: true,
              secure: true,
            },
          },
        }
      : undefined,
  };
});
