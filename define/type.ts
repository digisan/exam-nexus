import { err, ok, Result } from "neverthrow";
import { type TransFnType, wrapOptT } from "@i18n/lang_t.ts";
import { dbAgent as agent } from "@db/dbService.ts";
import { LANGUAGES, REGIONS } from "@define/config.ts";
import type { LanguageType, RegionType } from "@define/config.ts";
import { KEY_SB, T_REGISTER } from "@define/system.ts";
import type { KeyType, TableType } from "@define/system.ts";
import { hasCertainProperty, RE_EMAIL, RE_PWD, some } from "@util/util.ts";

type Brand<T, B> = T & { readonly __brand: B; readonly __exact: T; readonly __types: T };

////////////////////////////////////////////////

export type Password = Brand<string, "Password">;
export const isAllowedPassword = (s: string | null): s is Password => RE_PWD.test(s ?? "");

export type Region = Brand<RegionType, "Region">;
export const isValidRegion = (s: string | null): s is Region => REGIONS.includes(s as RegionType);

export type Language = Brand<LanguageType, "Language">;
export const isValidLanguage = (s: string | null): s is Language => LANGUAGES.includes(s as LanguageType);

////////////////////////////////////////////////

export type Id = Brand<string, "Id">;
export const isValidId = (s: string | null): s is Id => !!s && s.length > 3;

export type IdKey<T extends TableType> = Brand<string, `IdKey<${T}>`>;
export const toIdKey = async <T extends TableType>(s: string | Id, table: T, ct?: TransFnType): Promise<Result<IdKey<T>, string>> => {
    const t = wrapOptT(ct);
    if (!isValidId(s)) return err(t("id.invalid"));
    if (!some(await agent.getDataRow(table, s))) return err(t("get.db.fail_by_id", { id: s }));
    return ok(s as unknown as IdKey<T>);
};

type Ids = Brand<string[], "Ids">;
const isValidIds = (ss: string[] | null): ss is Ids => {
    if (ss === null) return false;
    for (const s of ss) if (!isValidId(s)) return false;
    return true;
};

export type IdObj = Brand<Partial<Record<KeyType, Id>>, "IdObj">;
export const isValidIdObj = (so: Partial<Record<KeyType, Id>> | null): so is IdObj => {
    if (so === null) return false;
    const keys = Object.keys(so);
    if (!keys.every((k) => (KEY_SB as readonly string[]).includes(k))) return false;
    return isValidIds(keys.map((k) => so[k as KeyType]!));
};

export type IdObjKey<T1 extends TableType, T2 extends KeyType> = Brand<Partial<Record<T2, Id>>, `IdObjKey<${T1}_${T2}>`>;
export const toIdObjKey = async <T1 extends TableType, T2 extends KeyType>(so: Partial<Record<T2, Id>>, table: T1, ct?: TransFnType): Promise<Result<IdObjKey<T1, T2>, string>> => {
    const t = wrapOptT(ct);
    if (!isValidIdObj(so)) return err(t("id.invalid_as_obj"));
    if (!some(await agent.getDataRow(table, so))) return err(t("get.db.fail_by_id_obj", { id: so }));
    return ok(so as unknown as IdObjKey<T1, T2>);
};

////////////////////////////////////////////////

export type Email = Brand<string, "Email">;
export const isEmail = (s: string | null): s is Email => RE_EMAIL.test(s ?? "");

export type EmailKey<T extends TableType> = Brand<string, `EmailKey<${T}>`>;
export const toEmailKey = async <T extends TableType>(s: string | Email, table: T, ct?: TransFnType): Promise<Result<EmailKey<T>, string>> => {
    const t = wrapOptT(ct);
    if (!isValidId(s) || !isEmail(s)) return err(t("email.invalid"));
    if (!some(await agent.getDataRow(table, s))) return err(t("get.db.fail_by_email", { email: s }));
    return ok(s as unknown as EmailKey<T>);
};

export type EmailKeyOnAll<T extends readonly TableType[]> = Brand<string, `EmailKeyOnAll<${T & string}>`>;
export const toEmailKeyOnAll = async <T extends readonly TableType[]>(s: string | Email, ct?: TransFnType, ...tables: T): Promise<Result<EmailKeyOnAll<T>, string>> => {
    const t = wrapOptT(ct);
    if (!some(tables)) return err(t("param.missing", { param: "tables" }));
    for (const table of tables) {
        const r = await toEmailKey(s, table);
        if (r.isErr()) return err(r.error);
    }
    return ok(s as unknown as EmailKeyOnAll<T>);
};

////////////////////////////////////////////////

export type IdRef<T1 extends TableType, F extends string, T2 extends TableType> = Brand<string, `IdRef<${T1}_${F}_${T2}>`>;
export const toIdRef = async <T1 extends TableType, F extends string, T2 extends TableType>(
    s: string | Id | IdKey<T2>,
    table: T1,
    field: F,
    ref_table: T2,
    ct?: TransFnType,
): Promise<Result<IdRef<T1, F, T2>, string>> => {
    const t = wrapOptT(ct);
    const r_k = await toIdKey(s, ref_table);
    if (r_k.isErr()) return err(r_k.error);
    const r = await agent.firstDataRow(table, field, s);
    if (r.isErr()) return err(r.error);
    if (!some(r.value)) return err(t("get.db.fail_by_field_value"));
    return ok(s as unknown as IdRef<T1, F, T2>);
};

////////////////////////////////////////////////

export type Credential = Brand<{ email: Email; password: Password }, `Credential`>;
export const toValidCredential = async (c: object | null, ct?: TransFnType): Promise<Result<Credential, string>> => {
    const t = wrapOptT(ct);
    if (!some(c)) return err(t("credential.empty"));

    if (!hasCertainProperty(c!, "email", "string")) return err(t("credential.invalid", { message: "email" }));
    if (!hasCertainProperty(c!, "password", "string")) return err(t("credential.invalid", { message: "password" }));

    if (!isAllowedPassword(c.password as string)) return err(t("password.invalid", { password: c.password }));
    const r = await toEmailKey(c.email as string, T_REGISTER);
    if (r.isErr()) return err(r.error);

    return ok(c as unknown as Credential);
};

export type Config = Brand<{ email: Email; region: Region; lang: Language }, `Config`>;
export const toValidConfig = async (c: object | null, ct?: TransFnType): Promise<Result<Config, string>> => {
    const t = wrapOptT(ct);
    if (!some(c)) return err(t("config.empty"));

    if (!hasCertainProperty(c!, "email", "string")) return err(t("config.invalid", { message: "email" }));
    if (!hasCertainProperty(c!, "region", "string")) return err(t("config.invalid", { message: "region" }));
    if (!hasCertainProperty(c!, "lang", "string")) return err(t("config.invalid", { message: "lang" }));

    if (!isValidRegion(c.region as string)) return err(t("region.invalid", { region: c.region }));
    if (!isValidLanguage(c.lang as string)) return err(t("language.invalid", { language: c.lang }));
    const r = await toEmailKey(c.email as string, T_REGISTER);
    if (r.isErr()) return err(r.error);

    return ok(c as unknown as Config);
};
