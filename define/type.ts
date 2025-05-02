import { dbAgent as agent } from "@db/dbService.ts";
import { REGIONS, LANGUAGES, type LanguageType, type RegionType } from "@define/config.ts";
import { T_REGISTER, type TableType } from "@define/system.ts";
import { hasCertainProperty, hasSome, RE_EMAIL, RE_PWD } from "@util/util.ts";

export type JSONObject = Record<string, unknown>;
export type Data = JSONObject | JSONObject[] | null;
export const normalizeData = (value: Data): Data => {
    if (Array.isArray(value)) {
        if (value.length === 0) return null;
        if (value.length === 1) return value[0];
        return value;
    }
    return value;
}

////////////////////////////////////////////////

type Brand<T, B> = T & { readonly __brand: B; readonly __exact: T; readonly __types: T };

export type Password = Brand<string, 'Password'>;
export const isAllowedPassword = (s: string | null): s is Password => RE_PWD.test(s ?? "")

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
    if (!hasSome(await agent.getDataRow(table, s))) return null;
    return s as unknown as IdKey<T>
}

////////////////////////////////////////////////

export type Email = Brand<string, 'Email'>;
export const isEmail = (s: string | null): s is Email => RE_EMAIL.test(s ?? "")

export type EmailKey<T extends TableType> = Brand<string, `EmailKey<${T}>`>
export const toEmailKey = async <T extends TableType>(s: string | Email, table: T): Promise<EmailKey<T> | null> => {
    if (!isValidId(s) || !isEmail(s)) return null;
    if (!hasSome(await agent.getDataRow(table, s))) return null;
    return s as unknown as EmailKey<T>
}

export type EmailKeyOnAll<T extends readonly TableType[]> = Brand<string, `EmailKeyOnAll<${T & string}>`>;
export const toEmailKeyOnAll = async<T extends readonly TableType[]>(s: string | Email, ...tables: T): Promise<EmailKeyOnAll<T> | null> => {
    for (const table of tables) {
        if (!await toEmailKey(s, table)) return null
    }
    return s as unknown as EmailKeyOnAll<T>
}

////////////////////////////////////////////////

export type IdRef<T1 extends TableType, F extends string, T2 extends TableType> = Brand<string, `IdRef<${T1}_${F}_${T2}>`>
export const toIdRef = async <T1 extends TableType, F extends string, T2 extends TableType>(s: string | Id | IdKey<T2>, table: T1, field: F, ref_table: T2): Promise<IdRef<T1, F, T2> | null> => {
    if (!await toIdKey(s, ref_table)) return null
    const r = await agent.firstDataRow(table, field, s)
    if (r.isErr() || !hasSome(r.value)) return null
    return s as unknown as IdRef<T1, F, T2>
}

////////////////////////////////////////////////

export type Credential = Brand<{ email: Email, password: Password }, `Credential`>
export const toValidCredential = async (c: object | null): Promise<Credential | null> => {
    if (!hasSome(c)) return null

    if (!hasCertainProperty(c!, 'email', 'string')) return null
    if (!await toEmailKey(c.email as string, T_REGISTER)) return null

    if (!hasCertainProperty(c!, 'password', 'string')) return null
    if (!isAllowedPassword(c.password as string)) return null

    return c as unknown as Credential
}

export type Config = Brand<{ email: Email, region: Region, lang: Language }, `Config`>
export const toValidConfig = async (c: object | null): Promise<Config | null> => {
    if (!hasSome(c)) return null

    if (!hasCertainProperty(c!, 'email', 'string')) return null
    if (!await toEmailKey(c.email as string, T_REGISTER)) return null

    if (!hasCertainProperty(c!, 'region', 'string')) return null
    if (!isValidRegion(c.region as string)) return null

    if (!hasCertainProperty(c!, 'lang', 'string')) return null
    if (!isValidLanguage(c.lang as string)) return null

    return c as unknown as Config
}