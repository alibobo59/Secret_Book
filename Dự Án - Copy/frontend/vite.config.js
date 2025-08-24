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
        timeout: 3000000,
        rewrite: (path) => path.replace(/^\/api/, "/api"),
        configure: (proxy) => {
          proxy.on("error", (err) => {
            console.error("Proxy error /api:", err);
          });
          proxy.on("proxyReq", (proxyReq, req) => {
            console.log(
              `%c PROXY REQUEST: ${req.method} ${req.url} → ${proxyReq.getHeader("host")}${proxyReq.path}`,
              'background: #6600cc; color: white; padding: 2px 5px; border-radius: 3px;'
            );
            
            // Log headers being sent to backend
            console.log('Request Headers:', req.headers);
            
            // Log body if available (for debugging profile updates)
            if (req.url.includes('/profile') && (req.method === 'PUT' || req.method === 'POST')) {
              console.log('Profile update request detected');
              
              // Try to log body
              if (req.body) {
                console.log('Request Body:', req.body);
              } else {
                console.log('Request Body not available in proxy');
              }
              
              // Log content type
              console.log('Content-Type:', req.headers['content-type']);
            }
          });
          proxy.on("proxyRes", (proxyRes, req) => {
            console.log(
              `%c PROXY RESPONSE: ${req.method} ${req.url} - Status: ${proxyRes.statusCode} ${proxyRes.statusMessage}`,
              'background: #009933; color: white; padding: 2px 5px; border-radius: 3px;'
            );
            
            // Log response headers
            console.log('Response Headers:', proxyRes.headers);
            
            // Special handling for profile updates
            if (req.url.includes('/profile') && (req.method === 'PUT' || req.method === 'POST')) {
              console.log('Profile update response detected');
              
              // Log content type
              console.log('Response Content-Type:', proxyRes.headers['content-type']);
              
              // Try to capture response body (this is limited in proxy)
              let responseBody = '';
              proxyRes.on('data', (chunk) => {
                responseBody += chunk;
              });
              
              proxyRes.on('end', () => {
                try {
                  // Try to parse as JSON if possible
                  if (proxyRes.headers['content-type']?.includes('application/json')) {
                    const jsonResponse = JSON.parse(responseBody);
                    console.log('Response Body (JSON):', jsonResponse);
                  } else {
                    console.log('Response Body (raw):', responseBody);
                  }
                } catch (e) {
                  console.log('Response Body (could not parse):', responseBody);
                }
              });
            }
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
