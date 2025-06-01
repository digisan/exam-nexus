import { dbAgent as agent } from "@db/dbService.ts";
import { type Id, isValidId, isValidIdObj, toIdSKey, toIdSKeyObj } from "@define/id.ts";
// import type { JSONObject } from "@db/dbService.ts";
import type { IdObj } from "@define/id.ts";
import { K, type K_TID, type K_UID, mTableKeys, T } from "@define/system.ts";
import { printResult } from "@util/log.ts";
import { randId } from "@util/util.ts";
import { assertEquals } from "@std/assert/equals";

Deno.test("PgVer", async () => {
    const r = await agent.PgVer();
    printResult(r, true);
});

Deno.test("DbInfo", async () => {
    const r = await agent.DbInfo();
    printResult(r, true);
});

// create all tables
//
Deno.test("CreateDataTable", async () => {
    for (const [table, keys] of mTableKeys) {
        const r = await agent.CreateDataTableWithKeys(table, keys);
        printResult(r, true);
    }
});

Deno.test("TableCount", async () => {
    const r = await agent.TableCount();
    printResult(r, true);
});

Deno.test("TableList", async () => {
    const r = await agent.TableList();
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

//////////////////////////////////////////////////////////////

Deno.test("InsertDataRow", async () => {
    // single key
    //
    const id = randId();
    if (!isValidId(id)) {
        console.debug(`❌ Not valid ID (${id})`);
        return;
    }
    const r = await agent.InsertDataRow(T.DEV_TEST, id as Id, { user: "foo", password: "bar" });
    printResult(r, true);

    // composited key
    //
    const idobj = {
        uid: randId() as Id,
        tid: randId() as Id,
    };
    if (isValidIdObj(idobj, [K.UID, K.TID])) {
        const r = await agent.InsertDataRow(T.DEV_TEST_2K, idobj as IdObj<[K_UID, K_TID]>, { user: "bar", password: "baz" });
        printResult(r, true);
    } else {
        console.debug(`❌ ${JSON.stringify(idobj)} is invalid`);
    }
});

Deno.test("QueryColumns", async () => {
    const r = await agent.QueryColumns(T.DEV_TEST_2K, [K.UID, K.TID]);
    printResult(r, true);
    if (r.isOk()) {
        assertEquals(r.value.length, 10);
    }

    const r1 = await agent.QueryId(T.DEV_TEST, K.ID);
    printResult(r1, true);
    if (r1.isOk()) {
        assertEquals(r1.value.length, 10);
    }
});

Deno.test("ClearTables", async () => {
    const r = await agent.ClearTables(T.DEV_TEST, T.DEV_TEST_2K);
    printResult(r, true);
});

Deno.test("CountRow", async () => {
    let r = await agent.CountRow(T.DEV_TEST);
    printResult(r, true);

    r = await agent.CountRow(T.DEV_TEST_2K);
    printResult(r, true);
});

Deno.test("TableContent", async () => {
    const id = "n7jpQ";
    if (!isValidId(id)) {
        console.log(`❌ id is invalid as ${id}`);
        return;
    }
    const r1 = await agent.SetSingleRowData(T.DEV_TEST, id, { name: "FOO", age: 13 });
    printResult(r1, true);

    const r2 = await agent.TableContent(T.DEV_TEST);
    printResult(r2, true);

    ////////////////////////////////////////////

    const idobj = {
        uid: "12345" as Id,
        tid: "abcde" as Id,
    };

    if (!isValidIdObj(idobj, [K.UID, K.TID])) {
        console.log(`❌ idobj is invalid as ${JSON.stringify(idobj)}`);
        return;
    }

    const r3 = await agent.SetSingleRowData(T.DEV_TEST_2K, idobj, { name: "FOO", age: 13 });
    printResult(r3, true);

    const r4 = await agent.TableContent(T.DEV_TEST_2K);
    printResult(r4, true);
});

Deno.test("FirstDataRow", async () => {
    const r = await agent.FirstDataRow(T.DEV_TEST, "name", "FOO");
    printResult(r, true);
});

Deno.test("GetDataRow", async () => {
    // single key
    //
    const id = "cdutwhu@yeah.net";
    if (!isValidId(id)) {
        console.debug(`❌ Not valid ID (${id})`);
        return;
    }
    const r1 = await agent.GetDataRow(T.DEV_TEST, id as Id);
    printResult(r1, true);

    // composited key
    //
    const idobj = {
        uid: "M9t2Ha21" as Id,
        tid: "FFFrC" as Id,
    };
    if (isValidIdObj(idobj, [K.UID, K.TID])) {
        const r = await agent.GetDataRow(T.DEV_TEST_2K, idobj as IdObj<[K_UID, K_TID]>);
        printResult(r, true);
    } else {
        console.debug(`❌ ${JSON.stringify(idobj)} is invalid`);
    }

    // park key
    // ...
    const uid = "M9t2Ha21";
    if (!isValidId(uid)) {
        console.debug(`❌ Not valid ID (${uid})`);
        return;
    }
    const r2 = await agent.GetDataRow(T.DEV_TEST_2K, uid as Id, K.UID);
    printResult(r2, true);
});

Deno.test("UpdateDataRow", async () => {
    const id = "my_id";
    const r_k = await toIdSKey(id, T.DEV_TEST);
    printResult(r_k, true);
    if (r_k.isErr()) return;

    const r = await agent.UpdateDataRow(T.DEV_TEST, r_k.value, { user: "ABCE", password: "ASDFWERADF" });
    printResult(r, true);
});

Deno.test("DeleteDataRows", async () => {
    const id = "my_id";
    if (!isValidId(id)) {
        console.debug(`❌ Not valid ID (${id})`);
        return;
    }
    const r = await agent.DeleteDataRows(T.DEV_TEST, id);
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
    const r_k = await toIdSKey("n7jpQ", T.DEV_TEST);
    if (r_k.isErr()) {
        console.debug(`❌ ${r_k.error}`);
        return;
    }
    const r = await agent.GetSingleRowData(T.DEV_TEST, r_k.value);
    if (r.isErr()) {
        return;
    }
    console.log(r.value);

    const id_obj = {
        uid: "12345" as Id,
        tid: "abcde" as Id,
    };
    const r_k1 = await toIdSKeyObj(id_obj, T.DEV_TEST_2K, [K.UID, K.TID]);
    if (r_k1.isErr()) {
        console.debug(`❌ ${r_k1.error}`);
        return;
    }
    const r1 = await agent.GetSingleRowData(T.DEV_TEST_2K, r_k1.value, K.ID, [K.UID, K.TID]);
    if (r1.isErr()) {
        console.debug(`❌ ${r1.error}`);
        return;
    }
    console.log(r1.value);
});

Deno.test("SetSingleRowData", async () => {
    const id = "cdutwhu@yeah.net";
    if (!isValidId(id)) {
        console.log(`❌ invalid id as ${id}`);
        return;
    }
    const r = await agent.SetSingleRowData(T.DEV_TEST, id, { user: "Z", password: "ZZ" });
    if (r.isErr()) {
        console.log(r.error);
        return;
    }
    console.log(r.value);

    const id_obj = {
        uid: "1234" as Id,
        tid: "abcde" as Id,
    };
    if (!isValidIdObj(id_obj, [K.UID, K.TID])) {
        console.log(`❌ idobj is invalid as ${JSON.stringify(id_obj)}`);
        return;
    }
    const r1 = await agent.SetSingleRowData(T.DEV_TEST_2K, id_obj, { user: "MM", password: "MMM" });
    if (r1.isErr()) {
        return;
    }
    console.log(r1.value);
});

Deno.test("DeleteRowData", async () => {
    const id = "2Cvu8UF";
    if (!isValidId(id)) {
        console.log(`❌ invalid id as ${id}`);
        return;
    }
    const r = await agent.DeleteRowData(T.DEV_TEST, id, true);
    printResult(r, true);

    const id_obj = {
        uid: "12345" as Id,
        tid: "abcde" as Id,
    };
    if (!isValidIdObj(id_obj, [K.UID, K.TID])) {
        console.log(`❌ idobj is invalid as ${JSON.stringify(id_obj)}`);
        return;
    }
    const r1 = await agent.DeleteRowData(T.DEV_TEST_2K, id_obj, true);
    printResult(r1, true);
});
