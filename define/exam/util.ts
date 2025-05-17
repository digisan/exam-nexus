import * as examAu from "@define/exam/au.ts";
import * as examCn from "@define/exam/cn.ts";

type DeepMutable<T> = {
    -readonly [K in keyof T]: {
        -readonly [KK in keyof T[K]]: string[];
    };
};

const asMutableRecord = <T extends Record<string, readonly string[]>>(r: T): { [K in keyof T]: string[] } => {
    const out = {} as { [K in keyof T]: string[] };
    for (const key in r) {
        out[key] = [...r[key]];
    }
    return out;
};

export const getExamsAsJSON = <T extends Record<string, Record<string, readonly string[]>>>(catMap: T): DeepMutable<T> => {
    const result = {} as DeepMutable<T>;
    for (const category of Object.keys(catMap) as (keyof T)[]) {
        const group = catMap[category];
        result[category] = asMutableRecord(group) as DeepMutable<T>[typeof category];
    }
    return result;
};

if (import.meta.main) {
    const data = getExamsAsJSON(examAu.ExamCatMap);
    console.log(data);
    const data2 = getExamsAsJSON(examCn.ExamCatMap);
    console.log(data2);
}
