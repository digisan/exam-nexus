import { SupabaseAgent } from "@db/supabase.ts";

Deno.test(async function InsertMessage() {
    const sa = new SupabaseAgent();
    await sa.insertMessage("hello")
});

Deno.test(async function GetMessage() {
    const sa = new SupabaseAgent();
    const r = await sa.getMessages()
    console.log(r)
});