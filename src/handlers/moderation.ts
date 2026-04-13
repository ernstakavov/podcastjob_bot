import type { Context } from "grammy";
import { config } from "../config.js";
import { supabase } from "../supabase.js";
import { formatVacancy } from "../formatters/vacancy.js";
import { formatResume } from "../formatters/resume.js";
import { formatEvent } from "../formatters/event.js";

export const messageStore = new Map<string, string>();

type EntityType = "vacancy" | "resume" | "event";

const TYPE_CHAR_TO_TABLE: Record<string, EntityType> = {
  v: "vacancy",
  s: "resume",
  e: "event",
};

interface ParsedCallback {
  action: "ap" | "rj";
  table: EntityType;
  entityId: string;
}

function parseCallbackData(data: string): ParsedCallback | null {
  const parts = data.split(":");
  if (parts.length !== 3) return null;

  const [action, typeChar, entityId] = parts;
  if (action !== "ap" && action !== "rj") return null;

  const table = TYPE_CHAR_TO_TABLE[typeChar];
  if (!table) return null;

  return { action, table, entityId };
}

function formatEntity(
  table: EntityType,
  record: Record<string, unknown>
): string {
  switch (table) {
    case "vacancy":
      return formatVacancy(record as never);
    case "resume":
      return formatResume(record as never);
    case "event":
      return formatEvent(record as never);
  }
}

export async function handleCallbackQuery(ctx: Context): Promise<void> {
  const callbackData = ctx.callbackQuery?.data;
  if (!callbackData) return;

  const parsed = parseCallbackData(callbackData);
  if (!parsed) return;

  const { action, table, entityId } = parsed;
  const userId = ctx.from?.id;
  const username = ctx.from?.username || ctx.from?.first_name || "unknown";

  // Check auth
  if (!userId || !config.moderatorIds.includes(userId)) {
    await ctx.answerCallbackQuery({ text: "У вас нет доступа." });
    return;
  }

  // Fetch entity from Supabase
  const { data: entity, error: fetchError } = await supabase
    .from(table)
    .select("*")
    .eq("id", entityId)
    .single();

  if (fetchError || !entity) {
    console.error(`Failed to fetch ${table} ${entityId}:`, fetchError);
    await ctx.answerCallbackQuery({
      text: "Ошибка обновления. Попробуйте ещё раз.",
    });
    return;
  }

  // Check if already moderated
  if ((entity as Record<string, unknown>).status !== "pending") {
    await ctx.answerCallbackQuery({
      text: "Уже промодерировано другим модератором.",
    });
    return;
  }

  // Update status
  const newStatus = action === "ap" ? "approved" : "rejected";
  const { error: updateError } = await supabase
    .from(table)
    .update({ status: newStatus } as never)
    .eq("id", entityId);

  if (updateError) {
    console.error(`Failed to update ${table} ${entityId}:`, updateError);
    await ctx.answerCallbackQuery({
      text: "Ошибка обновления. Попробуйте ещё раз.",
    });
    return;
  }

  // Log moderation action
  const timestamp = new Date().toISOString();
  const decision = action === "ap" ? "approved" : "rejected";
  console.log(
    `[${timestamp}] Moderator @${username} (${userId}) ${decision} ${table} ${entityId}`
  );

  // Answer callback
  await ctx.answerCallbackQuery({
    text: action === "ap" ? "Одобрено!" : "Отклонено.",
  });

  // Edit message to show result
  try {
    const chatId = ctx.callbackQuery!.message?.chat.id;
    const messageId = ctx.callbackQuery!.message?.message_id;

    if (chatId && messageId) {
      const storeKey = `${chatId}:${messageId}`;
      let originalText = messageStore.get(storeKey);

      // If not in store (e.g. after restart), re-format from entity
      if (!originalText) {
        originalText = formatEntity(
          table,
          entity as Record<string, unknown>
        );
      }

      const statusLabel =
        action === "ap"
          ? `✅ Одобрено — @${username}`
          : `❌ Отклонено — @${username}`;

      const newText = originalText.replace("⏳ На модерации", statusLabel);

      await ctx.api.editMessageText(chatId, messageId, newText, {
        parse_mode: "HTML",
        reply_markup: { inline_keyboard: [] },
      });

      // Clean up store
      messageStore.delete(storeKey);
    }
  } catch (e) {
    // Race condition: another moderator already edited
    console.error("Failed to edit message (likely already edited):", e);
  }
}
