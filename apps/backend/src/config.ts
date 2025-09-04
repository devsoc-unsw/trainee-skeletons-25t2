import "dotenv/config";

/**
 * Central configuration file for all environment variables
 * This provides a single source of truth for all configuration values
 */
export const config = {
  // Server configuration
  port: process.env.PORT || "3000",

  // Database configuration
  database: {
    url: process.env.DATABASE_URL!,
  },

  // Google Places API configuration
  googlePlaces: {
    apiKey: process.env.GOOGLE_PLACES_API_KEY,
    useMockRestaurants: process.env.USE_MOCK_RESTAURANTS === "true",
  },

  // CORS configuration
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  },
} as const;

// Validation function to ensure required environment variables are present
export function validateConfig(): void {
  const requiredEnvVars = [{ key: "DATABASE_URL", value: config.database.url }];

  const missingVars = requiredEnvVars.filter(({ value }) => !value);

  if (missingVars.length > 0) {
    const missingKeys = missingVars.map(({ key }) => key).join(", ");
    throw new Error(`Missing required environment variables: ${missingKeys}`);
  }
}
