/**
 * Dev-server proxy: forwards all `/api/*` requests from the Angular dev server
 * (port 4200) to the NestJS API (port 3000).
 *
 * Vite (used by `@angular/build:dev-server` since v17) matches proxy keys with
 * `String#startsWith`, not webpack-dev-server's wildcard expansion, so the bare
 * `/api` prefix is sufficient and intentional.
 */
module.exports = {
  '/api': {
    target: 'http://127.0.0.1:3000',
    secure: false,
    changeOrigin: true,
  },
};
