import { SupabaseAgent } from "@db/supabase.ts"

Deno.test(async function ExecuteSQL() {
    const sa = new SupabaseAgent();
    const r = await sa.executeSQL(`SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public'`);
    console.log(r)
});

Deno.test(async function PgVersion() {
    const sa = new SupabaseAgent();
    const r = await sa.PgVersion()
    console.log(r)
});

Deno.test(async function GetDbInfo() {
    const sa = new SupabaseAgent();
    const r = await sa.DbInfo()
    console.log(r)
});

Deno.test(async function TableCount() {
    const sa = new SupabaseAgent();
    const r = await sa.TableCount()
    console.log(r)
});

Deno.test(async function AllTables() {
    const sa = new SupabaseAgent();
    const r = await sa.AllTables()
    console.log(r)
});

Deno.test(async function TableContent() {
    const sa = new SupabaseAgent();
    const r = await sa.TableContent('general')
    console.log(r)
});

Deno.test(async function InsertObject() {
    const sa = new SupabaseAgent();
    const r = await sa.InsertObject('general', { user: "abc", password: "asdfweradf" })
    console.log(r)
});

Deno.test(async function DeleteObject() {
    const sa = new SupabaseAgent();
    const r = await sa.DeleteObject('general', 40)
    console.log(r)
});

Deno.test(async function SupaBase() {
    const sa = new SupabaseAgent();
    const sb = sa.getSupaBase();
    const { data, error } = await sb
        .from("general")
        .select("*")
        .gt('id', 10)
        .order("created_at", { ascending: true });

    error && console.error(error)
    data && console.log(data)
});