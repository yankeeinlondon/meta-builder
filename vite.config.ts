/// <reference types="vitest" />
import { defineConfig } from "vite";
import Vue from "@vitejs/plugin-vue";
import Markdown from "vite-plugin-md";
import meta from "./src";

// used for testing, library code uses TSUP to build exports
export default defineConfig({
  test: {
    dir: "test",
    environment: "happy-dom",
  },
  plugins: [
    Markdown({ builders: [meta()] }),
    Vue({
      include: [/\.vue$/, /\.md$/],
    }),
  ],
});
