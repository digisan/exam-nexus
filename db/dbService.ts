import { ok, err, Result } from "neverthrow"
import { firstWord, hasSome, haveSameStructure } from "@util/util.ts"
import { createClient } from "@supabase/supabase-js"
import type { Data, Id, IdExist, JSONObject } from "@define/type.ts"
import { isValidId, toExistId } from "@define/type.ts"
import { F_PG_EXECUTE, F_CREATE_DATA_TABLE, V_UDF, type TableType } from "@define/system.ts";
await import('@define/env.ts')

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_KEY = Deno.env.get("SUPABASE_KEY");
if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error("SUPABASE_URL and SUPABASE_KEY must be provided");
}
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const normalizeDataStructure = (value: Data): Data => {
    if (Array.isArray(value)) {
        if (value.length === 0) return null;
        if (value.length === 1) return value[0];
        return value;
    }
    return value;
}

export class SupabaseAgent {

    getSupaBase() { return supabase; }

    async listUserFunctions(): Promise<Result<Data, string>> {
        const { data, error } = await supabase.from(V_UDF).select('function_name')
        if (error) return err(error.message)
        return ok(data.map((d) => d.function_name))
    }

    async createDataTable(name: TableType): Promise<Result<Data, string>> {
        const { data, error } = await supabase.rpc(F_CREATE_DATA_TABLE, { name });
        if (error) return err(error.message)
        return ok(data)
    }

    async executeSQL(sql: string): Promise<Result<Data, string>> {
        const t = firstWord(sql)?.toUpperCase();
        if (!t || !['SELECT', 'INSERT', 'UPDATE', 'DELETE'].includes(t)) {
            return err('Unsupported SQL Expression');
        }
        const { data, error } = await supabase.rpc(F_PG_EXECUTE, { query: sql, sql_type: t });
        if (error) return err(error.message);
        return ok(data);
    }

    PgVer(): Promise<Result<Data, string>> {
        return this.executeSQL(`SELECT json_build_object('version', version())`); // make one returning object
    }

    DbInfo(): Promise<Result<Data, string>> {
        return this.executeSQL(`SELECT json_build_object('dbname', current_database(), 'user', session_user)`);
    }

    TableCount(): Promise<Result<Data, string>> {
        return this.executeSQL(`SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public'`);
    }

    TableList(): Promise<Result<Data, string>> {
        return this.executeSQL(`SELECT json_agg(tablename) FROM pg_tables WHERE schemaname = 'public'`); // group [value] from single column
    }

    TableContent(table: TableType): Promise<Result<Data, string>> {
        return this.executeSQL(`SELECT json_agg(t) FROM (SELECT * FROM ${table}) AS t`); // group [{key: value; ...}] from multiple column
    }

    ////////////////////////////////////////////////////////////////////////////////////////

    async getDataRow(table: TableType, id: Id): Promise<Result<JSONObject, string>> {
        const { data, error } = await supabase
            .from(table)
            .select()
            .eq('id', id);

        if (error) return err(error.message);
        if (!data) return err('Fetch succeeded but no data returned');
        if (hasSome(data) && Array.isArray(data) && data.length === 1) {
            return ok(data[0])
        }
        return ok(data);
    }

    async insertDataRow(table: TableType, id: Id, value: Data): Promise<Result<JSONObject, string>> {
        const { data, error } = await supabase
            .from(table)
            .insert({ id, data: value })
            .select()
            .single();

        if (error) return err(error.message);
        if (!data) return err('Insert succeeded but no data returned');
        return ok(data);
    }

    async updateDataRow(table: TableType, id: IdExist, value: Data): Promise<Result<JSONObject, string>> {
        const { data, error } = await supabase
            .from(table)
            .update({ data: value })
            .eq('id', id)
            .select()
            .single();

        if (error) return err(error.message);
        if (!data) return err('Update succeeded but no data returned');
        return ok(data);
    }

    async upsertDataRow(table: TableType, id: Id, value: Data): Promise<Result<JSONObject, string>> {
        const ID = await toExistId(table, id)
        return ID ? this.updateDataRow(table, ID, value) : this.insertDataRow(table, id, value)
    }

    async deleteDataRows(table: TableType, ...ids: Id[]): Promise<Result<JSONObject[], string>> {
        if (ids.length === 0) return ok([]);
        const { data, error } = await supabase
            .from(table)
            .delete()
            .in('id', ids)
            .select();

        if (error) return err(error.message);
        if (!data) return err('Delete succeeded but no data returned');
        return ok(data);
    }

    ////////////////////////////////////////////////////////////////////////////////////////

    async getSingleRowData(table: TableType, id: IdExist): Promise<Result<Data, string>> {
        if (!isValidId(id)) {
            return err(`${id} is invalid format`);
        }
        const r = await this.getDataRow(table, id)
        if (r.isErr()) return r
        if (hasSome(r)) return ok(r.value.data)
        return ok(null)
    }

    async setSingleRowData(table: TableType, id: Id, value: Data): Promise<Result<Data, string>> {
        // try to fetch previous value under id
        const ID = await toExistId(table, id)
        const prevData = ID ? await this.getSingleRowData(table, ID) : null

        const r = await this.upsertDataRow(table, id, normalizeDataStructure(value))
        if (r.isErr()) return r
        if (hasSome(value)) {
            return ok(r.value.data) // if there are some new data, return new data
        }
        return ok(prevData?.isOk() ? prevData.value : null) // delete action, return previous data
    }

    // remove whole row: return deleted row; remove row data: return null
    async deleteRowData(table: TableType, id: Id, delWholeRow: boolean = false): Promise<Result<Data, string>> {
        return delWholeRow ? await this.deleteDataRows(table, id) : await this.setSingleRowData(table, id, null)
    }

    ////////////////////////////////////////////////////////////////////////////////////////

    // async insertTextRow(table: TableType, value: string): Promise<Result<JSONObject, string>> {
    //     const { data, error } = await supabase
    //         .from(table)
    //         .insert({ content: value })
    //         .select()
    //         .single();

    //     if (error) return err(error.message);
    //     if (!data) return err('Insert succeeded but no data returned');
    //     return ok(data);
    // }
}