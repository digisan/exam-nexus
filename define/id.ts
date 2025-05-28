import { err, ok, Result } from "neverthrow";
import { type TransFnType, wrapOptT } from "@i18n/lang_t.ts";
import { dbAgent as agent } from "@db/dbService.ts";
import type { KeyType, TableType } from "@define/system.ts";
import { some } from "@util/util.ts";

type Brand<T, B> = T & { readonly __brand: B; readonly __exact: T; readonly __types: T };

export type Id = Brand<string, "Id">;
export const isValidId = (s: string): s is Id => !!s && s.length > 3;

export type Ids = Brand<string[], "Ids">;
export const isValidIds = (ss: string[]): ss is Ids => {
    if (!some(ss)) return false;
    for (const s of ss) if (!isValidId(s)) return false;
    return true;
};

export type IdObj<Ks extends readonly KeyType[]> = Brand<Partial<Record<Ks[number], Id>>, `IdObj<${Ks[number] & string}>`>;
export const isValidIdObj = <const Ks extends readonly KeyType[]>(
    so: object,
    keys: Ks,
): so is IdObj<Ks> => {
    if (so === null || typeof so !== "object") return false;
    const allowedKeys = new Set(keys);
    const actualKeys = Object.keys(so);
    if (!actualKeys.every((k) => allowedKeys.has(k as KeyType))) return false;
    return isValidIds(actualKeys.map((k) => (so as Partial<Record<KeyType, Id>>)[k as KeyType]!));
};

////////////////////////////////////////////////////////////////////////

export type IdSKey<T extends TableType> = Brand<string, `IdSKey<${T}>`>;
export const toIdSKey = async <T extends TableType>(
    s: string,
    table: T,
    ct?: TransFnType,
): Promise<Result<IdSKey<T>, string>> => {
    const t = wrapOptT(ct);
    if (!isValidId(s)) return err(t("id.invalid"));
    if (!some(await agent.GetDataRow(table, s))) return err(t("get.db.fail_by_id", { id: s }));
    return ok(s as unknown as IdSKey<T>);
};

export type IdSKeyPart<T extends TableType, K extends KeyType> = Brand<string, `IdSKeyPart<${T}&${K}>`>;
export const toIdSKeyPart = async <T extends TableType, K extends KeyType>(
    s: string,
    table: T,
    key: K,
    ct?: TransFnType,
): Promise<Result<IdSKeyPart<T, K>, string>> => {
    const t = wrapOptT(ct);
    if (!isValidId(s)) return err(t("id.invalid"));
    if (!some(await agent.GetDataRow(table, s, key))) return err(t("get.db.fail_by_id", { id: s }));
    return ok(s as unknown as IdSKeyPart<T, K>);
};

export type IdSKeyWithSKeyPart<T1 extends TableType, T2 extends TableType, K extends KeyType> = Brand<string, `IdSKeyWithSKeyPart<${T1}&${T2}&${K}>`>;
export const toIdSKeyWithSKeyPart = async <T1 extends TableType, T2 extends TableType, K extends KeyType>(
    s: string,
    kTable: T1,
    pTable: T2,
    key: K,
    ct?: TransFnType,
): Promise<Result<IdSKeyWithSKeyPart<T1, T2, K>, string>> => {
    const t = wrapOptT(ct);
    if (!isValidId(s)) return err(t("id.invalid"));
    if (!some(await agent.GetDataRow(kTable, s))) return err(t("get.db.fail_by_id", { id: s }));
    if (!some(await agent.GetDataRow(pTable, s, key))) return err(t("get.db.fail_by_id", { id: s }));
    return ok(s as unknown as IdSKeyWithSKeyPart<T1, T2, K>);
};

export type IdSKeyObj<T extends TableType, Ks extends readonly KeyType[]> = Brand<Partial<Record<Ks[number], Id>>, `IdSKeyObj<${T}&${Ks[number]}>`>;
export const toIdSKeyObj = async <T extends TableType, const Ks extends readonly KeyType[]>(
    so: object,
    table: T,
    keys: Ks,
    ct?: TransFnType,
): Promise<Result<IdSKeyObj<T, Ks>, string>> => {
    const t = wrapOptT(ct);
    if (!isValidIdObj(so, keys)) return err(t("id.invalid_as_obj"));
    if (!some(await agent.GetDataRow(table, so))) return err(t("get.db.fail_by_id_obj", { id: so }));
    return ok(so as unknown as IdSKeyObj<T, Ks>);
};

export type IdMKey<Ts extends readonly TableType[]> = Brand<string, `IdMKey<${Ts[number] & string}>`>;
export const toIdMKey = async <const Ts extends readonly TableType[]>(
    s: string,
    tables: Ts,
    ct?: TransFnType,
): Promise<Result<IdMKey<Ts>, string>> => {
    const t = wrapOptT(ct);
    if (!some(tables)) return err(t("param.missing", { param: "tables" }));
    for (const table of tables) {
        const r = await toIdSKey(s, table);
        if (r.isErr()) return err(r.error);
    }
    return ok(s as unknown as IdMKey<Ts>);
};

export type IdRef<T_DATA extends TableType, DF extends string, T_REF extends TableType> = Brand<string, `IdRef<${T_DATA}&${DF}&${T_REF}>`>;
export const toIdRef = async <T_DATA extends TableType, DF extends string, T_REF extends TableType>(
    val: string,
    table: T_DATA,
    field: DF,
    ref_table: T_REF,
    ct?: TransFnType,
): Promise<Result<IdRef<T_DATA, DF, T_REF>, string>> => {
    const t = wrapOptT(ct);
    const r_k = await toIdSKey(val, ref_table);
    if (r_k.isErr()) return err(r_k.error);
    const r = await agent.FirstDataRow(table, field, val);
    if (r.isErr()) return err(r.error);
    if (!some(r.value)) return err(t("get.db.fail_by_field_value"));
    return ok(val as unknown as IdRef<T_DATA, DF, T_REF>);
};
