// Vite runs the React frontend. The Cloudflare plugin runs the Worker backend and
// the D1 database alongside it, so one command (npm run dev) starts everything.
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [react(), cloudflare()],
});
