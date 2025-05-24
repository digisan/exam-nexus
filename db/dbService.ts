import { err, ok, Result } from "neverthrow";
import { firstWord, singleton, some } from "@util/util.ts";
import { createClient } from "@supabase/supabase-js";
import type { Id, IdKey, IdObj, IdObjKey } from "@define/id.ts";
import { isValidId, isValidIdObj } from "@define/id.ts";
import { F_CREATE_DATA_TABLE, F_CREATE_DATA_TABLE_KEYS, F_PG_EXECUTE, V_UDF } from "@define/system.ts";
import type { KeyType, TableType } from "@define/system.ts";
import { env_get } from "@define/env.ts";
await import("@define/env.ts");

export type JSONObject = Record<string, unknown>;
export type Data = JSONObject | JSONObject[] | null;
export const normalizeData = (value: Data): Data => {
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
    getSupaBase() {
        return supabase;
    }

    async listUserFunctions(): Promise<Result<Data, string>> {
        const { data, error } = await supabase.from(V_UDF).select("function_name");
        if (error) return err(error.message);
        return ok(data.map((d) => d.function_name));
    }

    async createDataTable(name: TableType): Promise<Result<Data, string>> {
        const { data, error } = await supabase.rpc(F_CREATE_DATA_TABLE, { name });
        if (error) return err(error.message);
        return ok(data);
    }

    async createDataTableKeys(name: TableType, key_parts: KeyType[]): Promise<Result<Data, string>> {
        const { data, error } = await supabase.rpc(F_CREATE_DATA_TABLE_KEYS, { name, key_parts });
        if (error) return err(error.message);
        return ok(data);
    }

    async executeSQL(sql: string): Promise<Result<Data, string>> {
        const t = firstWord(sql)?.toUpperCase();
        if (!t || !["SELECT", "INSERT", "UPDATE", "DELETE"].includes(t)) {
            return err("Unsupported SQL Expression");
        }
        const { data, error } = await supabase.rpc(F_PG_EXECUTE, { query: sql, sql_type: t });
        if (error) return err(error.message);
        return ok(data);
    }

    async PgVer(): Promise<Result<Data, string>> {
        return await this.executeSQL(`SELECT json_build_object('version', version())`); // make one returning object
    }

    async DbInfo(): Promise<Result<Data, string>> {
        return await this.executeSQL(`SELECT json_build_object('dbname', current_database(), 'user', session_user)`);
    }

    async TableCount(): Promise<Result<Data, string>> {
        return await this.executeSQL(`SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public'`);
    }

    async TableList(): Promise<Result<Data, string>> {
        return await this.executeSQL(`SELECT json_agg(tablename) FROM pg_tables WHERE schemaname = 'public'`); // group [value] from single column
    }

    async TableContent(table: TableType): Promise<Result<Data, string>> {
        return await this.executeSQL(`SELECT json_agg(t) FROM (SELECT * FROM ${table}) AS t`); // group [{key: value; ...}] from multiple column
    }

    async TableTopRows(table: TableType, n: number): Promise<Result<Data, string>> {
        return await this.executeSQL(`SELECT json_agg(t) FROM (SELECT * FROM ${table} LIMIT ${n}) AS t`);
    }

    ////////////////////////////////////////////////////////////////////////////////////////

    async getDataRow<T extends TableType, Ks extends readonly KeyType[]>(table: T, id: Id | IdObj<Ks>): Promise<Result<Data, string>> {
        const isStrId = typeof id === "string";
        const t = supabase.from(table).select("*");
        const query = isStrId ? t.eq("id", id) : t.match(id);
        const { data, error } = await query;
        if (error) return err(error.message);
        if (!some(data)) return ok(null);
        if (Array.isArray(data) && data.length === 1) return ok(data[0]);
        return ok(data);
    }

    async insertDataRow<T extends TableType, Ks extends readonly KeyType[]>(table: T, id: Id | IdObj<Ks>, value: Data): Promise<Result<JSONObject, string>> {
        const isStrId = typeof id === "string";
        const t = supabase.from(table);
        const query = isStrId ? t.insert({ id, data: value }).select().single() : t.insert({ ...id, data: value }).select().single();
        const { data, error } = await query;
        if (error) return err(error.message);
        if (!data) return err("Insert succeeded but no data returned");
        return ok(data);
    }

    async updateDataRow<T extends TableType, Ks extends readonly KeyType[]>(table: T, id: IdKey<T> | IdObjKey<T, Ks>, value: Data): Promise<Result<JSONObject, string>> {
        const isStrId = typeof id === "string";
        const t = supabase.from(table).update({ data: value });
        const query = isStrId ? t.eq("id", id).select().single() : t.match(id).select().single();
        const { data, error } = await query;
        if (error) return err(error.message);
        if (!data) return err("Update succeeded but no data returned");
        return ok(data);
    }

    async upsertDataRow<T extends TableType, Ks extends readonly KeyType[]>(table: T, id: Id | IdObj<Ks>, value: Data): Promise<Result<JSONObject, string>> {
        const isStrId = typeof id === "string";
        const t = supabase.from(table);
        const query = isStrId ? t.upsert({ id, data: value }).select().single() : t.upsert({ ...id, data: value }).select().single();
        const { data, error } = await query;
        if (error) return err(error.message);
        if (!data) return err("Upsert succeeded but no data returned");
        return ok(data);
    }

    async deleteDataRows<T extends TableType, Ks extends readonly KeyType[]>(table: T, ...ids: Id[] | IdObj<Ks>[]): Promise<Result<JSONObject[], string>> {
        if (ids.length === 0) return ok([]);
        let result: JSONObject[] = [];
        if (Array.isArray(ids) && ids.every((id) => typeof id === "string")) {
            const { data, error } = await supabase.from(table).delete().in("id", ids).select();
            if (error) return err(error.message);
            return ok(data ?? []);
        } else {
            for (const idObj of ids) {
                const { data, error } = await supabase.from(table).delete().match(idObj).select();
                if (error) return err(error.message);
                if (Array.isArray(data)) result = result.concat(data);
            }
            return ok(result);
        }
    }

    async firstDataRow<T extends TableType>(table: T, field: string, value: unknown): Promise<Result<Data, string>> {
        const { data, error } = await supabase.from(table).select("*").filter(`data->>${field}`, "eq", value).limit(1);
        if (error) return err(error.message);
        if (!some(data)) return ok(null);
        if (Array.isArray(data) && data.length === 1) return ok(data[0]);
        return ok(data);
    }

    async searchDataRows<T extends TableType>(table: T, field: string, value: unknown, n?: number): Promise<Result<JSONObject[], string>> {
        const all = supabase.from(table).select("*").filter(`data->>${field}`, "eq", value);
        const { data, error } = await (n === undefined ? all : all.limit(n));
        if (error) return err(error.message);
        return ok(data ?? []);
    }

    ////////////////////////////////////////////////////////////////////////////////////////

    async getSingleRowData<T extends TableType, Ks extends readonly KeyType[]>(table: T, id: IdKey<T> | IdObjKey<T, Ks>, keys?: Ks): Promise<Result<JSONObject | null, string>> {
        const isStrId = typeof id === "string";
        if (isStrId && !isValidId(id)) return err("invalid id");
        if (!isStrId && (keys === undefined || !isValidIdObj(id, keys))) return err("invalid id");
        const r = await this.getDataRow(table, id);
        if (r.isErr()) return err(r.error);
        if (some(r) && "data" in r.value!) return ok(r.value.data as JSONObject);
        return ok(null);
    }

    async setSingleRowData<T extends TableType, Ks extends readonly KeyType[]>(table: T, id: Id | IdObj<Ks>, value: Data): Promise<Result<JSONObject | null, string>> {
        return await this.upsertDataRow(table, id, normalizeData(value));
    }

    // remove whole row: return deleted row; remove row data: return null
    async deleteRowData<T extends TableType, Ks extends readonly KeyType[]>(table: T, id: Id | IdObj<Ks>, delWholeRow: boolean = false): Promise<Result<Data, string>> {
        const isStrId = typeof id === "string";
        if (delWholeRow) {
            const ids = isStrId ? [id as Id] : [id as IdObj<Ks>];
            return await this.deleteDataRows(table, ...ids);
        } else {
            return await this.setSingleRowData(table, id, null);
        }
    }
}

export const dbAgent = new (singleton(SupabaseAgent))();
