import { ok, err } from "neverthrow"
import { createClient } from "@supabase/supabase-js"
await import('@secret/const.ts')

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_KEY = Deno.env.get("SUPABASE_KEY");

if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error("SUPABASE_URL and SUPABASE_KEY must be provided");
}

const firstWord = (text: string): string | null => {
    const words = text.trim().split(/\s+/); // 按空格拆分单词
    return words.length > 0 ? words[0] : null;
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export class SupabaseAgent {

    getSupaBase() {
        return supabase;
    }

    async executeSQL(sql: string) {
        const t = firstWord(sql)
        if (!t || !['SELECT', 'INSERT', 'UPDATE', 'DELETE'].includes(t.toUpperCase())) {
            return err(`Unsupported SQL Expression`)
        }
        const { data, error } = await supabase.rpc('pg_execute', { query: sql, sql_type: t });
        return error ? err(error) : ok(data);
    }

    async PgVersion() {
        return await this.executeSQL(`SELECT json_build_object('version', version())`); // make one returning object
    }

    async DbInfo() {
        return await this.executeSQL(`SELECT json_build_object('dbname', current_database(), 'user', session_user)`);
    }

    async TableCount() {
        return await this.executeSQL(`SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public'`);
    }

    async AllTables() {
        return await this.executeSQL(`SELECT json_agg(tablename) FROM pg_tables WHERE schemaname = 'public'`); // group [value] from single column
    }

    async TableContent(table: string) {
        return await this.executeSQL(`SELECT json_agg(t) FROM (SELECT * FROM ${table}) AS t`); // group [{key: value; ...}] from multiple column
    }

    async InsertObject(table: string, object: any) {
        const { data, error } = await supabase
            .from(table)
            .insert({ data: object });
        return error ? err(error) : ok(data);
    }

    async DeleteObject(table: string, id: number) {
        const { data, error } = await supabase
            .from(table)
            .delete()
            .eq('id', id);
        return error ? err(error) : ok(data);
    }

    async UpdateObject(table: string, id: number, object: any) {
        const { data, error } = await supabase
            .from(table)
            .update({ data: object })
            .eq('id', id);
        return error ? err(error) : ok(data);
    }
}
