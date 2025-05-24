import { err, ok, Result } from "neverthrow";
import { type TransFnType, wrapOptT } from "@i18n/lang_t.ts";
import { LANGUAGES, REGIONS } from "@define/config.ts";
import type { LanguageType, RegionType } from "@define/config.ts";
import { T_REGISTER } from "@define/system.ts";
import { hasCertainProperty, RE_EMAIL, RE_PWD, some } from "@util/util.ts";
import { toIdKey } from "@define/id.ts";

type Brand<T, B> = T & { readonly __brand: B; readonly __exact: T; readonly __types: T };

export type Email = Brand<string, "Email">;
export const isEmail = (s: string): s is Email => RE_EMAIL.test(s ?? "");

export type Password = Brand<string, "Password">;
export const isAllowedPassword = (s: string): s is Password => RE_PWD.test(s ?? "");

export type Region = Brand<RegionType, "Region">;
export const isValidRegion = (s: string): s is Region => REGIONS.includes(s as RegionType);

export type Language = Brand<LanguageType, "Language">;
export const isValidLanguage = (s: string): s is Language => LANGUAGES.includes(s as LanguageType);

export type Credential = Brand<{ email: Email; password: Password }, `Credential`>;
export const toValidCredential = async (c: object, ct?: TransFnType): Promise<Result<Credential, string>> => {
    const t = wrapOptT(ct);
    if (!some(c)) return err(t("credential.empty"));

    if (!hasCertainProperty(c!, "email", "string")) return err(t("credential.invalid", { message: "email" }));
    if (!hasCertainProperty(c!, "password", "string")) return err(t("credential.invalid", { message: "password" }));

    if (!isEmail(c.email as string)) return err(t("email.invalid", { email: c.email }));
    if (!isAllowedPassword(c.password as string)) return err(t("password.invalid", { password: c.password }));

    const r = await toIdKey(c.email as string, T_REGISTER);
    if (r.isErr()) return err(r.error);
    return ok(c as unknown as Credential);
};

export type Config = Brand<{ email: Email; region: Region; lang: Language }, `Config`>;
export const toValidConfig = async (c: object, ct?: TransFnType): Promise<Result<Config, string>> => {
    const t = wrapOptT(ct);
    if (!some(c)) return err(t("config.empty"));

    if (!hasCertainProperty(c!, "email", "string")) return err(t("config.invalid", { message: "email" }));
    if (!hasCertainProperty(c!, "region", "string")) return err(t("config.invalid", { message: "region" }));
    if (!hasCertainProperty(c!, "lang", "string")) return err(t("config.invalid", { message: "lang" }));

    if (!isEmail(c.email as string)) return err(t("email.invalid", { email: c.email }));
    if (!isValidRegion(c.region as string)) return err(t("region.invalid", { region: c.region }));
    if (!isValidLanguage(c.lang as string)) return err(t("language.invalid", { language: c.lang }));

    const r = await toIdKey(c.email as string, T_REGISTER);
    if (r.isErr()) return err(r.error);
    return ok(c as unknown as Config);
};
