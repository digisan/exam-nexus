import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_KEY = Deno.env.get("SUPABASE_KEY");

if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error("SUPABASE_URL and SUPABASE_KEY must be provided");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export class SupabaseAgent {
    async insertMessage(content: string) {
        const { data, error } = await supabase
            .from("messages")
            .insert([{ content }])
            .select("*");

        if (error) {
            console.error("插入失败:", error.message);
        } else {
            console.log("插入成功:", data);
        }
    }

    async getMessages() {
        const { data, error } = await supabase
            .from("messages")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("查询失败:", error.message);
        } else {
            console.log("查询结果:", data);
        }
    }
}
