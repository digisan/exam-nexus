// ****************** System Configuration ****************** //

//
// created from 'db/sql/ f_*.sql'
// (before create_data_table(_keys), run `t_update_updated_at_column.sql`)
//
const FUNCS_SB = [
    "create_data_table",
    "create_data_table_keys",
    "pg_execute",
] as const;
export type FuncType = typeof FUNCS_SB[number];

export const F_CREATE_DATA_TABLE: FuncType = "create_data_table";
export const F_CREATE_DATA_TABLE_KEYS: FuncType = "create_data_table_keys";
export const F_PG_EXECUTE: FuncType = "pg_execute";

//
// created from 'db/sql/v_*.sql'
//
const VIEWS_SB = [
    "user_defined_functions",
] as const;
export type ViewType = typeof VIEWS_SB[number];

export const V_UDF: ViewType = "user_defined_functions";

//
// self defined in advance by 1.'create_data_table' or 2.'create_data_table_keys'
//
export const TABLES_SB = [
    "dev_test",
    "dev_test_2k", // 2
    "register",
    "user_config",
    "user_exam",
    "test_analysis",
    "test_prep_plan", // 2
    "test_prep_progress", // 2
] as const;
export type TableType = typeof TABLES_SB[number];

const defineTable = <T extends TableType>(value: T): T => value;
export const T = {
    DEV_TEST: defineTable("dev_test"),
    DEV_TEST_2K: defineTable("dev_test_2k"),
    REGISTER: defineTable("register"),
    USER_CONFIG: defineTable("user_config"),
    USER_EXAM: defineTable("user_exam"),
    TEST_ANALYSIS: defineTable("test_analysis"),
    TEST_PREP_PLAN: defineTable("test_prep_plan"),
    TEST_PREP_PROGRESS: defineTable("test_prep_progress"),
} as const;

export type T_DEV_TEST = typeof T.DEV_TEST;
export type T_DEV_TEST_2K = typeof T.DEV_TEST_2K;
export type T_REGISTER = typeof T.REGISTER;
export type T_USER_CONFIG = typeof T.USER_CONFIG;
export type T_USER_EXAM = typeof T.USER_EXAM;
export type T_TEST_ANALYSIS = typeof T.TEST_ANALYSIS;
export type T_TEST_PREP_PLAN = typeof T.TEST_PREP_PLAN;
export type T_TEST_PREP_PROGRESS = typeof T.TEST_PREP_PROGRESS;

//
// table key(s) name range
//
export const KEY_SB = [
    "id",
    "uid",
    "tid",
    "rid",
] as const;
export type KeyType = typeof KEY_SB[number];

const defineKey = <T extends KeyType>(value: T): T => value;
export const K = {
    ID: defineKey("id"),
    UID: defineKey("uid"),
    TID: defineKey("tid"),
    RID: defineKey("rid"),
} as const;

export type K_ID = typeof K.ID;
export type K_UID = typeof K.UID;
export type K_TID = typeof K.TID;
export type K_RID = typeof K.RID;

//
// ******* Create All SupaBaseDB Tables (dbService_test.ts -- Deno.test("CreateDataTable") ******* //
//

export const mTableKeys = new Map<TableType, KeyType[]>([
    [T.DEV_TEST, [K.ID]],
    [T.DEV_TEST_2K, [K.UID, K.TID]],
    [T.REGISTER, [K.ID]],
    [T.USER_CONFIG, [K.ID]],
    [T.USER_EXAM, [K.UID, K.RID]],
    [T.TEST_ANALYSIS, [K.TID]],
    [T.TEST_PREP_PLAN, [K.UID, K.TID]],
    [T.TEST_PREP_PROGRESS, [K.UID, K.TID]],
]);

//
// ****************** Validate SupaBaseDB Tables ****************** //
//

import { unorderedSetsEqual } from "@util/util.ts";
import { dbAgent as agent } from "@db/dbService.ts";

if (import.meta.main) {
    console.log(`--> validating SupaBaseDB tables...`);
    await (async () => {
        const r = await agent.TableList();
        if (r.isErr()) throw new Error(`❌ SupaBase Tables are not ready`);
        const tables = r.value as unknown as TableType[];
        if (!unorderedSetsEqual([...TABLES_SB], tables)) {
            console.debug(tables);
            console.debug(TABLES_SB);
            throw new Error(`SupaBase Tables [${tables}] are inconsistent with [${TABLES_SB}]`);
        }
        console.log("✅ SupaBase Tables are OK");
    })();
}
