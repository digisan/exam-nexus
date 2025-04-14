// dbService.ts
import { ok, err, Result } from "neverthrow"
import { createClient } from "@supabase/supabase-js"
await import('@secret/const.ts')

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_KEY = Deno.env.get("SUPABASE_KEY");

if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error("SUPABASE_URL and SUPABASE_KEY must be provided");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

type Object = Record<string, any>;
type Data = Object | Object[] | null;

function normalizeDataStructure(value: Data): Data {
    if (Array.isArray(value)) {
        if (value.length === 0) return null;
        if (value.length === 1) return value[0];
        return value;
    }
    return value;
}

const firstWord = (sql: string): string | null => sql.trim().split(/\s+/)[0] ?? null;

// --- Public CRUD methods ---

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

    TableContent(table: string): Promise<Result<Data, string>> {
        return this.executeSQL(`SELECT json_agg(t) FROM (SELECT * FROM ${table}) AS t`); // group [{key: value; ...}] from multiple column
    }

    async getSingleRowData(table: string): Promise<Result<Data, string>> {
        const { data, error } = await supabase.from(table).select().limit(2);
        if (error) return err(error.message);
        if (!data || data.length === 0) return ok(null);
        if (data.length > 1) return err(`${table} is NOT a single row table`);
        return ok(data[0].data);
    }

    async setSingleRowData(table: string, value: Data): Promise<Result<Data, string>> {
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

    async appendSingleRowData(table: string, value: Object): Promise<Result<Data, string>> {
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

    async insertDataRow(table: string, value: Data): Promise<Result<Object, string>> {
        const { data, error } = await supabase
            .from(table)
            .insert({ data: value })
            .select()
            .single();

        if (error) return err(error.message);
        if (!data) return err('Insert succeeded but no data returned');
        return ok(data);
    }

    async updateDataRow(table: string, id: number, value: Data): Promise<Result<Object, string>> {
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

    async deleteDataRow(table: string, id: number): Promise<Result<Object, string>> {
        const { data, error } = await supabase
            .from(table)
            .delete()
            .eq('id', id)
            .select()
            .single();

        if (error) return err(error.message);
        if (!data) return err('Delete succeeded but no data returned');
        return ok(data);
    }

    ////////////////////////////////////////////////////////////////////////////////////////

    async insertTextRow(table: string, value: string): Promise<Result<Object, string>> {
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
