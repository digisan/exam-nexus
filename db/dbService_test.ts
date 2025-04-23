import { SupabaseAgent } from "@db/dbService.ts";
import { isValidId, toIdKey, type JSONObject } from "@define/type.ts";

Deno.test(async function ListUserFunctions() {
    const sa = new SupabaseAgent();
    const r = await sa.listUserFunctions()
    if (r.isOk()) {
        console.log(r.value)
    } else {
        console.debug(r.error)
    }
});

Deno.test(async function CreateDataTable() {
    const sa = new SupabaseAgent();
    const r = await sa.createDataTable('user_config')
    if (r.isOk()) {
        console.log(r.value)
    } else {
        console.debug(r.error)
    }
});

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
    const r = await sa.TableContent('test')
    if (r.isOk()) {
        if (!r.value) {
            console.log(r.value)
            return
        }
        console.log(r.value as JSONObject[])
    } else {
        console.debug(r.error)
    }
});

Deno.test(async function SearchFirstDataRown() {
    const sa = new SupabaseAgent();
    const r = await sa.searchFirstDataRow('test', 'user', 'abc')
    if (r.isOk()) {
        if (!r.value) {
            console.log(r.value)
            return
        }
        console.log(r.value)
    } else {
        console.debug(r.error)
    }
});

Deno.test(async function GetDataRow() {
    const sa = new SupabaseAgent();
    const id = "abcd1"
    if (!isValidId(id)) {
        console.debug(`❌ Not valid ID (${id})`)
        return
    }
    const r = await sa.getDataRow('test', id)
    if (r.isOk()) {
        console.log(r.value)
    } else {
        console.debug(`❌ ${r.error}`)
    }
});

Deno.test(async function InsertDataRow() {
    const sa = new SupabaseAgent();
    const id = "abcd1"
    if (!isValidId(id)) {
        console.debug(`❌ Not valid ID (${id})`)
        return
    }
    const r = await sa.insertDataRow('test', id, { user: "abc", password: "asdfweradf" })
    if (r.isOk()) {
        console.log(r.value)
    } else {
        console.debug(`❌ ${r.error}`)
    }
});

Deno.test(async function UpdateDataRow() {
    const sa = new SupabaseAgent();
    const id = "abcd"
    const ID = await toIdKey(id, 'test')
    if (!ID) {
        console.debug(`❌ Not existing ID '${id}'`)
        return
    }
    const r = await sa.updateDataRow('test', ID, { user: "ABCE", password: "ASDFWERADF" })
    if (r.isOk()) {
        console.log(r.value)
    } else {
        console.debug(`❌ ${r.error}`)
    }
});

Deno.test(async function DeleteDataRows() {
    const sa = new SupabaseAgent();
    const id = "abcd"
    if (!isValidId(id)) {
        console.debug(`❌ Not valid ID (${id})`)
        return
    }
    const r = await sa.deleteDataRows('test', id)
    if (r.isOk()) {
        console.log(r.value)
    } else {
        console.debug(`❌ ${r.error}`)
    }
});

//////////////////////////////////////////////////

// Deno.test(async function SupaBase() {
//     const sa = new SupabaseAgent();
//     const sb = sa.getSupaBase();
//     const { data, error } = await sb
//         .from(T_G)
//         .select("id, data")
//         .gt('id', 10)
//         .order("created_at", { ascending: true });
//     error && console.error(error)
//     data && console.log(data)
// });

Deno.test(async function GetSingleRowData() {
    const id = "abcd"
    const ID = await toIdKey(id, 'test')
    if (!ID) {
        console.debug(`'${id}' is NOT existing or invalid format`)
        return
    }
    const sa = new SupabaseAgent();
    const r = await sa.getSingleRowData('test', ID)
    if (r.isErr()) {
        return
    }
    console.log(r.value)
});

Deno.test(async function SetSingleRowData() {
    const id = "abcd"
    if (!isValidId(id)) {
        return
    }
    const sa = new SupabaseAgent();
    const r = await sa.setSingleRowData('test', id, { user: "ZZ", password: "ZZZZZZZ" })
    if (r.isErr()) {
        return
    }
    console.log(r.value)
});

Deno.test(async function DeleteRowData() {
    const id = "abcd"
    if (!isValidId(id)) {
        return
    }
    const sa = new SupabaseAgent();
    const r = await sa.deleteRowData('test', id)
    if (r.isErr()) {
        return
    }
    console.log(r.value)
});