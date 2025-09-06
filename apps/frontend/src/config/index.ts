// Frontend configuration
export const config = {
  // Backend server URL (shared by API and Socket.io)
  serverUrl: import.meta.env.VITE_SERVER_URL || "http://localhost:3000",

  // Environment
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
} as const;
