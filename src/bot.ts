import { Bot } from "grammy";
import { config } from "./config.js";
import { supabase } from "./supabase.js";
import { handleCallbackQuery } from "./handlers/moderation.js";
import { pluralize } from "./utils/pluralize.js";

export const bot = new Bot(config.botToken);

function isAuthorized(ctx: { chat?: { id: number; type?: string }; from?: { id: number } }): boolean {
  if (!ctx.chat || !ctx.from) return false;
  if (ctx.chat.id === config.moderatorChatId) return true;
  if (ctx.chat.type === "private" && config.moderatorIds.includes(ctx.from.id)) return true;
  return false;
}

bot.command("start", async (ctx) => {
  if (!isAuthorized(ctx)) {
    await ctx.reply("Этот бот доступен только для модераторов.");
    return;
  }
  await ctx.reply("Бот модерации запущен и работает.");
});

bot.command("pending", async (ctx) => {
  if (!isAuthorized(ctx)) {
    await ctx.reply("Этот бот доступен только для модераторов.");
    return;
  }

  const [vacancyResult, resumeResult, eventResult] = await Promise.all([
    supabase
      .from("vacancy")
      .select("id", { count: "exact", head: true })
      .eq("status" as never, "pending"),
    supabase
      .from("resume")
      .select("id", { count: "exact", head: true })
      .eq("status" as never, "pending"),
    supabase
      .from("event")
      .select("id", { count: "exact", head: true })
      .eq("status" as never, "pending"),
  ]);

  const vacancyCount = vacancyResult.count ?? 0;
  const resumeCount = resumeResult.count ?? 0;
  const eventCount = eventResult.count ?? 0;

  if (vacancyCount === 0 && resumeCount === 0 && eventCount === 0) {
    await ctx.reply("Нет записей на модерации.");
    return;
  }

  const parts: string[] = [];
  if (vacancyCount > 0) {
    parts.push(pluralize(vacancyCount, "вакансия", "вакансии", "вакансий"));
  }
  if (resumeCount > 0) {
    parts.push(pluralize(resumeCount, "резюме", "резюме", "резюме"));
  }
  if (eventCount > 0) {
    parts.push(
      pluralize(eventCount, "мероприятие", "мероприятия", "мероприятий")
    );
  }

  await ctx.reply(`На модерации: ${parts.join(", ")}`);
});

bot.on("callback_query:data", handleCallbackQuery);
