import { SupabaseAgent } from "@db/dbService.ts"

Deno.test(async function ExecuteSQL() {
    const sa = new SupabaseAgent();
    const r = await sa.executeSQL(`SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public'`);
    if (r.isOk()) {
        console.log(r.value)
    } else {
        console.debug(r.error)
    }
});

Deno.test(async function PgVer() {
    const sa = new SupabaseAgent();
    const r = await sa.PgVer()
    if (r.isOk()) {
        console.log(r.value)
    } else {
        console.debug(r.error)
    }
});

Deno.test(async function DbInfo() {
    const sa = new SupabaseAgent();
    const r = await sa.DbInfo()
    if (r.isOk()) {
        console.log(r.value)
    } else {
        console.debug(r.error)
    }
});

Deno.test(async function TableCount() {
    const sa = new SupabaseAgent();
    const r = await sa.TableCount()
    if (r.isOk()) {
        console.log(r.value)
    } else {
        console.debug(r.error)
    }
});

Deno.test(async function TableList() {
    const sa = new SupabaseAgent();
    const r = await sa.TableList()
    if (r.isOk()) {
        console.log(r.value)
    } else {
        console.debug(r.error)
    }
});

Deno.test(async function TableContent() {
    const sa = new SupabaseAgent();
    const r = await sa.TableContent('register')
    if (r.isOk()) {
        console.log(r.value)
    } else {
        console.debug(r.error)
    }
});

Deno.test(async function InsertDataRow() {
    const sa = new SupabaseAgent();
    const r = await sa.insertDataRow('register', { user: "abc", password: "asdfweradf" })
    if (r.isOk()) {
        console.log(r.value)
    } else {
        console.debug(r.error)
    }
});

Deno.test(async function DeleteDataRow() {
    const sa = new SupabaseAgent();
    const r = await sa.deleteDataRows('register', 41, 42, 43)
    if (r.isOk()) {
        console.log(r.value)
    } else {
        console.debug(r.error)
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

Deno.test(async function InsertTextRow() {
    const sa = new SupabaseAgent();
    const r = await sa.insertTextRow('messages', "hello")
    console.log(typeof r)
    console.log(r.isOk() ? r.value.content : r.error)
});