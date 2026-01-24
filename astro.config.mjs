import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import node from "@astrojs/node";

import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: node({
    mode: "standalone",
  }),
  integrations: [react()],
  vite: {
    optimizeDeps: {
      exclude: ["@node-rs/bcrypt"],
    },

    plugins: [tailwindcss()],
  },
});
