import { err, ok, Result } from "neverthrow";
import { firstWord, some } from "@util/util.ts";
import { createClient } from "@supabase/supabase-js";
import type { Id, IdObj, IdSKey, IdSKeyObj } from "@define/id.ts";
import { isValidId, isValidIdObj } from "@define/id.ts";
import { F_CREATE_DATA_TABLE, F_CREATE_DATA_TABLE_KEYS, F_PG_EXECUTE, TABLES_SB, V_UDF } from "@define/system.ts";
import type { KeyType, TableType } from "@define/system.ts";
import { env_get } from "@define/env.ts";
await import("@define/env.ts");

export type JSONObject = Record<string, unknown>;
export type Data = JSONObject | JSONObject[] | null;
export const normalize = (value: Data): Data => {
    if (Array.isArray(value)) {
        if (value.length === 0) return null;
        if (value.length === 1) return value[0];
        return value;
    }
    return value;
};

const SUPABASE_URL = env_get("SUPABASE_URL");
const SUPABASE_KEY = env_get("SUPABASE_KEY");
if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error("SUPABASE_URL and SUPABASE_KEY must be provided");
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

class SupabaseAgent {
    GetSupaBase() {
        return supabase;
    }

    async ListUserFunction(): Promise<Result<Data, string>> {
        const { data, error } = await supabase.from(V_UDF).select("function_name");
        if (error) return err(error.message);
        return ok(data.map((d) => d.function_name));
    }

    async CreateDataTable<T extends TableType>(name: T): Promise<Result<Data, string>> {
        const { data, error } = await supabase.rpc(F_CREATE_DATA_TABLE, { name });
        if (error) return err(error.message);
        return ok(data);
    }

    async CreateDataTableWithKeys<T extends TableType, Ks extends readonly KeyType[]>(name: T, key_parts: Ks): Promise<Result<Data, string>> {
        if (!TABLES_SB.includes(name)) return err(`CANNOT Create Table with provided name '${name}'`);
        const { data, error } = await supabase.rpc(F_CREATE_DATA_TABLE_KEYS, { name, key_parts });
        if (error) return err(error.message);
        return ok(data);
    }

    async ExecuteSQL(sql: string): Promise<Result<Data, string>> {
        const t = firstWord(sql)?.toUpperCase();
        if (!t || !["SELECT", "INSERT", "UPDATE", "DELETE"].includes(t)) {
            return err("Unsupported SQL Expression");
        }
        const { data, error } = await supabase.rpc(F_PG_EXECUTE, { query: sql, sql_type: t });
        if (error) return err(error.message);
        return ok(data);
    }

    async PgVer(): Promise<Result<Data, string>> {
        return await this.ExecuteSQL(`SELECT json_build_object('version', version())`); // make one returning object
    }

    async DbInfo(): Promise<Result<Data, string>> {
        return await this.ExecuteSQL(`SELECT json_build_object('dbname', current_database(), 'user', session_user)`);
    }

    async TableCount(): Promise<Result<Data, string>> {
        return await this.ExecuteSQL(`SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public'`);
    }

    async TableList(): Promise<Result<Data, string>> {
        return await this.ExecuteSQL(`SELECT json_agg(tablename) FROM pg_tables WHERE schemaname = 'public'`); // group [value] from single column
    }

    async TableContent<T extends TableType>(table: T): Promise<Result<Data, string>> {
        return await this.ExecuteSQL(`SELECT json_agg(t) FROM (SELECT * FROM ${table}) AS t`); // group [{key: value; ...}] from multiple column
    }

    async TableTopRows<T extends TableType>(table: T, n: number): Promise<Result<Data, string>> {
        return await this.ExecuteSQL(`SELECT json_agg(t) FROM (SELECT * FROM ${table} LIMIT ${n}) AS t`);
    }

    ////////////////////////////////////////////////////////////////////////////////////////

    /**
     * check how many rows in a table
     * @param table 表名
     * @return promise ok(rows' count); err(error message)
     */
    async CountRow<T extends TableType>(table: T): Promise<Result<number | null, string>> {
        const { count, error } = await supabase.from(table).select("*", { count: "exact", head: true });
        if (error) return err(error.message);
        return ok(count);
    }

    /**
     * clear all rows in a table
     * @param table 表名
     * @return promise ok(rows' original count); err(error message)
     */
    async ClearTable<T extends TableType>(table: T): Promise<Result<number, string>> {
        const rn_before = await this.CountRow(table);
        if (rn_before.isErr()) return err(rn_before.error);

        const { error } = await supabase.from(table).delete().gt("created_at", "1900-01-01");
        if (error) return err(error.message);

        const rn_after = await this.CountRow(table);
        if (rn_after.isErr()) return err(rn_after.error);
        if (rn_after.value !== 0) return err(`ClearTable failed`);

        return ok(rn_before.value!);
    }

    async ClearTables<T extends TableType>(...tables: T[]): Promise<Result<number[], string>> {
        const num: number[] = [];
        for (const t of tables) {
            const r = await this.ClearTable(t);
            if (r.isErr()) return err(r.error);
            num.push(r.value);
        }
        return ok(num);
    }

    async QueryColumns<T extends TableType>(table: T, columns: string | string[]): Promise<Result<unknown[] | unknown[][], string>> {
        const columnList = Array.isArray(columns) ? columns : [columns];
        const { data, error } = await supabase.from(table).select(columnList.join(","));
        if (error) return err(error.message);
        const rows = data as Record<string, any>[];
        if (!Array.isArray(columns)) {
            return ok(rows.map((row) => row[columns]));
        }
        return ok(rows.map((row) => columns.map((col) => row[col])));
    }

    async QueryId<T extends TableType, K extends KeyType>(table: T, columns: K | K[]): Promise<Result<Id[] | Id[][], string>> {
        const r = await this.QueryColumns(table, columns);
        if (r.isErr()) return err(r.error);
        if (!Array.isArray(columns)) {
            return ok(r.value as Id[]);
        }
        return ok(r.value as Id[][]);
    }

    async GetDataRow<T extends TableType, Ks extends readonly KeyType[]>(table: T, id: Id | IdObj<Ks>, key?: string): Promise<Result<Data, string>> {
        const isStrId = typeof id === "string";
        const t = supabase.from(table).select("*");
        const query = isStrId ? t.eq(key ?? "id", id) : t.match(id);
        const { data, error } = await query;
        if (error) return err(error.message);
        if (!some(data)) return ok(null);
        if (Array.isArray(data) && data.length === 1) return ok(data[0]);
        return ok(data);
    }

    async InsertDataRow<T extends TableType, Ks extends readonly KeyType[]>(table: T, id: Id | IdObj<Ks>, value: Data): Promise<Result<JSONObject, string>> {
        const rn_before = await this.CountRow(table);
        if (rn_before.isErr()) return err(rn_before.error);

        const isStrId = typeof id === "string";
        const t = supabase.from(table);
        const query = isStrId ? t.insert({ id, data: value }).select().single() : t.insert({ ...id, data: value }).select().single();
        const { data, error } = await query;
        if (error) return err(error.message);
        if (!data) return err("Insert succeeded but no data returned");

        const rn_after = await this.CountRow(table);
        if (rn_after.isErr()) return err(rn_after.error);
        if (rn_after.value! - rn_before.value! !== 1) return err(`InsertDataRow failed`);

        return ok(data);
    }

    async UpdateDataRow<T extends TableType, Ks extends readonly KeyType[]>(table: T, id: IdSKey<T> | IdSKeyObj<T, Ks>, value: Data, key?: string): Promise<Result<JSONObject, string>> {
        const rn_before = await this.CountRow(table);
        if (rn_before.isErr()) return err(rn_before.error);

        const isStrId = typeof id === "string";
        const t = supabase.from(table).update({ data: value });
        const query = isStrId ? t.eq(key ?? "id", id).select().single() : t.match(id).select().single();
        const { data, error } = await query;
        if (error) return err(error.message);
        if (!data) return err("Update succeeded but no data returned");

        const rn_after = await this.CountRow(table);
        if (rn_after.isErr()) return err(rn_after.error);
        if (rn_after.value! - rn_before.value! !== 0) return err(`UpdateDataRow failed`);

        return ok(data);
    }

    async UpsertDataRow<T extends TableType, Ks extends readonly KeyType[]>(table: T, id: Id | IdObj<Ks>, value: Data): Promise<Result<JSONObject, string>> {
        const rn_before = await this.CountRow(table);
        if (rn_before.isErr()) return err(rn_before.error);

        const isStrId = typeof id === "string";
        const t = supabase.from(table);
        const query = isStrId ? t.upsert({ id, data: value }).select().single() : t.upsert({ ...id, data: value }).select().single();
        const { data, error } = await query;
        if (error) return err(error.message);
        if (!data) return err("Upsert succeeded but no data returned");

        const rn_after = await this.CountRow(table);
        if (rn_after.isErr()) return err(rn_after.error);
        const d = rn_after.value! - rn_before.value!;
        if (d !== 0 && d !== 1) return err(`UpsertDataRow failed`);

        return ok(data);
    }

    async DeleteDataRows<T extends TableType, Ks extends readonly KeyType[]>(table: T, ...ids: Id[] | IdObj<Ks>[]): Promise<Result<JSONObject[], string>> {
        const rn_before = await this.CountRow(table);
        if (rn_before.isErr()) return err(rn_before.error);

        if (ids.length === 0) return ok([]);

        if (Array.isArray(ids) && ids.every((id) => typeof id === "string")) {
            const { data, error } = await supabase.from(table).delete().in("id", ids).select();
            if (error) return err(error.message);

            const rn_after = await this.CountRow(table);
            if (rn_after.isErr()) return err(rn_after.error);
            const d = rn_before.value! - rn_after.value!;
            if (d !== data.length) return err(`DeleteDataRows failed`);

            return ok(data ?? []);
        } else {
            let result: JSONObject[] = [];
            for (const idObj of ids) {
                const { data, error } = await supabase.from(table).delete().match(idObj).select();
                if (error) return err(error.message);
                if (Array.isArray(data)) result = result.concat(data);
            }

            const rn_after = await this.CountRow(table);
            if (rn_after.isErr()) return err(rn_after.error);
            const d = rn_before.value! - rn_after.value!;
            if (d !== result.length) return err(`DeleteDataRows failed`);

            return ok(result);
        }
    }

    async FirstDataRow<T extends TableType>(table: T, field: string, value: unknown): Promise<Result<Data, string>> {
        const { data, error } = await supabase.from(table).select("*").filter(`data->>${field}`, "eq", value).limit(1);
        if (error) return err(error.message);
        if (!some(data)) return ok(null);
        if (Array.isArray(data) && data.length === 1) return ok(data[0]);
        return ok(data);
    }

    async SearchDataRows<T extends TableType>(table: T, field: string, value: unknown, n?: number): Promise<Result<JSONObject[], string>> {
        const all = supabase.from(table).select("*").filter(`data->>${field}`, "eq", value);
        const { data, error } = await (n === undefined ? all : all.limit(n));
        if (error) return err(error.message);
        return ok(data ?? []);
    }

    ////////////////////////////////////////////////////////////////////////////////////////

    // can only fetch 'id' matched value
    async GetSingleRowData<T extends TableType, Ks extends readonly KeyType[]>(table: T, id: IdSKey<T> | IdSKeyObj<T, Ks>, keys?: Ks): Promise<Result<JSONObject | null, string>> {
        const isStrId = typeof id === "string";
        if (isStrId && !isValidId(id)) return err("invalid id");
        if (!isStrId && (keys === undefined || !isValidIdObj(id, keys))) return err("invalid id");
        const r = await this.GetDataRow(table, id);
        if (r.isErr()) return err(r.error);
        if (some(r) && "data" in r.value!) return ok(r.value.data as JSONObject);
        return ok(null);
    }

    async SetSingleRowData<T extends TableType, Ks extends readonly KeyType[]>(table: T, id: Id | IdObj<Ks>, value: Data): Promise<Result<JSONObject | null, string>> {
        return await this.UpsertDataRow(table, id, normalize(value));
    }

    // remove whole row: return deleted row; remove row data: return null
    async DeleteRowData<T extends TableType, Ks extends readonly KeyType[]>(table: T, id: Id | IdObj<Ks>, delWholeRow: boolean = false): Promise<Result<Data, string>> {
        const isStrId = typeof id === "string";
        if (delWholeRow) {
            const ids = isStrId ? [id as Id] : [id as IdObj<Ks>];
            return await this.DeleteDataRows(table, ...ids);
        } else {
            return await this.SetSingleRowData(table, id, null);
        }
    }
}

export const dbAgent = new SupabaseAgent();
