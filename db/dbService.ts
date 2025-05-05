import { err, ok, Result } from "neverthrow";
import { firstWord, hasSome, singleton } from "@util/util.ts";
import { createClient } from "@supabase/supabase-js";
import type { Email, EmailKey, Id, IdKey } from "@define/type.ts";
import { isValidId, toIdKey } from "@define/type.ts";
import { F_CREATE_DATA_TABLE, F_PG_EXECUTE, type TableType, V_UDF } from "@define/system.ts";
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

    async getDataRow(table: TableType, id: Id): Promise<Result<Data, string>> {
        const { data, error } = await supabase
            .from(table)
            .select()
            .eq("id", id);

        if (error) return err(error.message);
        if (!data) return err("Fetch succeeded but no data returned");
        if (!hasSome(data)) return ok(null);
        if (Array.isArray(data) && data.length === 1) return ok(data[0]);
        return ok(data);
    }

    async insertDataRow(table: TableType, id: Id, value: Data): Promise<Result<JSONObject, string>> {
        const { data, error } = await supabase
            .from(table)
            .insert({ id, data: value })
            .select()
            .single();

        if (error) return err(error.message);
        if (!data) return err("Insert succeeded but no data returned");
        return ok(data);
    }

    async updateDataRow(table: TableType, id: IdKey<TableType>, value: Data): Promise<Result<JSONObject, string>> {
        const { data, error } = await supabase
            .from(table)
            .update({ data: value })
            .eq("id", id)
            .select()
            .single();

        if (error) return err(error.message);
        if (!data) return err("Update succeeded but no data returned");
        return ok(data);
    }

    async upsertDataRow(table: TableType, id: Id, value: Data): Promise<Result<JSONObject, string>> {
        const r = await toIdKey(id, table);
        if (r.isErr()) return err(r.error);
        const ID = r.value;
        return ID ? this.updateDataRow(table, ID, value) : this.insertDataRow(table, id, value);
    }

    async deleteDataRows(table: TableType, ...ids: Id[]): Promise<Result<JSONObject[], string>> {
        if (ids.length === 0) return ok([]);
        const { data, error } = await supabase
            .from(table)
            .delete()
            .in("id", ids)
            .select();

        if (error) return err(error.message);
        if (!data) return err("Delete succeeded but no data returned");
        return ok(data);
    }

    async firstDataRow(table: TableType, field: string, value: unknown): Promise<Result<Data, string>> {
        const { data, error } = await supabase
            .from(table)
            .select("*")
            .filter(`data->>${field}`, "eq", value)
            .limit(1);

        if (error) return err(error.message);
        if (!data) return err("Fetch succeeded but no data returned");
        if (!hasSome(data)) return ok(null);
        if (Array.isArray(data) && data.length === 1) return ok(data[0]);
        return ok(data);
    }

    async searchDataRows(table: TableType, field: string, value: unknown, n?: number): Promise<Result<JSONObject[], string>> {
        const all = supabase.from(table).select("*").filter(`data->>${field}`, "eq", value);
        const { data, error } = await (n === undefined ? all : all.limit(n));

        if (error) return err(error.message);
        if (!data) return err("Fetch succeeded but no data returned");
        return ok(data);
    }

    ////////////////////////////////////////////////////////////////////////////////////////

    async getSingleRowData(table: TableType, id: IdKey<TableType> | EmailKey<TableType>): Promise<Result<JSONObject | null, string>> {
        if (!isValidId(id)) return err(`${id} is invalid format`);
        const r = await this.getDataRow(table, id);
        if (r.isErr()) return err(r.error);
        if (hasSome(r) && "data" in r.value!) return ok(r.value.data as JSONObject);
        return ok(null);
    }

    async setSingleRowData(table: TableType, id: Id | Email, value: Data): Promise<Result<JSONObject | null, string>> {
        // fetch previous value under id
        const r_k = await toIdKey(id, table);
        if (r_k.isErr()) return err(r_k.error);
        const ID = r_k.value;
        const prevData = ID ? await this.getSingleRowData(table, ID) : null;

        if (!isValidId(id)) return err(`${id} is invalid format`);
        const r = await this.upsertDataRow(table, id, normalizeData(value));
        if (r.isErr()) return r;
        if (hasSome(value)) return ok(r.value.data as JSONObject); // if there are some new data, return new data
        return ok(prevData?.isOk() ? prevData.value : null); // delete action, return previous data
    }

    // remove whole row: return deleted row; remove row data: return null
    async deleteRowData(table: TableType, id: Id | Email, delWholeRow: boolean = false): Promise<Result<Data, string>> {
        if (!isValidId(id)) return err(`${id} is invalid format`);
        return await (delWholeRow ? this.deleteDataRows(table, id) : this.setSingleRowData(table, id, null));
    }
}

export const dbAgent = new (singleton(SupabaseAgent))();
