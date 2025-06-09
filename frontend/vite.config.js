import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: "./postcss.config.js",
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("error", (err) => {
            console.error("Proxy error /api:", err);
          });
          proxy.on("proxyReq", (proxyReq, req) => {
            console.log(
              `Proxying ${req.method} ${req.url} to ${proxyReq.getHeader(
                "host"
              )}${proxyReq.path}`
            );
          });
          proxy.on("proxyRes", (proxyRes, req) => {
            console.log(
              `Received response for ${req.method} ${req.url}: ${proxyRes.statusCode}`
            );
          });
        },
      },
      "/sanctum": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("error", (err) => {
            console.error("Proxy error /sanctum:", err);
          });
          proxy.on("proxyReq", (proxyReq, req) => {
            console.log(
              `Proxying ${req.method} ${req.url} to ${proxyReq.getHeader(
                "host"
              )}${proxyReq.path}`
            );
          });
          proxy.on("proxyRes", (proxyRes, req) => {
            console.log(
              `Received response for ${req.method} ${req.url}: ${proxyRes.statusCode}`
            );
          });
        },
      },
    },
  },
});
