import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_KEY = Deno.env.get("SUPABASE_KEY");

if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error("请在 .env 文件中设置 SUPABASE_URL 和 SUPABASE_KEY");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
