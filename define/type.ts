import { SupabaseAgent } from "@db/dbService.ts";
import type { LanguageType, RegionType } from "@define/config.ts";
import { REGIONS, LANGUAGES } from "@define/config.ts";
import { T_REGISTER } from "@define/system.ts";

export type JSONObject = Record<string, any>;
export type Data = JSONObject | JSONObject[] | null;

type Brand<K, T> = K & { __brand: T };

export type Email = Brand<string, 'Email'>;
export const isEmail = (s: string | null): s is Email => {
    const reg = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return reg.test(s ?? "")
}

export type Password = Brand<string, 'Password'>;
export const isAllowedPassword = (s: string | null): s is Password => {
    const reg = /^\S*(?=\S{8,})(?=\S*\d)(?=\S*[A-Z])(?=\S*[a-z])(?=\S*[!@#$%^&*?_ ])\S*$/
    return reg.test(s ?? "")
}

export type Region = Brand<RegionType, 'Region'>;
export const isValidRegion = (s: string | null): s is Region => REGIONS.includes(s as RegionType)

export type Language = Brand<LanguageType, 'Language'>;
export const isValidLanguage = (s: string | null): s is Language => LANGUAGES.includes(s as LanguageType)

export type EmailExist = Brand<string, 'EmailExist'>;
// 异步校验函数（返回 Promise<boolean>）
const isExist = async (s: string | null): Promise<boolean> => {
    if (!isEmail(s)) return false;
    const sa = new SupabaseAgent();
    const r = await sa.TableContent(T_REGISTER);
    if (r.isOk()) {
        if (!r.value) {
            return false
        }
        const first_row = (r.value as JSONObject[])[0];
        const users = first_row.data;
        if (!users) {
            return false
        }
        if (Array.isArray(users)) {
            return users.some((u: { email: string }) => u.email === s);
        }
        return users.email === s
    }
    return false;
}
// 异步转换函数（返回 Promise<EmailExist | null>）
export const toExistEmail = async (s: string | null): Promise<EmailExist | null> => {
    return (await isExist(s)) ? (s as EmailExist) : null;
}