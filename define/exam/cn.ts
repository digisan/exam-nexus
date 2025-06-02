import { safeProp } from "@util/util.ts";

export const EXAMS_CN = [
    "cet",
    // ...
] as const;
export type ExamTypeCn = typeof EXAMS_CN[number];

// deno-fmt-ignore
const EXAM_SELECTIVE: Partial<Record<ExamTypeCn, readonly string[]>> = {};

// deno-fmt-ignore
const EXAM_PROFICIENCY: Partial<Record<ExamTypeCn, readonly string[]>> = {
    cet: ["b4", "b6"] as const, // DO NOT use pure number as sub test name!
};

// deno-fmt-ignore
const EXAM_CERTIFICATION: Partial<Record<ExamTypeCn, readonly string[]>> = {};

// deno-fmt-ignore
const EXAM_FINAL: Partial<Record<ExamTypeCn, readonly string[]>> = {};

////////////////////////////////////////////////////////////////////////

const addKeyAsPrefix = (input: Partial<Record<ExamTypeCn, readonly string[]>>): Partial<Record<ExamTypeCn, string[]>> => {
    const result: Partial<Record<ExamTypeCn, string[]>> = {};
    for (const [key, values] of Object.entries(input)) {
        result[key as ExamTypeCn] = values.map((v) => `${key}.${v}`);
    }
    return result;
};

export const ExamCatMap = {
    selective: addKeyAsPrefix(EXAM_SELECTIVE),
    proficiency: addKeyAsPrefix(EXAM_PROFICIENCY),
    certification: addKeyAsPrefix(EXAM_CERTIFICATION),
    final: addKeyAsPrefix(EXAM_FINAL),
} as const;

const collectAllTest = (): string[] => {
    const r: string[][] = [];
    for (const e of EXAMS_CN) {
        for (const cat in ExamCatMap) {
            const c = safeProp(ExamCatMap, cat)!;
            if (e in c) r.push(c[e]!);
        }
    }
    return r.flat();
};

export const TESTS_CN = collectAllTest();

if (import.meta.main) {
    console.log(TESTS_CN);
}

// export const EXAM_CATEGORIES = Object.keys(ExamCatMap) as (keyof typeof ExamCatMap)[];
// type ExamCatType = typeof EXAM_CATEGORIES[number];
