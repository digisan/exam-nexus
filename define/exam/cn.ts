import type { ExamType } from "@define/exam/type.ts";

// deno-fmt-ignore
const EXAM_SELECTIVE: Partial<Record<ExamType, readonly string[]>> = {};

// deno-fmt-ignore
const EXAM_PROFICIENCY: Partial<Record<ExamType, readonly string[]>> = {
    cet: ["4", "6"] as const,
};

// deno-fmt-ignore
const EXAM_CERTIFICATION: Partial<Record<ExamType, readonly string[]>> = {};

// deno-fmt-ignore
const EXAM_FINAL: Partial<Record<ExamType, readonly string[]>> = {};

////////////////////////////////////////////////////////////////////////

const addKeyAsPrefix = (input: Partial<Record<ExamType, readonly string[]>>): Partial<Record<ExamType, string[]>> => {
    const result: Partial<Record<ExamType, string[]>> = {};
    for (const [key, values] of Object.entries(input)) {
        result[key as ExamType] = values.map((v) => `${key}.${v}`);
    }
    return result;
};

export const ExamCatMap = {
    selective: addKeyAsPrefix(EXAM_SELECTIVE),
    proficiency: addKeyAsPrefix(EXAM_PROFICIENCY),
    certification: addKeyAsPrefix(EXAM_CERTIFICATION),
    final: addKeyAsPrefix(EXAM_FINAL),
} as const;

// export const EXAM_CATEGORIES = Object.keys(ExamCatMap) as (keyof typeof ExamCatMap)[];
// type ExamCatType = typeof EXAM_CATEGORIES[number];
