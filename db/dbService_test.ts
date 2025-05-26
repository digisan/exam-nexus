import { dbAgent as agent } from "@db/dbService.ts";
import { type Id, isValidId, isValidIdObj, toIdKey, toIdObjKey } from "@define/id.ts";
// import type { JSONObject } from "@db/dbService.ts";
import type { IdObj } from "@define/id.ts";
import { K, type K_TID, type K_UID, mTableKeys, T } from "@define/system.ts";
import { printResult } from "@util/log.ts";

Deno.test("CreateDataTable", async () => {
    for (const [table, keys] of mTableKeys) {
        const r = await agent.CreateDataTableWithKeys(table, keys);
        printResult(r, true);
    }
});

//////////////////////////////////////////////////////////////

Deno.test("ClearTable", async () => {
    const r = await agent.ClearTable(T.TEST);
    printResult(r, true);
});

Deno.test("CountRow", async () => {
    const r = await agent.CountRow(T.TEST_2K);
    printResult(r, true);
});

Deno.test("ListUserFunctions", async () => {
    const r = await agent.ListUserFunction();
    printResult(r, true);
});

Deno.test("ExecuteSQL", async () => {
    const r = await agent.ExecuteSQL(`SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public'`);
    printResult(r, true);
});

Deno.test("PgVer", async () => {
    const r = await agent.PgVer();
    printResult(r, true);
});

Deno.test("DbInfo", async () => {
    const r = await agent.DbInfo();
    printResult(r, true);
});

Deno.test("TableCount", async () => {
    const r = await agent.TableCount();
    printResult(r, true);
});

Deno.test("TableList", async () => {
    const r = await agent.TableList();
    printResult(r, true);
});

Deno.test("TableContent", async () => {
    const id = "my_id";
    if (!isValidId(id)) {
        console.log(`id is invalid as ${id}`);
        return;
    }
    const r1 = await agent.SetSingleRowData(T.TEST, id, { name: "foo", age: 13 });
    printResult(r1, true);

    const r2 = await agent.TableContent(T.TEST);
    printResult(r2, true);
});

Deno.test("FirstDataRow", async () => {
    const r = await agent.FirstDataRow(T.TEST, "user", "Z");
    printResult(r, true);

    // if (r.isOk()) {
    //     if (!r.value) {
    //         console.log(r.value);
    //         return;
    //     }
    //     console.log(r.value);
    // } else {
    //     console.debug(r.error);
    // }
});

Deno.test("GetDataRow", async () => {
    // single key
    //
    const id = "1234";
    if (!isValidId(id)) {
        console.debug(`❌ Not valid ID (${id})`);
        return;
    }
    const r = await agent.GetDataRow(T.TEST, id as Id);
    printResult(r, true);

    // composited key
    //
    const idobj = {
        id1: "1234" as Id,
        id2: "abcde" as Id,
        // id3: "1245" as Id,
        // id: "abcd" as Id
    };
    if (isValidIdObj(idobj, [K.UID, K.TID])) {
        const r = await agent.GetDataRow("dev_test_2k", idobj as IdObj<[K_UID, K_TID]>);
        printResult(r, true);
    } else {
        console.debug(`❌ ${JSON.stringify(idobj)} is invalid`);
    }
});

Deno.test("InsertDataRow", async () => {
    // single key
    //
    const id = "abcd2";
    if (!isValidId(id)) {
        console.debug(`❌ Not valid ID (${id})`);
        return;
    }
    const r = await agent.InsertDataRow(T.TEST, id as Id, { user: "abc", password: "asdfweradf" });
    printResult(r, true);

    // composited key
    //
    const idobj = {
        id1: "12345" as Id,
        id2: "abcde" as Id,
        // id3: "1245" as Id,
        // id: "abcd" as Id
    };
    if (isValidIdObj(idobj, [K.UID, K.TID])) {
        const r = await agent.InsertDataRow("dev_test_2k", idobj as IdObj<[K_UID, K_TID]>, { user: "abc", password: "asdfweradf" });
        printResult(r, true);
    } else {
        console.debug(`❌ ${JSON.stringify(idobj)} is invalid`);
    }
});

Deno.test("UpdateDataRow", async () => {
    const id = "abcde";
    const r_k = await toIdKey(id, T.TEST);
    printResult(r_k, true);
    if (r_k.isErr()) return;

    const r = await agent.UpdateDataRow(T.TEST, r_k.value, { user: "ABCE", password: "ASDFWERADF" });
    printResult(r, true);
});

Deno.test("DeleteDataRows", async () => {
    const id = "abcde";
    if (!isValidId(id)) {
        console.debug(`❌ Not valid ID (${id})`);
        return;
    }
    const r = await agent.DeleteDataRows(T.TEST, id);
    printResult(r, true);
});

//////////////////////////////////////////////////

// Deno.test("", async  SupaBase() => {
//     const sb = sa.getSupaBase();
//     const { data, error } = await sb
//         .from(T_G)
//         .select("id, data")
//         .gt('id', 10)
//         .order("created_at", { ascending: true });
//     error && console.error(error)
//     data && console.log(data)
// });

Deno.test("GetSingleRowData", async () => {
    const id = "abcd1";
    const r_k = await toIdKey(id, T.TEST);
    if (r_k.isErr()) {
        console.debug(`❌ ${r_k.error}`);
        return;
    }
    const r = await agent.GetSingleRowData(T.TEST, r_k.value);
    if (r.isErr()) {
        return;
    }
    console.log(r.value);

    const id_obj = {
        id1: "12345" as Id,
        id2: "abcde" as Id,
    };
    const r_k1 = await toIdObjKey(id_obj, "dev_test_2k", [K.UID, K.TID]);
    if (r_k1.isErr()) {
        console.debug(`❌ ${r_k1.error}`);
        return;
    }
    const r1 = await agent.GetSingleRowData("dev_test_2k", r_k1.value);
    if (r1.isErr()) {
        return;
    }
    console.log(r1.value);
});

Deno.test("SetSingleRowData", async () => {
    const id = "cdutwhu@yeah.net";
    if (!isValidId(id)) {
        return;
    }
    const r = await agent.SetSingleRowData(T.TEST, id, { user: "Z", password: "ZZ" });
    if (r.isErr()) {
        return;
    }
    console.log(r.value);

    const id_obj = {
        id1: "1234" as Id,
        id2: "abcde" as Id,
    };
    if (!isValidIdObj(id_obj, [K.UID, K.TID])) {
        return;
    }
    const r1 = await agent.SetSingleRowData("dev_test_2k", id_obj, { user: "MM", password: "MMM" });
    if (r1.isErr()) {
        return;
    }
    console.log(r1.value);
});

Deno.test("DeleteRowData", async () => {
    const id = "abcd";
    if (!isValidId(id)) {
        return;
    }
    const r = await agent.DeleteRowData(T.TEST, id, true);
    printResult(r, true);

    const id_obj = {
        id1: "1234" as Id,
        id2: "abcd" as Id,
    };
    if (!isValidIdObj(id_obj, [K.UID, K.TID])) {
        return;
    }
    const r1 = await agent.DeleteRowData("dev_test_2k", id_obj, true);
    printResult(r1, true);
});

//////////////////////////////////////////////////////////////////////////////
