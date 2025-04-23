import { SupabaseAgent } from "@db/dbService.ts";
import type { LanguageType, RegionType } from "@define/config.ts";
import { REGIONS, LANGUAGES } from "@define/config.ts";
import { type TableType } from "@define/system.ts";
import { hasSome } from "@util/util.ts";

export type JSONObject = Record<string, any>;
export type Data = JSONObject | JSONObject[] | null;

type Brand<T, B> = T & { __brand: B };

export type Password = Brand<string, 'Password'>;
export const isAllowedPassword = (s: string | null): s is Password => {
    const reg = /^\S*(?=\S{8,})(?=\S*\d)(?=\S*[A-Z])(?=\S*[a-z])(?=\S*[!@#$%^&*?_ ])\S*$/
    return reg.test(s ?? "")
}

export type Region = Brand<RegionType, 'Region'>;
export const isValidRegion = (s: string | null): s is Region => REGIONS.includes(s as RegionType)

export type Language = Brand<LanguageType, 'Language'>;
export const isValidLanguage = (s: string | null): s is Language => LANGUAGES.includes(s as LanguageType)

////////////////////////////////////////////////

export type Id = Brand<string, 'Id'>;
export const isValidId = (s: string | null): s is Id => !!s && s.length > 3

export type IdKey<T extends TableType> = Brand<string, `IdKey<${T}>`>
export const toIdKey = async <T extends TableType>(s: string | Id, table: T): Promise<IdKey<T> | null> => {
    if (!isValidId(s)) return null;
    const sa = new SupabaseAgent();
    if (!hasSome(await sa.getDataRow(table, s))) return null;
    return s as unknown as IdKey<T>
}

////////////////////////////////////////////////

export type Email = Brand<string, 'Email'>;
export const isEmail = (s: string | null): s is Email => {
    const reg = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return reg.test(s ?? "")
}

export type EmailKey<T extends TableType> = Brand<string, `EmailKey<${T}>`>
export const toEmailKey = async <T extends TableType>(s: string | Email, table: T): Promise<EmailKey<T> | null> => {
    if (!isValidId(s) || !isEmail(s)) return null;
    const sa = new SupabaseAgent();
    if (!hasSome(await sa.getDataRow(table, s))) return null;
    return s as unknown as EmailKey<T>
}

////////////////////////////////////////////////


// export type IdRef<T1 extends TableType, F extends string, T2 extends TableType> = Brand<string, `IdRef<${T1}_${F}_${T2}>`>
// export const toIdRef = async <T1 extends TableType, F extends string, T2 extends TableType>(s: string | Id | IdKey<T2>, table: T1, field: F, ref_table: T2): Promise<IdRef<T1, F, T2> | null> => {

//     if (!await toIdKey(s, ref_table)) return null

//     const sa = new SupabaseAgent();
//     sa.TableContent(table)

//     return s as unknown as IdRef<T1, F, T2>
// }




// const valid_id_ref = async (s: string, table: TableType, id: string, field: string, ref_table: TableType): Promise<boolean> => {
//     if (!await exist_id(s, ref_table)) return false;
//     const ID = await toIdKey(id, table)
//     if (!ID) return false
//     const sa = new SupabaseAgent();

//     const r = await sa.getSingleRowData(table, ID) as JSONObject
//     if (r.isErr() || !hasSome(r.value) || !Object.hasOwn(r.value, field)) return false
//     return r.value?.field === s
// }
// export const toIdRef = async (s: string, table: TableType, id: string, field: string, ref_table: TableType): Promise<IdRef | null> => {
//     return (await valid_id_ref(s, table, id, field, ref_table)) ? (s as IdRef) : null;
// }
