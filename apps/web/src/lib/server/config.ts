function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optionalEnv(name: string, fallback: string): string {
  return process.env[name] || fallback;
}

export const config = {
  t4s: {
    get apiKey() { return requireEnv("T4S_API_KEY"); },
    baseUrl: optionalEnv("T4S_API_BASE_URL", "https://das-server.tool4seller.com/api/"),
    get sellerId() { return requireEnv("T4S_SELLER_ID"); },
    get marketplaceId() { return requireEnv("T4S_MARKETPLACE_ID"); },
  },
  apiSecret: process.env.API_SECRET || "",
  timeoutMs: 30_000,
  retryCount: 3,
} as const;
