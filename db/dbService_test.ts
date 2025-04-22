import { SupabaseAgent } from "@db/dbService.ts";
import { isValidId, toExistId, type JSONObject } from "@define/type.ts";
import { T_CONFIG, T_TEST } from "@define/system.ts";

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
    const r = await sa.createDataTable(T_CONFIG)
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
    const r = await sa.TableContent(T_TEST)
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

Deno.test(async function GetDataRow() {
    const sa = new SupabaseAgent();
    const id = "abcd"
    if (!isValidId(id)) {
        console.debug(`❌ Not valid ID (${id})`)
        return
    }
    const r = await sa.getDataRow(T_TEST, id)
    if (r.isOk()) {
        console.log(r.value)
    } else {
        console.debug(`❌ ${r.error}`)
    }
});

Deno.test(async function InsertDataRow() {
    const sa = new SupabaseAgent();
    const id = "abcd"
    if (!isValidId(id)) {
        console.debug(`❌ Not valid ID (${id})`)
        return
    }
    const r = await sa.insertDataRow(T_TEST, id, { user: "abc", password: "asdfweradf" })
    if (r.isOk()) {
        console.log(r.value)
    } else {
        console.debug(`❌ ${r.error}`)
    }
});

Deno.test(async function UpdateDataRow() {
    const sa = new SupabaseAgent();
    const id = "abcd"
    const ID = await toExistId(T_TEST, id)
    if (!ID) {
        console.debug(`❌ Not existing ID '${id}'`)
        return
    }
    const r = await sa.updateDataRow(T_TEST, ID, { user: "ABCE", password: "ASDFWERADF" })
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
    const r = await sa.deleteDataRows(T_TEST, id)
    if (r.isOk()) {
        console.log(r.value)
    } else {
        console.debug(`❌ ${r.error}`)
    }
});

//////////////////////////////////////////////////

// Deno.test(async function UpsertDataObject() {
//     const sa = new SupabaseAgent();
//     const r = await sa.upsertSingleRowDataObject(T_REGISTER, "email", { email: "test1@test.com", password: "abcdefg", registered_at: "adfe" })
//     if (r.isOk()) {
//         console.log(r.value)
//     } else {
//         console.debug(r.error)
//     }
// });

// Deno.test(async function RemoveDataObject() {
//     const sa = new SupabaseAgent();
//     const r = await sa.removeSingleRowDataObject(T_REGISTER, "email", "test1@test.com")
//     if (r.isOk()) {
//         console.log(r.value)
//     } else {
//         console.debug(r.error)
//     }
// });

// Deno.test(async function DeleteDataRow() {
//     const sa = new SupabaseAgent();
//     const r = await sa.deleteDataRows(T_REGISTER, 41, 42, 43)
//     if (r.isOk()) {
//         console.log(r.value)
//     } else {
//         console.debug(r.error)
//     }
// });

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

// Deno.test(async function InsertTextRow() {
//     const sa = new SupabaseAgent();
//     const r = await sa.insertTextRow(T_TEST, "hello")
//     console.log(typeof r)
//     console.log(r.isOk() ? r.value.content : r.error)
// });