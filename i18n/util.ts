import { Result } from "neverthrow"
import type { SafeT } from "@i18n/msg_auth_t.ts";

export const isFatalErr = (r: Result<any, string>) => r.isErr() && r.error.toLowerCase().includes('fatal');

export const isNotFatal = (r: Result<any, string>) => !isFatalErr(r);

export const createSaferT = (f?: SafeT) => (args: any) => (f ? f(args) : args);

/////////////////////////////////////////////////////////////////////////////////////

// import { flatten } from 'flat'
// import { msg_auth } from "@i18n/msg_auth.ts";

// function flattenToMap(obj: Record<string, any>): Map<string, any> {
//     const flat = flatten(obj) as Record<string, any>;
//     return new Map(Object.entries(flat));
// }

// function generateConstKeysToFile(map: Map<string, any>, filename: string) {
//     const keys = Array.from(map.keys());
//     const content1 = `const keys = ${JSON.stringify(keys, null, 4)} as const;\n\n`;
//     const content2 = `export type TranslationKey = typeof keys[number];\n\n`;
//     const content3 = `export type SafeT = (key: TranslationKey, params?: Record<string, unknown>) => string;`;
//     Deno.writeTextFileSync(filename, content1 + content2 + content3);
//     console.log(`Keys written to ${filename}`);
// }

// function validateTransKeys(m1: Map<string, any>, m2: Map<string, any>) {
//     const keys1 = new Set(Array.from(m1.keys()))
//     const keys2 = new Set(Array.from(m2.keys()))
//     if (keys1.size !== keys2.size) return false;
//     for (const item of keys1) {
//         if (!keys2.has(item)) return false;
//     }
//     return true;
// }

// if (validateTransKeys(flattenToMap(msg_auth['en-AU']), flattenToMap(msg_auth['zh-CN']))) {
//     generateConstKeysToFile(flattenToMap(msg_auth['zh-CN']), "./msg_auth_t.ts")
// } else {
//     throw new Error("validateTransKeys went wrong");
// }