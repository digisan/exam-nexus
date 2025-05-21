import { dbAgent as agent } from "@db/dbService.ts";
import { isValidId, toIdKey } from "@define/type.ts";
import type { JSONObject } from "@db/dbService.ts";

Deno.test(async function ListUserFunctions() {
    const r = await agent.listUserFunctions();
    if (r.isOk()) {
        console.log(r.value);
    } else {
        console.debug(r.error);
    }
});

Deno.test(async function CreateDataTable() {
    const r = await agent.createDataTable("dev_test");
    if (r.isOk()) {
        console.log(r.value);
    } else {
        console.debug(r.error);
    }
});

Deno.test(async function ExecuteSQL() {
    const r = await agent.executeSQL(`SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public'`);
    if (r.isOk()) {
        console.log(r.value);
    } else {
        console.debug(r.error);
    }
});

Deno.test(async function PgVer() {
    const r = await agent.PgVer();
    if (r.isOk()) {
        console.log(r.value);
    } else {
        console.debug(r.error);
    }
});

Deno.test(async function DbInfo() {
    const r = await agent.DbInfo();
    if (r.isOk()) {
        console.log(r.value);
    } else {
        console.debug(r.error);
    }
});

Deno.test(async function TableCount() {
    const r = await agent.TableCount();
    if (r.isOk()) {
        console.log(r.value);
    } else {
        console.debug(r.error);
    }
});

Deno.test(async function TableList() {
    const r = await agent.TableList();
    if (r.isOk()) {
        console.log(r.value);
    } else {
        console.debug(r.error);
    }
});

Deno.test(async function TableContent() {
    const r = await agent.TableContent("dev_test");
    if (r.isOk()) {
        if (!r.value) {
            console.log(r.value);
            return;
        }
        console.log(r.value as JSONObject[]);
    } else {
        console.debug(r.error);
    }
});

Deno.test(async function FirstDataRow() {
    const r = await agent.firstDataRow("dev_test", "user", "abc");
    if (r.isOk()) {
        if (!r.value) {
            console.log(r.value);
            return;
        }
        console.log(r.value);
    } else {
        console.debug(r.error);
    }
});

Deno.test(async function GetDataRow() {
    const id = "abcd1";
    if (!isValidId(id)) {
        console.debug(`❌ Not valid ID (${id})`);
        return;
    }
    const r = await agent.getDataRow("dev_test", id);
    if (r.isOk()) {
        console.log(r.value);
    } else {
        console.debug(`❌ ${r.error}`);
    }
});

Deno.test(async function InsertDataRow() {
    const id = "abcd1";
    if (!isValidId(id)) {
        console.debug(`❌ Not valid ID (${id})`);
        return;
    }
    const r = await agent.insertDataRow("dev_test", id, { user: "abc", password: "asdfweradf" });
    if (r.isOk()) {
        console.log(r.value);
    } else {
        console.debug(`❌ ${r.error}`);
    }
});

Deno.test(async function UpdateDataRow() {
    const id = "abcd";
    const r_k = await toIdKey(id, "dev_test");
    if (r_k.isErr()) {
        console.debug(`❌ Not existing ID '${id}'`);
        return;
    }
    const r = await agent.updateDataRow("dev_test", r_k.value, { user: "ABCE", password: "ASDFWERADF" });
    if (r.isOk()) {
        console.log(r.value);
    } else {
        console.debug(`❌ ${r.error}`);
    }
});

Deno.test(async function DeleteDataRows() {
    const id = "abcd";
    if (!isValidId(id)) {
        console.debug(`❌ Not valid ID (${id})`);
        return;
    }
    const r = await agent.deleteDataRows("dev_test", id);
    if (r.isOk()) {
        console.log(r.value);
    } else {
        console.debug(`❌ ${r.error}`);
    }
});

//////////////////////////////////////////////////

// Deno.test(async function SupaBase() {
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
    const id = "abcd";
    const r_k = await toIdKey(id, "dev_test");
    if (r_k.isErr()) {
        console.debug(`'${id}' is NOT existing or invalid format`);
        return;
    }
    const r = await agent.getSingleRowData("dev_test", r_k.value);
    if (r.isErr()) {
        return;
    }
    console.log(r.value);
});

Deno.test(async function SetSingleRowData() {
    const id = "abcd";
    if (!isValidId(id)) {
        return;
    }
    const r = await agent.setSingleRowData("dev_test", id, { user: "ZZ", password: "ZZZZZZZ" });
    if (r.isErr()) {
        return;
    }
    console.log(r.value);
});

Deno.test(async function DeleteRowData() {
    const id = "abcd";
    if (!isValidId(id)) {
        return;
    }
    const r = await agent.deleteRowData("dev_test", id);
    if (r.isErr()) {
        return;
    }
    console.log(r.value);
});
