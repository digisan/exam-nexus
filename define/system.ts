// ****************** System Configuration ****************** //

//
// created from 'db/sql/ f_*.sql'
//
const FUNCS_SB = [
    "create_data_table",
    "pg_execute",
] as const;
export type FuncType = typeof FUNCS_SB[number];

export const F_CREATE_DATA_TABLE: FuncType = "create_data_table";
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
// self defined in advance by 'create_data_table'
//
const TABLES_SB = [
    "dev_test",
    "register",
    "user_config",
    "user_exam",
    "test_analysis",
    "test_prep_plan",
    "test_prep_process"
] as const;

export type TableType = typeof TABLES_SB[number];

const defineTable = <T extends TableType>(value: T): T => value;

const T = {
    TEST: defineTable("dev_test"),
    REGISTER: defineTable("register"),
    USER_CONFIG: defineTable("user_config"),
    USER_EXAM: defineTable("user_exam"),
    TEST_ANALYSIS: defineTable("test_analysis"),
    TEST_PREP_PLAN: defineTable("test_prep_plan"),
    TEST_PREP_PROCESS: defineTable("test_prep_process"),
} as const;

export const T_TEST = T.TEST;
export const T_REGISTER = T.REGISTER;
export const T_USER_CONFIG = T.USER_CONFIG;
export const T_USER_EXAM = T.USER_EXAM;
export const T_TEST_ANALYSIS = T.TEST_ANALYSIS;
export const T_TEST_PREP_PLAN = T.TEST_PREP_PLAN;
export const T_TEST_PREP_PROCESS = T.TEST_PREP_PROCESS;

export type T_TEST = typeof T.TEST;
export type T_REGISTER = typeof T.REGISTER;
export type T_USER_CONFIG = typeof T.USER_CONFIG;
export type T_USER_EXAM = typeof T.USER_EXAM;
export type T_TEST_ANALYSIS = typeof T.TEST_ANALYSIS;
export type T_TEST_PREP_PLAN = typeof T.TEST_PREP_PLAN;
export type T_TEST_PREP_PROCESS = typeof T.TEST_PREP_PROCESS;

//
// ****************** Validate SupaBaseDB tables ****************** //
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
