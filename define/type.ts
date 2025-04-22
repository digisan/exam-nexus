import { SupabaseAgent } from "@db/dbService.ts";
import type { LanguageType, RegionType } from "@define/config.ts";
import { REGIONS, LANGUAGES } from "@define/config.ts";
import { type TableType } from "@define/system.ts";
import { hasSome } from "@util/util.ts";

export type JSONObject = Record<string, any>;
export type Data = JSONObject | JSONObject[] | null;

type Brand<K, T> = K & { __brand: T };

export type Password = Brand<string, 'Password'>;
export const isAllowedPassword = (s: string | null): s is Password => {
    const reg = /^\S*(?=\S{8,})(?=\S*\d)(?=\S*[A-Z])(?=\S*[a-z])(?=\S*[!@#$%^&*?_ ])\S*$/
    return reg.test(s ?? "")
}

export type Region = Brand<RegionType, 'Region'>;
export const isValidRegion = (s: string | null): s is Region => REGIONS.includes(s as RegionType)

export type Language = Brand<LanguageType, 'Language'>;
export const isValidLanguage = (s: string | null): s is Language => LANGUAGES.includes(s as LanguageType)

export type Id = Brand<string, 'Id'>;
export const isValidId = (s: string | null): s is Id => !!s && s.length > 3

export type IdKey = Brand<string, 'IdKey'>;
const exist_id = async (s: string, table: TableType): Promise<boolean> => {
    if (!isValidId(s)) return false
    const sa = new SupabaseAgent();
    return hasSome(await sa.getDataRow(table, s))
}
export const toIdKey = async (s: string, table: TableType): Promise<IdKey | null> => {
    return (await exist_id(s, table)) ? (s as IdKey) : null;
}

export type Email = Brand<string, 'Email'>;
export const isEmail = (s: string | null): s is Email => {
    const reg = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return reg.test(s ?? "")
}

export type EmailKey = Brand<string, 'EmailKey'>;
const exist_email = async (s: string, table: TableType): Promise<boolean> => {
    if (!isEmail(s)) return false;
    return await exist_id(s, table)
}
export const toEmailKey = async (s: string, table: TableType): Promise<EmailKey | null> => {
    return (await exist_email(s, table)) ? (s as EmailKey) : null;
}

////////////////////////////////////////////////

export type IdRef = Brand<string, 'IdRef'>;
const valid_id_ref = async (s: string, table: TableType, id: string, field: string, ref_table: TableType): Promise<boolean> => {
    if (!await exist_id(s, ref_table)) return false;
    const ID = await toIdKey(id, table)
    if (!ID) return false
    const sa = new SupabaseAgent();
    const r = await sa.getSingleRowData(table, ID) as JSONObject
    if (r.isErr() || !hasSome(r.value) || !Object.hasOwn(r.value, field)) return false
    return r.value?.field === s
}
export const toIdRef = async (s: string, table: TableType, id: string, field: string, ref_table: TableType): Promise<IdRef | null> => {
    return (await valid_id_ref(s, table, id, field, ref_table)) ? (s as IdRef) : null;
}
