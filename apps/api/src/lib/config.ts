export const config = {
  apiPort: Number(process.env.API_PORT) || 4000,
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
  t4s: {
    apiKey: process.env.T4S_API_KEY || "",
    baseUrl: process.env.T4S_API_BASE_URL || "https://das-server.tool4seller.com/api/",
    sellerId: process.env.T4S_SELLER_ID || "",
    marketplaceId: process.env.T4S_MARKETPLACE_ID || "",
  },
  timeoutMs: 30_000,
  retryCount: 3,
} as const;
