import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types.js";
import { config } from "./config.js";

export const supabase = createClient<Database>(
  config.supabaseUrl,
  config.supabaseServiceRoleKey
);
