import { bot } from "./bot.js";
import { startServer } from "./server.js";

async function main() {
  const fastify = await startServer(bot);

  async function shutdown() {
    console.log("Shutting down...");
    await bot.stop();
    await fastify.close();
    process.exit(0);
  }

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);

  bot.start({
    drop_pending_updates: true,
    allowed_updates: ["callback_query", "message"],
  });

  console.log("Moderation bot started.");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
