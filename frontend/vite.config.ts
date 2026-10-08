import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

// https://vite.dev/config/
export default defineConfig(() => {
  // R-11 + D9: fuera de Compose el proxy apunta a localhost:8000 por defecto;
  // dentro de Compose, docker-compose.yml inyecta VITE_DEV_PROXY_URL=http://backend:8000.
  const devProxyTarget = process.env.VITE_DEV_PROXY_URL ?? "http://localhost:8000";

  return {
    plugins: [react(), tailwindcss()],
    server: {
      host: "0.0.0.0",
      proxy: {
        "/api": {
          target: devProxyTarget,
          changeOrigin: true,
        },
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
