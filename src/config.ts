import "dotenv/config";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const config = {
  botToken: requireEnv("BOT_TOKEN"),
  moderatorChatId: Number(requireEnv("MODERATOR_CHAT_ID")),
  moderatorIds: requireEnv("MODERATOR_IDS")
    .split(",")
    .map((id) => Number(id.trim()))
    .filter((id) => !isNaN(id)),
  supabaseUrl: requireEnv("SUPABASE_URL"),
  supabaseServiceRoleKey: requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
  webhookSecret: requireEnv("WEBHOOK_SECRET"),
  port: Number(process.env.PORT || "3000"),
} as const;
