/**
 * Build-time environment for the web app. Only configuration that the
 * browser needs at runtime belongs here — secrets (none here yet) must
 * never land in the client bundle.
 */
export const environment = {
  production: false,
  apiBaseUrl: '/api',
};
