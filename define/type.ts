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

export type IdExist = Brand<string, 'IdExist'>;
const isIdExist = async (table: TableType, s: string | null): Promise<boolean> => {
    if (!isValidId(s)) return false
    const sa = new SupabaseAgent();
    return hasSome(await sa.getDataRow(table, s))
}
export const toExistId = async (table: TableType, s: string | null): Promise<IdExist | null> => {
    return (await isIdExist(table, s)) ? (s as IdExist) : null;
}

export type Email = Brand<string, 'Email'>;
export const isEmail = (s: string | null): s is Email => {
    const reg = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return reg.test(s ?? "")
}

export type EmailExist = Brand<string, 'EmailExist'>;
const isEmailExist = async (table: TableType, s: string | null): Promise<boolean> => {
    if (!isEmail(s)) return false;
    return await isIdExist(table, s)
}
export const toExistEmail = async (table: TableType, s: string | null): Promise<EmailExist | null> => {
    return (await isEmailExist(table, s)) ? (s as EmailExist) : null;
}
