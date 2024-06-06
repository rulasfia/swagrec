// vite.config.ts
import build from "file:///C:/Users/rulasfia/Developments/personal/swagrec/node_modules/.pnpm/@hono+vite-cloudflare-pages@0.4.0_hono@4.4.3/node_modules/@hono/vite-cloudflare-pages/dist/index.js";
import devServer from "file:///C:/Users/rulasfia/Developments/personal/swagrec/node_modules/.pnpm/@hono+vite-dev-server@0.12.1_hono@4.4.3/node_modules/@hono/vite-dev-server/dist/index.js";
import adapter from "file:///C:/Users/rulasfia/Developments/personal/swagrec/node_modules/.pnpm/@hono+vite-dev-server@0.12.1_hono@4.4.3/node_modules/@hono/vite-dev-server/dist/adapter/cloudflare.js";
import { defineConfig } from "file:///C:/Users/rulasfia/Developments/personal/swagrec/node_modules/.pnpm/vite@5.2.12_@types+node@20.14.1_terser@5.31.0/node_modules/vite/dist/node/index.js";
var vite_config_default = defineConfig({
  plugins: [
    build(),
    devServer({
      adapter,
      entry: "src/index.tsx"
    })
  ]
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxydWxhc2ZpYVxcXFxEZXZlbG9wbWVudHNcXFxccGVyc29uYWxcXFxcc3dhZ3JlY1xcXFxwYWNrYWdlc1xcXFxzd2FncmVjLXBhZ2VzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxydWxhc2ZpYVxcXFxEZXZlbG9wbWVudHNcXFxccGVyc29uYWxcXFxcc3dhZ3JlY1xcXFxwYWNrYWdlc1xcXFxzd2FncmVjLXBhZ2VzXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9ydWxhc2ZpYS9EZXZlbG9wbWVudHMvcGVyc29uYWwvc3dhZ3JlYy9wYWNrYWdlcy9zd2FncmVjLXBhZ2VzL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IGJ1aWxkIGZyb20gJ0Bob25vL3ZpdGUtY2xvdWRmbGFyZS1wYWdlcydcbmltcG9ydCBkZXZTZXJ2ZXIgZnJvbSAnQGhvbm8vdml0ZS1kZXYtc2VydmVyJ1xuaW1wb3J0IGFkYXB0ZXIgZnJvbSAnQGhvbm8vdml0ZS1kZXYtc2VydmVyL2Nsb3VkZmxhcmUnXG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbXG4gICAgYnVpbGQoKSxcbiAgICBkZXZTZXJ2ZXIoe1xuICAgICAgYWRhcHRlcixcbiAgICAgIGVudHJ5OiAnc3JjL2luZGV4LnRzeCdcbiAgICB9KVxuICBdXG59KVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFvWixPQUFPLFdBQVc7QUFDdGEsT0FBTyxlQUFlO0FBQ3RCLE9BQU8sYUFBYTtBQUNwQixTQUFTLG9CQUFvQjtBQUU3QixJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixVQUFVO0FBQUEsTUFDUjtBQUFBLE1BQ0EsT0FBTztBQUFBLElBQ1QsQ0FBQztBQUFBLEVBQ0g7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
