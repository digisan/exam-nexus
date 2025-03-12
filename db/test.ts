import { createClient } from "@supabase/supabase-js";

Deno.env.set('SUPABASE_URL', 'https://njtznkkjfdamxepxjzmj.supabase.co')
Deno.env.set('SUPABASE_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qdHpua2tqZmRhbXhlcHhqem1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2MzczMTgsImV4cCI6MjA1NjIxMzMxOH0.IDu55DGOQGR2vdgUFoEJabuyytIUYFTc1OEIQwPMdlk')

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_KEY = Deno.env.get("SUPABASE_KEY");

if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error("请设置 SUPABASE_URL 和 SUPABASE_KEY");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

class SupabaseAgent {
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

export { SupabaseAgent };
