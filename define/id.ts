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

export type IdKey<T extends TableType> = Brand<string, `IdKey<${T}>`>;
export const toIdKey = async <T extends TableType>(
    s: string,
    table: T,
    ct?: TransFnType,
): Promise<Result<IdKey<T>, string>> => {
    const t = wrapOptT(ct);
    if (!isValidId(s)) return err(t("id.invalid"));
    if (!some(await agent.getDataRow(table, s))) return err(t("get.db.fail_by_id", { id: s }));
    return ok(s as unknown as IdKey<T>);
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

export type IdObjKey<T extends TableType, Ks extends readonly KeyType[]> = Brand<Partial<Record<Ks[number], Id>>, `IdObjKey<${T}&${Ks[number]}>`>;
export const toIdObjKey = async <T extends TableType, const Ks extends readonly KeyType[]>(
    so: object,
    table: T,
    keys: Ks,
    ct?: TransFnType,
): Promise<Result<IdObjKey<T, Ks>, string>> => {
    const t = wrapOptT(ct);
    if (!isValidIdObj(so, keys)) return err(t("id.invalid_as_obj"));
    if (!some(await agent.getDataRow(table, so))) return err(t("get.db.fail_by_id_obj", { id: so }));
    return ok(so as unknown as IdObjKey<T, Ks>);
};

export type IdMultiKey<Ts extends readonly TableType[]> = Brand<string, `IdMultiKey<${Ts[number] & string}>`>;
export const toIdMultiKey = async <const Ts extends readonly TableType[]>(
    s: string,
    tables: Ts,
    ct?: TransFnType,
): Promise<Result<IdMultiKey<Ts>, string>> => {
    const t = wrapOptT(ct);
    if (!some(tables)) return err(t("param.missing", { param: "tables" }));
    for (const table of tables) {
        const r = await toIdKey(s, table);
        if (r.isErr()) return err(r.error);
    }
    return ok(s as unknown as IdMultiKey<Ts>);
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
    const r_k = await toIdKey(val, ref_table);
    if (r_k.isErr()) return err(r_k.error);
    const r = await agent.firstDataRow(table, field, val);
    if (r.isErr()) return err(r.error);
    if (!some(r.value)) return err(t("get.db.fail_by_field_value"));
    return ok(val as unknown as IdRef<T_DATA, DF, T_REF>);
};
