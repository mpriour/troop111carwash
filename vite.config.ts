import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  server: { port: process.env.NODE_ENV === "production" ? 8080 : 3000, host: "0.0.0.0" },
  plugins: [reactRouter(), tsconfigPaths()]
});
