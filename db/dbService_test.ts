import { SupabaseAgent, type JSONObject } from "@db/dbService.ts"
import { T_REG, T_DEBUG, T_G } from "@define/const.ts";

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
    const r = await sa.TableContent(T_REG)
    if (r.isOk()) {
        console.log((r.value as JSONObject[])[0].data)
    } else {
        console.debug(r.error)
    }
});

Deno.test(async function UpsertDataObject() {
    const sa = new SupabaseAgent();
    const r = await sa.upsertSingleRowDataObject(T_REG, "email", { email: "test1@test.com", password: "abcdefg", registered_at: "adfe" })
    if (r.isOk()) {
        console.log(r.value)
    } else {
        console.debug(r.error)
    }
});

Deno.test(async function RemoveDataObject() {
    const sa = new SupabaseAgent();
    const r = await sa.removeSingleRowDataObject(T_REG, "email", "test@test.com")
    if (r.isOk()) {
        console.log(r.value)
    } else {
        console.debug(r.error)
    }
});

Deno.test(async function InsertDataRow() {
    const sa = new SupabaseAgent();
    const r = await sa.insertDataRow(T_REG, { user: "abc", password: "asdfweradf" })
    if (r.isOk()) {
        console.log(r.value)
    } else {
        console.debug(r.error)
    }
});

Deno.test(async function DeleteDataRow() {
    const sa = new SupabaseAgent();
    const r = await sa.deleteDataRows(T_REG, 41, 42, 43)
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
        .from(T_G)
        .select("id, data")
        .gt('id', 10)
        .order("created_at", { ascending: true });
    error && console.error(error)
    data && console.log(data)
});

Deno.test(async function InsertTextRow() {
    const sa = new SupabaseAgent();
    const r = await sa.insertTextRow(T_DEBUG, "hello")
    console.log(typeof r)
    console.log(r.isOk() ? r.value.content : r.error)
});