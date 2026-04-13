import Fastify from "fastify";
import type { Bot } from "grammy";
import { config } from "./config.js";
import { webhookHandler } from "./handlers/webhook.js";

export function createServer(bot: Bot) {
  const fastify = Fastify({ logger: true });

  fastify.post("/webhook/new-entity", async (request, reply) => {
    await webhookHandler(bot, request, reply);
  });

  fastify.get("/health", async () => {
    return { status: "ok" };
  });

  return fastify;
}

export async function startServer(bot: Bot) {
  const fastify = createServer(bot);
  await fastify.listen({ port: config.port, host: "0.0.0.0" });
  console.log(`Fastify server listening on port ${config.port}`);
  return fastify;
}
