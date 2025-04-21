// ****************** System Configuration ****************** //

//
// created from 'db/sql/ f_*.sql'
// 
const FUNCS_SB = [
    "create_data_table",
    "pg_execute"
] as const;
export type FuncType = typeof FUNCS_SB[number];

export const F_CREATE_DATA_TABLE: FuncType = 'create_data_table'
export const F_PG_EXECUTE: FuncType = 'pg_execute'

//
// created from 'db/sql/v_*.sql'
//
const VIEWS_SB = [
    "user_defined_functions",
] as const;
export type ViewType = typeof VIEWS_SB[number];

export const V_UDF: ViewType = 'user_defined_functions'

//
// self defined in advance by 'create_data_table'
//
const TABLES_SB = [
    "test",
    "register",
    "user_config",
] as const;
export type TableType = typeof TABLES_SB[number];

export const T_TEST: TableType = 'test'
export const T_REGISTER: TableType = 'register'
export const T_CONFIG: TableType = 'user_config'

