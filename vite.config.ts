import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { loadEnv } from 'vite';
import { createApi } from './server/api.mjs';
export default defineConfig(({mode}) => {
 const env = {...loadEnv(mode, process.cwd(), ''), ...process.env};
 return {base:'./',plugins:[react(),tailwindcss(),{name:'radar-local-api',configureServer(server){
  const api=createApi({apiKey:env.GEMINI_API_KEY,supabaseUrl:env.VITE_SUPABASE_URL,publishableKey:env.VITE_SUPABASE_PUBLISHABLE_KEY,model:env.GEMINI_MODEL || 'gemini-2.5-flash-lite'});
  server.middlewares.use(api.middleware);server.httpServer?.once('close',api.close);
 }}],test:{environment:'jsdom',setupFiles:['./tests/setup.ts'],include:['tests/**/*.test.tsx']}};
});
