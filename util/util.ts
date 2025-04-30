import { ok, err, Result } from "neverthrow"
import { fromFileUrl, basename, extname } from "jsr:@std/path";

const TYPES = ['string', 'number', 'boolean', 'undefined', 'object', 'function', 'symbol', 'bigint'] as const;
export type Typable = typeof TYPES[number];

export const RE_PWD = /^\S*(?=\S{6,})(?=\S*\d)(?=\S*[A-Z])(?=\S*[a-z])(?=\S*[!@#$%^&*? ])\S*$/
export const RE_EMAIL = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

export const len = <T>(arr: T[] | null | undefined): number => arr?.length ?? 0;

export const lastElem = <T>(arr: T[] | null | undefined): T | undefined => arr?.[arr.length - 1];

export const false2err = (b: boolean, errMsg: string = 'false as error'): Result<boolean, string> => !b ? err(errMsg) : ok(b);

export const true2err = (b: boolean, errMsg: string = 'true as error'): Result<boolean, string> => b ? err(errMsg) : ok(b);

export const bools2idx = (...flags: boolean[]): number => flags.reduce((acc, flag, i) => acc | (+flag << (flags.length - 1 - i)), 0);

export const firstWord = (sql: string): string | null => sql.trim().split(/\s+/)[0] ?? null;

export const arraysEqual = <T>(a: T[], b: T[]): boolean => {
    if (a.length !== b.length) return false;
    return a.every((val, i) => val === b[i]);
}

export const unorderedArraysEqual = <T>(a: T[], b: T[]): boolean => {
    if (a.length !== b.length) return false;
    const sortedA = [...a].sort();
    const sortedB = [...b].sort();
    return sortedA.every((val, i) => val === sortedB[i]);
};

export const unorderedSetsEqual = <T>(a: T[], b: T[]): boolean => unorderedArraysEqual([...new Set(a)], [...new Set(b)]);

export const haveSameStructure = (a: object, b: object): boolean => {
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) return false;
    const aKeySet = new Set(aKeys);
    for (const key of bKeys) {
        if (!aKeySet.has(key)) return false;
        const aType = typeof (a as Record<string, unknown>)[key];
        const bType = typeof (b as Record<string, unknown>)[key];
        if (aType !== bType) return false;
    }
    return true;
}

// 辅助类型判断是否是 Result 对象（鸭子类型）
const isResult = <T, E>(value: unknown): value is Result<T, E> => {
    return typeof value === 'object' && value !== null && 'isOk' in value && 'isErr' in value;
}

export const hasSome = <T, E>(input: Result<T, E> | T): boolean => {
    // 如果是 Result 对象
    if (isResult<T, E>(input)) {
        if (input.isErr()) return false;
        return hasSome(input.value);
    }

    const val = input;
    if (val === null || val === undefined) return false;
    if (typeof val === "number" && isNaN(val)) return false;
    if (typeof val === "string" && val.trim() === "") return false;
    if (Array.isArray(val) && val.length === 0) return false;
    if (typeof val === "object" && !Array.isArray(val) && Object.keys(val).length === 0) return false;
    return true;
}

export const hasAllProperties = (obj: object | null, property: string, ...properties: string[]): boolean => {
    if (!obj) return false
    for (const p of [property, ...properties]) {
        if (!Object.hasOwn(obj, p)) return false
    }
    return true
}

export function hasCertainProperty<T extends object>(obj: T, path: string, typeName: Typable): obj is T & Record<string, unknown> {
    if (obj === null || typeof obj !== 'object') return false;
    const keys = path.split('.');
    let current: unknown = obj;
    for (const key of keys) {
        if (typeof current !== 'object' || current === null || !(key in current)) return false;
        current = (current as Record<string, unknown>)[key];
    }
    const t = typeof current;
    return t == typeName
}

export const fileExists = async (path: string): Promise<boolean> => {
    try {
        await Deno.stat(path);
        return true;
    } catch (err) {
        if (err instanceof Deno.errors.NotFound) return false;
        throw err;
    }
}

export const singleton = <T extends object>(ClassType: new (...args: any[]) => T): new (...args: any[]) => T => {
    let instance: T;
    const proxy = new Proxy(ClassType, {
        construct(target: new (...args: any[]) => T, argArray: any[], newTarget: Function): T {
            if (!instance) {
                instance = Reflect.construct(target, argArray, newTarget);
            }
            return instance;
        }
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
}