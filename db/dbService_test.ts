import { SupabaseAgent } from "@db/dbService.ts"

Deno.test(async function ExecuteSQL() {
    const sa = new SupabaseAgent();
    const r = await sa.executeSQL(`SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public'`);
    console.log(r)
});

Deno.test(async function PgVer() {
    const sa = new SupabaseAgent();
    const r = await sa.PgVer()
    console.log(r)
});

Deno.test(async function DbInfo() {
    const sa = new SupabaseAgent();
    const r = await sa.DbInfo()
    console.log(r)
});

Deno.test(async function TableCount() {
    const sa = new SupabaseAgent();
    const r = await sa.TableCount()
    console.log(r)
});

Deno.test(async function TableList() {
    const sa = new SupabaseAgent();
    const r = await sa.TableList()
    console.log(r)
});

Deno.test(async function TableContent() {
    const sa = new SupabaseAgent();
    const r = await sa.TableContent('register')
    console.log(r)
});

Deno.test(async function InsertDataRow() {
    const sa = new SupabaseAgent();
    const r = await sa.insertDataRow('register', { user: "abc", password: "asdfweradf" })
    console.log(r)
});

Deno.test(async function DeleteDataRow() {
    const sa = new SupabaseAgent();
    for (let i = 10; i < 50; i++) {
        const r = await sa.deleteDataRow('register', i)
        console.log(i, r)
    }
});

Deno.test(async function SupaBase() {
    const sa = new SupabaseAgent();
    const sb = sa.getSupaBase();
    const { data, error } = await sb
        .from("general")
        .select("id, data")
        .gt('id', 10)
        .order("created_at", { ascending: true });

    error && console.error(error)
    data && console.log(data)
});