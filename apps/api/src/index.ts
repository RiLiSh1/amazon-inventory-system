import Fastify from "fastify";
import cors from "@fastify/cors";
import { productRoutes } from "./routes/products.js";
import { inventoryRoutes } from "./routes/inventories.js";
import { t4sSalesRoutes } from "./routes/t4s-sales.js";
import { t4sInventoryRoutes } from "./routes/t4s-inventories.js";
import { t4sShipmentRoutes } from "./routes/t4s-shipments.js";
import { t4sSyncRoutes } from "./routes/t4s-sync.js";
import { t4sImportLogRoutes } from "./routes/t4s-import-logs.js";
import { dashboardRoutes } from "./routes/dashboard.js";

const app = Fastify({
  logger: true,
});

// Global error handler for validation errors
app.setErrorHandler((error, _request, reply) => {
  if ((error as Error & { statusCode?: number }).statusCode === 400) {
    return reply.status(400).send({ success: false, error: error.message });
  }
  app.log.error(error);
  return reply.status(500).send({ success: false, error: "Internal server error" });
});

const corsOrigins = (process.env.CORS_ORIGIN || "http://localhost:3000")
  .split(",")
  .map((o) => o.trim());

await app.register(cors, {
  origin: corsOrigins,
});

app.get("/health", async () => {
  return { status: "ok" };
});

await app.register(productRoutes);
await app.register(inventoryRoutes);
await app.register(t4sSalesRoutes);
await app.register(t4sInventoryRoutes);
await app.register(t4sShipmentRoutes);
await app.register(t4sSyncRoutes);
await app.register(t4sImportLogRoutes);
await app.register(dashboardRoutes);

const start = async () => {
  try {
    const port = Number(process.env.PORT) || Number(process.env.API_PORT) || 4000;
    await app.listen({ port, host: "0.0.0.0" });
    app.log.info(`API server running on port ${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
