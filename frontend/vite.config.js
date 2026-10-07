import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react(), tailwindcss()],
    // Explicitly define the env variables to expose to your app
    define: {
      'process.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL),
      'import.meta.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL),
    },
    // Use the root directory for .env files
    envDir: '.',
    // Only expose variables with these prefixes to the client
    envPrefix: ['VITE_'],
    
    // For development server
    server: {
      port: 5173,
      strictPort: true,
      host: true,
    },
    // For production build
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: true,
      // This ensures environment variables are embedded in the build
      define: {
        'process.env': {}
      },
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
          },
        },
      },
    },
  };
});
