import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Use root base path for Netlify/production, GitHub Pages path for development
  const isNetlify = process.env.NETLIFY === "true" || mode === "production";
  
  return {
    base: isNetlify ? "/" : "/kam-yoga/",
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
