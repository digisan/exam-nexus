import { safeProp } from "@util/util.ts";

export const EXAMS_AU = [
    "vce",
    "naplan",
    "icas",
    // ...
] as const;
export type ExamTypeAu = typeof EXAMS_AU[number];

// deno-fmt-ignore
const EXAM_SELECTIVE: Partial<Record<ExamTypeAu, readonly string[]>> = {
    vce: [
        "ma.1", "ma.2", "ma.3",
        "en.1", "en.2", "en.3", "en.4"
    ] as const,
};

// deno-fmt-ignore
const EXAM_PROFICIENCY: Partial<Record<ExamTypeAu, readonly string[]>> = {
    naplan: [
        "r.y3", "r.y5", "r.y7", "r.y9",
        "w.y3", "w.y5", "w.y7", "w.y9",
        "lc.y3", "lc.y5", "lc.y7", "lc.y9",
        "n.y3", "n.y5", "n.y7", "n.y9"
    ] as const,

    // 0->Introductory, 1->A, ..., 11->J
    icas: [
        "en.0", "en.1", "en.2", "en.3", "en.4", "en.5", "en.6", "en.7", "en.8", "en.9", "en.10",
        "ma.0", "ma.1", "ma.2", "ma.3", "ma.4", "ma.5", "ma.6", "ma.7", "ma.8", "ma.9", "ma.10",
        "sc.0", "sc.1", "sc.2", "sc.3", "sc.4", "sc.5", "sc.6", "sc.7", "sc.8", "sc.9", "sc.10",
        "w.1", "w.2", "w.3", "w.4", "w.5", "w.6", "w.7", "w.8", "w.9", "w.10",
        "sp.0", "sp.1", "sp.2", "sp.3", "sp.4", "sp.5",
        "dt.1", "dt.2", "dt.3", "dt.4", "dt.5", "dt.6", "dt.7", "dt.8"
    ] as const,
};

// deno-fmt-ignore
const EXAM_CERTIFICATION: Partial<Record<ExamTypeAu, readonly string[]>> = {};

// deno-fmt-ignore
const EXAM_FINAL: Partial<Record<ExamTypeAu, readonly string[]>> = {};

////////////////////////////////////////////////////////////////////////

const addKeyAsPrefix = (input: Partial<Record<ExamTypeAu, readonly string[]>>): Partial<Record<ExamTypeAu, string[]>> => {
    const result: Partial<Record<ExamTypeAu, string[]>> = {};
    for (const [key, values] of Object.entries(input)) {
        result[key as ExamTypeAu] = values.map((v) => `${key}.${v}`);
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
    for (const e of EXAMS_AU) {
        for (const cat in ExamCatMap) {
            const c = safeProp(ExamCatMap, cat)!;
            if (e in c) r.push(c[e]!);
        }
    }
    return r.flat();
};

export const TESTS_AU = collectAllTest();

if (import.meta.main) {
    console.log(TESTS_AU);
}

// export const EXAM_CATEGORIES = Object.keys(ExamCatMap) as (keyof typeof ExamCatMap)[];
// type ExamCatType = typeof EXAM_CATEGORIES[number];
