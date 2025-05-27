import { type Id } from "@define/id.ts";

export const EXAMS = [
    "vce",
    "naplan",
    "icas",
    "cet",
    // ...
] as const;
export type ExamType = typeof EXAMS[number];

type Brand<T, B> = T & { readonly __brand: B; readonly __exact: T; readonly __types: T };

//                                               exam      tests
export type ExamSelection = Brand<Partial<Record<ExamType, string[]>>, `ExamSelection`>;
export const isValidExamSelection = (s: Record<string, unknown>): s is ExamSelection => {
    const validKeys = new Set(EXAMS);
    return Object.entries(s).every(([key, val]) => validKeys.has(key as ExamType) && Array.isArray(val) && val.every((v) => typeof v === "string"));
};

export type ExamProfile = Brand<{
    eid: Id;
    reg_start: Date[]; // [2025, 2026, ...]
    reg_end: Date[];
}, `ExamProfile`>;

export type TestProfile = Brand<{
    tid: Id;
    test_dura: number;
}, `TestProfile`>;

export type TestAnalysis = Brand<{
    tid: Id;
}, `TestAnalysis`>;

export type TestPrepPlan = Brand<{
    tid: Id; // link to test_analysis
    test_start: Date;
}, `TestPrepPlan`>;
