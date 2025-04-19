import { SupabaseAgent, type JSONObject } from "@db/dbService.ts";
import { T_REG } from "@define/const.ts";

type Brand<K, T> = K & { __brand: T };

export type Email = Brand<string, 'Email'>;
export const isEmail = (s: string): s is Email => {
    const reg = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return reg.test(s)
}

export type Password = Brand<string, 'Password'>;
export const isAllowedPassword = (s: string): s is Password => {
    const reg = /^\S*(?=\S{8,})(?=\S*\d)(?=\S*[A-Z])(?=\S*[a-z])(?=\S*[!@#$%^&*? ])\S*$/
    return reg.test(s)
}

// 定义 Branded Type
export type ExistEmail = Brand<string, 'ExistEmail'>;

// 异步校验函数（返回 Promise<boolean>）
const isExist = async (s: string): Promise<boolean> => {
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
export const toExistEmail = async (s: string): Promise<ExistEmail | null> => {
    return (await isExist(s)) ? (s as ExistEmail) : null;
}
