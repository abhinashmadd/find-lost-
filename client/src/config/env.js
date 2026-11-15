/**
 * Client Environment and Runtime Configuration Module.
 * Decouples direct import.meta.env calls from presentation and service layers.
 */

const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (import.meta.env.DEV) {
    return "http://localhost:5000/api";
  }
  return "/api";
};

export const config = Object.freeze({
  apiBaseUrl: getApiBaseUrl(),
  isDev: Boolean(import.meta.env.DEV),
  isProd: Boolean(import.meta.env.PROD),
  mode: import.meta.env.MODE || "development",
  appName: import.meta.env.VITE_APP_NAME || "Lost and Found Portal",
});

export default config;
