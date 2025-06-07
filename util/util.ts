import { err, ok, Result } from "neverthrow";
import { basename, extname, fromFileUrl } from "jsr:@std/path";

// import { getConnInfo } from "hono/deno";
// type CtxType = Parameters<typeof getConnInfo>[0];

const TYPES = ["string", "number", "boolean", "undefined", "object", "function", "symbol", "bigint"] as const;
export type Typable = typeof TYPES[number];

export const RE_PWD = /^\S*(?=\S{6,})(?=\S*\d)(?=\S*[A-Z])(?=\S*[a-z])(?=\S*[_!@#$%^&*? ])\S*$/;
export const RE_EMAIL = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

export const len = <T>(arr: T[] | null | undefined): number => arr?.length ?? 0;

export const lastElem = <T>(arr: T[] | null | undefined): T | undefined => arr?.[arr.length - 1];

export const false2err = (b: boolean, errMsg: string = "false as error"): Result<boolean, string> => !b ? err(errMsg) : ok(b);

export const true2err = (b: boolean, errMsg: string = "true as error"): Result<boolean, string> => b ? err(errMsg) : ok(b);

export const firstWord = (sql: string): string | null => sql.trim().split(/\s+/)[0] ?? null;

export const normalizeTrailing = (input: string, trail: string): string => {
    if (input === "" || trail === "") return input;
    // 构造正则，移除所有末尾的目标字符（如 "." 或 ","）
    const escapedChar = trail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // 转义正则特殊字符
    const regex = new RegExp(`${escapedChar}+$`);
    const stripped = input.replace(regex, "");
    // 如果去除后是空字符串，不加任何字符
    return stripped === "" ? "" : stripped + trail;
};

export const arraysEqual = <T>(a: T[], b: T[]): boolean => {
    if (a.length !== b.length) return false;
    return a.every((val, i) => val === b[i]);
};

/**
 * array 'a' minus array 'b', i.e only belongs to 'a', not belongs to 'b'
 * @param a - a array
 * @param b - b array
 * @returns array only include every 'a' element and NOT include any 'b' element
 */
export const arraysDiff = <T>(a: T[], b: T[]): T[] => {
    const setB = new Set(b);
    const onlyInA = a.filter((item) => !setB.has(item));
    return [...onlyInA];
};

/**
 * elements are both in array 'a' and array 'b', i.e belongs to 'a', and belongs to 'b'
 * @param a - a array
 * @param b - b array
 * @returns array include element both is in array 'a' and array 'b'
 */
export const arraysSame = <T>(a: T[], b: T[]): T[] => {
    const setB = new Set(b);
    const both = a.filter((item) => setB.has(item));
    return [...both];
};

export const unorderedArraysEqual = <T>(a: T[], b: T[]): boolean => {
    if (a.length !== b.length) return false;
    const sortedA = [...a].sort();
    const sortedB = [...b].sort();
    return sortedA.every((val, i) => val === sortedB[i]);
};

export const unorderedSetsEqual = <T>(a: T[], b: T[]): boolean => unorderedArraysEqual([...new Set(a)], [...new Set(b)]);

export const sameStruct = (a: object, b: object, ignoreType: boolean = false): boolean => {
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) return false;
    const aKeySet = new Set(aKeys);
    for (const key of bKeys) {
        if (!aKeySet.has(key)) return false;
        if (!ignoreType) {
            const aType = typeof (a as Record<string, unknown>)[key];
            const bType = typeof (b as Record<string, unknown>)[key];
            if (aType !== bType) return false;
        }
    }
    return true;
};

// 辅助类型判断是否是 Result 对象（鸭子类型）
const isResult = <T, E>(value: unknown): value is Result<T, E> => {
    return typeof value === "object" && value !== null && "isOk" in value && "isErr" in value;
};

export const some = <T, E>(input: Result<T, E> | T): boolean => {
    // 如果是 Result 对象
    if (isResult<T, E>(input)) {
        if (input.isErr()) return false;
        return some(input.value);
    }
    const val = input;
    if (val === null || val === undefined) return false;
    if (typeof val === "number" && isNaN(val)) return false;
    if (typeof val === "string" && val.trim() === "") return false;
    if (Array.isArray(val) && val.length === 0) return false;
    if (typeof val === "object" && !Array.isArray(val) && Object.keys(val).length === 0) return false;
    return true;
};

export const hasAllProperties = (obj: object | null, property: string, ...properties: string[]): boolean => {
    if (!obj) return false;
    for (const p of [property, ...properties]) {
        if (!Object.hasOwn(obj, p)) return false;
    }
    return true;
};

export function hasCertainProperty<T extends object>(obj: T, path: string, typeName: Typable): obj is T & Record<string, unknown> {
    if (obj === null || typeof obj !== "object") return false;
    const keys = path.split(".");
    let current: unknown = obj;
    for (const key of keys) {
        if (typeof current !== "object" || current === null || !(key in current)) return false;
        current = (current as Record<string, unknown>)[key];
    }
    const t = typeof current;
    return t == typeName;
}

export const fileExists = async (path: string): Promise<boolean> => {
    try {
        await Deno.stat(path);
        return true;
    } catch (err) {
        if (err instanceof Deno.errors.NotFound) return false;
        throw err;
    }
};

// e.g. const object = new (singleton(MyObject))();
// for runtime creating single object
//
type Constructor<T> = new (...args: any[]) => T;
export const singleton = <T extends object>(ClassType: Constructor<T>): Constructor<T> => {
    let instance: T;
    const proxy = new Proxy(ClassType, {
        construct(target: Constructor<T>, argArray: any[], newTarget: Constructor<T>): T {
            if (!instance) {
                instance = Reflect.construct(target, argArray, newTarget);
            }
            return instance;
        },
    });
    proxy.prototype.constructor = proxy;
    return proxy;
};

/**
 * 获取当前 TypeScript 源文件的文件名
 * @param url 当前模块的 `import.meta.url`
 * @param withExt 是否包含文件扩展名，默认 `true`
 * @returns 文件名（如 `index.ts` 或 `index`）
 */
export const currentFilename = (url: string, withExt: boolean = true): string => {
    const fullPath = fromFileUrl(url); // 处理 file:// URL
    return withExt ? basename(fullPath) : basename(fullPath, extname(fullPath));
};

export const randId = (): string => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    const length = Math.floor(Math.random() * 10) + 4; // 长度在 4 到 13 之间
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
};

export const safeProp = <T extends object>(obj: T, key: string): T[keyof T] | undefined => {
    return key in obj ? obj[key as keyof T] : undefined;
};

/**
 * 提取数组中每个对象的指定字段值，支持嵌套字段（如 'data.tid'）
 * @param arr - 源数组
 * @param fieldPath - 要提取的字段路径，例如 'tid' 或 'data.tid'
 * @returns 提取出的字段值数组
 */
export const extractField = <T extends Record<string, any>>(arr: T[], fieldPath: string): any[] => {
    const keys = fieldPath.split(".");
    return arr.map((item) => keys.reduce((val, key) => val?.[key], item));
};

export const getCurrentDate = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0"); // 月份从 0 开始，补零
    const day = String(today.getDate()).padStart(2, "0"); // 补零
    return `${year}-${month}-${day}`;
};
