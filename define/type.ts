import { TABLES_SB, T_REG, REGIONS, LANGUAGES } from "@define/const.ts";
import { SupabaseAgent } from "@db/dbService.ts";

export type JSONObject = Record<string, any>;
export type Data = JSONObject | JSONObject[] | null;

export type TableType = typeof TABLES_SB[number];
export type RegionType = typeof REGIONS[number];
export type LanguageType = typeof LANGUAGES[number];

type Brand<K, T> = K & { __brand: T };

export type Email = Brand<string, 'Email'>;
export const isEmail = (s: string | null): s is Email => {
    const reg = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return reg.test(s ?? "")
}

export type Password = Brand<string, 'Password'>;
export const isAllowedPassword = (s: string | null): s is Password => {
    const reg = /^\S*(?=\S{8,})(?=\S*\d)(?=\S*[A-Z])(?=\S*[a-z])(?=\S*[!@#$%^&*? ])\S*$/
    return reg.test(s ?? "")
}

export type Region = Brand<typeof REGIONS[number], 'Region'>;
export const isValidRegion = (s: string | null): s is Region => REGIONS.includes(s as RegionType)

export type Language = Brand<typeof LANGUAGES[number], 'Language'>;
export const isValidLanguage = (s: string | null): s is Language => LANGUAGES.includes(s as LanguageType)

export type ExistEmail = Brand<string, 'ExistEmail'>;
// 异步校验函数（返回 Promise<boolean>）
const isExist = async (s: string | null): Promise<boolean> => {
    if (!isEmail(s)) return false;
    const sa = new SupabaseAgent();
    const r = await sa.TableContent(T_REG);
    if (r.isOk()) {
        const users = (r.value as JSONObject[])[0].data;
        return users.some((u: { email: string }) => u.email === s);
    }
    return false;
}
// 异步转换函数（返回 Promise<ExistEmail | null>）
export const toExistEmail = async (s: string | null): Promise<ExistEmail | null> => {
    return (await isExist(s)) ? (s as ExistEmail) : null;
}