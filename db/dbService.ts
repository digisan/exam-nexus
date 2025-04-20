import { ok, err, Result } from "neverthrow"
import { firstWord, haveSameStructure } from "@util/util.ts"
import { createClient } from "@supabase/supabase-js"
import { type TableName } from "@define/const.ts"
await import('@define/const.ts')

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_KEY = Deno.env.get("SUPABASE_KEY");
if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error("SUPABASE_URL and SUPABASE_KEY must be provided");
}
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export type JSONObject = Record<string, any>;
type Data = JSONObject | JSONObject[] | null;

const normalizeDataStructure = (value: Data): Data => {
    if (Array.isArray(value)) {
        if (value.length === 0) return null;
        if (value.length === 1) return value[0];
        return value;
    }
    return value;
}

export class SupabaseAgent {

    async executeSQL(sql: string): Promise<Result<Data, string>> {
        const t = firstWord(sql)?.toUpperCase();
        if (!t || !['SELECT', 'INSERT', 'UPDATE', 'DELETE'].includes(t)) {
            return err('Unsupported SQL Expression');
        }
        const { data, error } = await supabase.rpc('pg_execute', { query: sql, sql_type: t });
        if (error) return err(error.message);
        return ok(data);
    }

    getSupaBase() {
        return supabase;
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

    TableContent(table: TableName): Promise<Result<Data, string>> {
        return this.executeSQL(`SELECT json_agg(t) FROM (SELECT * FROM ${table}) AS t`); // group [{key: value; ...}] from multiple column
    }

    async getSingleRowData(table: TableName): Promise<Result<Data, string>> {
        const { data, error } = await supabase.from(table).select().limit(2);
        if (error) return err(error.message);
        if (!data || data.length === 0) return ok(null);
        if (data.length > 1) return err(`${table} is NOT a single row table`);
        return ok(data[0].data);
    }

    async setSingleRowData(table: TableName, value: Data): Promise<Result<Data, string>> {
        const { data, error } = await supabase.from(table).select().limit(2);
        if (error) return err(error.message);

        const newData = normalizeDataStructure(value);
        if (!data || data.length === 0) {
            return this.insertDataRow(table, newData);
        }
        if (data.length > 1) {
            return err(`${table} is NOT a single row table`);
        }
        return this.updateDataRow(table, data[0].id, newData);
    }

    async upsertSingleRowDataObject(table: TableName, object_id_name: string, value: JSONObject): Promise<Result<Data, string>> {
        if (!(object_id_name in value)) {
            return err(`${table}'s data item value has no id name as ${object_id_name}`);
        }
        const result = await this.getSingleRowData(table)
        if (result.isErr()) {
            return result
        }
        if (!result.value) {
            return this.appendSingleRowData(table, value)
        }

        // array data
        if (Array.isArray(result.value)) {
            const data = result.value as JSONObject[]
            if (!haveSameStructure(value, data[0])) {
                return err(`structure mismatch: expected ${JSON.stringify(data[0])}, got ${JSON.stringify(value)}`)
            }
            const i = data.findIndex(item => item[object_id_name] === value[object_id_name])
            if (i !== -1) {
                data[i] = value
            } else {
                data.push(value)
            }
            return this.setSingleRowData(table, data)
        }

        // single object data
        const data = result.value as JSONObject
        if (!haveSameStructure(value, data)) {
            return err(`structure mismatch: expected ${JSON.stringify(data)}, got ${JSON.stringify(value)}`)
        }
        if (data[object_id_name] === value[object_id_name]) {
            return this.setSingleRowData(table, value)
        }
        return this.appendSingleRowData(table, value)
    }

    async removeSingleRowDataObject(table: TableName, object_id_name: string, object_id_value: any): Promise<Result<Data, string>> {
        const result = await this.getSingleRowData(table)
        if (result.isErr()) {
            return result
        }
        if (!result.value) {
            return ok(null)
        }
        // array data
        if (Array.isArray(result.value)) {
            const data = result.value as JSONObject[]
            if (!(object_id_name in data[0])) {
                return err(`table [${table}] data has no id field as '${object_id_name}'`)
            }
            const i = data.findIndex(item => item[object_id_name] === object_id_value)
            if (i !== -1) {
                data.splice(i, 1)
                return this.setSingleRowData(table, data)
            }
            return ok(null)
        }
        // single object data
        const data = result.value as JSONObject
        if (!(object_id_name in data)) {
            return err(`table [${table}] data has no id field as '${object_id_name}'`)
        }
        if (data[object_id_name] === object_id_value) {
            return this.setSingleRowData(table, null)
        }
        return ok(null)
    }

    async appendSingleRowData(table: TableName, value: JSONObject): Promise<Result<Data, string>> {
        const current = await this.getSingleRowData(table);
        if (current.isErr()) return err(current.error);

        if (Array.isArray(current.value)) {
            current.value.push(value);
            return this.setSingleRowData(table, current.value);
        }
        if (current.value) {
            return this.setSingleRowData(table, [current.value, value]);
        }
        return this.setSingleRowData(table, value);
    }

    ////////////////////////////////////////////////////////////////////////////////////////

    async insertDataRow(table: TableName, value: Data): Promise<Result<JSONObject, string>> {
        const { data, error } = await supabase
            .from(table)
            .insert({ data: value })
            .select()
            .single();

        if (error) return err(error.message);
        if (!data) return err('Insert succeeded but no data returned');
        return ok(data);
    }

    async updateDataRow(table: TableName, id: number, value: Data): Promise<Result<JSONObject, string>> {
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

    async deleteDataRows(table: TableName, ...ids: number[]): Promise<Result<JSONObject[], string>> {
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

    async insertTextRow(table: TableName, value: string): Promise<Result<JSONObject, string>> {
        const { data, error } = await supabase
            .from(table)
            .insert({ content: value })
            .select()
            .single();

        if (error) return err(error.message);
        if (!data) return err('Insert succeeded but no data returned');
        return ok(data);
    }
}