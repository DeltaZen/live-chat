import preact from "@preact/preset-vite";
import { webxdcViteConfig } from "webxdc-vite-plugins";
import { defineConfig } from "vite";

const config = webxdcViteConfig();
config.plugins.push(preact());

// https://vitejs.dev/config/
export default defineConfig(config);
