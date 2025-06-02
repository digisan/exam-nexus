import { err, ok, Result } from "neverthrow";
import { type TransFnType, wrapOptT } from "@i18n/lang_t.ts";
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
export const toValidCredential = async (c: object, ct?: TransFnType): Promise<Result<Credential, string>> => {
    const t = wrapOptT(ct);
    if (!some(c)) return err(t("credential.empty"));

    if (!hasCertainProperty(c!, "id", "string")) return err(t("credential.invalid", { message: "id" }));
    if (!hasCertainProperty(c!, "password", "string")) return err(t("credential.invalid", { message: "password" }));

    if (!isValidId(c.id as string)) return err(t("id.invalid", { id: c.id }));
    if (!isAllowedPassword(c.password as string)) return err(t("password.invalid", { password: c.password }));

    const r = await toIdSKey(c.id as string, T.REGISTER);
    if (r.isErr()) return err(r.error);
    return ok(c as unknown as Credential);
};

export type Config = Brand<{ id: Id; region: Region; lang: Language }, `Config`>;
export const toValidConfig = async (c: object, ct?: TransFnType): Promise<Result<Config, string>> => {
    const t = wrapOptT(ct);
    if (!some(c)) return err(t("config.empty"));

    if (!hasCertainProperty(c!, "id", "string")) return err(t("config.invalid", { message: "id" }));
    if (!hasCertainProperty(c!, "region", "string")) return err(t("config.invalid", { message: "region" }));
    if (!hasCertainProperty(c!, "lang", "string")) return err(t("config.invalid", { message: "lang" }));

    if (!isValidId(c.id as string)) return err(t("id.invalid", { id: c.id }));
    if (!isValidRegion(c.region as string)) return err(t("region.invalid", { region: c.region }));
    if (!isValidLanguage(c.lang as string)) return err(t("language.invalid", { language: c.lang }));

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
