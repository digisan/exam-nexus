import { err, ok, Result } from "neverthrow";
import { Err } from "@i18n/lang_t.ts";
import { LANGUAGES, REGIONS } from "@define/config.ts";
import type { LanguageType, RegionType } from "@define/config.ts";
import { T } from "@define/system.ts";
import { hasCertainProperty, RE_EMAIL, RE_PWD, some } from "@util/util.ts";
import { type Id, isValidId, toIdSKey } from "@define/id.ts";

type Brand<T, B> = T & { readonly __brand: B; readonly __exact: T; readonly __types: T };

export type Email = Brand<string, "Email">;
export const isEmail = (s: string): s is Email => RE_EMAIL.test(s ?? "");

export type Password = Brand<string, "Password">;
export const isAllowedPassword = (s: string): s is Password => RE_PWD.test(s ?? "");

export type Region = Brand<RegionType, "Region">;
export const isValidRegion = (s: string): s is Region => REGIONS.includes(s as RegionType);

export type Language = Brand<LanguageType, "Language">;
export const isValidLanguage = (s: string): s is Language => LANGUAGES.includes(s as LanguageType) || s === "en" || s === "zh";

export type Credential = Brand<{ id: Id; password: Password }, `Credential`>;
export const toValidCredential = async (c: object): Promise<Result<Credential, string>> => {
    if (!some(c)) return Err("credential.empty");

    if (!hasCertainProperty(c!, "id", "string")) return Err("credential.invalid");
    if (!hasCertainProperty(c!, "password", "string")) return Err("credential.invalid");

    if (!isValidId(c.id as string)) return Err("id.invalid");
    if (!isAllowedPassword(c.password as string)) return Err("password.invalid");

    const r = await toIdSKey(c.id as string, T.REGISTER);
    if (r.isErr()) return err(r.error);
    return ok(c as unknown as Credential);
};

export type Config = Brand<{ id: Id; region: Region; lang: Language }, `Config`>;
export const toValidConfig = async (c: object): Promise<Result<Config, string>> => {
    if (!some(c)) return Err("config.empty");

    if (!hasCertainProperty(c!, "id", "string")) return Err("config.invalid");
    if (!hasCertainProperty(c!, "region", "string")) return Err("config.invalid");
    if (!hasCertainProperty(c!, "lang", "string")) return Err("config.invalid");

    if (!isValidId(c.id as string)) return Err("id.invalid");
    if (!isValidRegion(c.region as string)) return Err("region.invalid");
    if (!isValidLanguage(c.lang as string)) return Err("language.invalid");

    const r = await toIdSKey(c.id as string, T.REGISTER);
    if (r.isErr()) return err(r.error);
    return ok(c as unknown as Config);
};

export type Future = Brand<Date, "Future">;
export const isValidFuture = (s: string | Date): s is Future => {
    const date = typeof s === "string" ? new Date(s) : s;
    if (isNaN(date.getTime())) return false;
    return date.getTime() > Date.now();
};

export type DateRange = Brand<{ start: Date; end: Date }, "DateRange">;
