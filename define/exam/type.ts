import { type Id, isValidId } from "@define/id.ts";
import { hasCertainProperty, some } from "@util/util.ts";
import { EXAMS_AU, type ExamTypeAu, TESTS_AU } from "@define/exam/au.ts";
import { EXAMS_CN, type ExamTypeCn, TESTS_CN } from "@define/exam/cn.ts";
import { isValidFuture } from "@define/type.ts";
import type { RegionType } from "@define/config.ts";

type Brand<T, B> = T & { readonly __brand: B; readonly __exact: T; readonly __types: T };

export type ExamType = ExamTypeAu | ExamTypeCn;
const EXAMS_ALL = new Set([...EXAMS_AU, ...EXAMS_CN]);
const TESTS_ALL = new Set([...TESTS_AU, ...TESTS_CN]);

export const EXAMS_REGION = new Map<RegionType, ExamType[]>([
    ["au", EXAMS_AU as unknown as ExamType[]],
    ["cn", EXAMS_CN as unknown as ExamType[]],
]);

export const isTestIn = (tid: string, rid: RegionType): boolean => {
    switch (rid) {
        case "au":
            return TESTS_AU.includes(tid);
        case "cn":
            return TESTS_CN.includes(tid);
        default:
            return false;
    }
};

export const isExamIn = (exam: ExamType, rid: RegionType): boolean => {
    return EXAMS_REGION.get(rid)?.includes(exam) ?? false;
};

//                                               exam      tests
export type ExamSelection = Brand<Partial<Record<ExamType, string[]>>, `ExamSelection`>;
export const isValidExamSelection = (s: Record<string, unknown>): s is ExamSelection => {
    return Object.entries(s).every(
        ([key, val]) =>
            EXAMS_ALL.has(key as ExamType) && Array.isArray(val) && val.every(
                (v) => typeof v === "string" && TESTS_ALL.has(v),
            ),
    );
};

export type ExamProfile = Brand<{
    eid: ExamType;
    reg_start: Date[]; // [2025, 2026, ...]
    reg_end: Date[];
    // ...
}, `ExamProfile`>;

export type TestProfile = Brand<{
    tid: Id;
    test_dura: number;
    // ...
}, `TestProfile`>;

// *** DOING *** //
export type TestPrepPlan = Brand<{
    tid: Id;
    test_date: Date;
    test_venue: string;
    active: boolean;
    // ...
}, `TestPrepPlan`>;
export const isValidTestPrepPlan = (p: object): p is TestPrepPlan => {
    if (!some(p)) return false;

    if (!hasCertainProperty(p, "tid", "string")) return false;
    if (!hasCertainProperty(p, "test_date", "string")) {
        Object.defineProperty(p, "test_date", {
            value: "UNKNOWN", // 属性值
            writable: true, // 是否可修改（默认为 false）
            enumerable: true, // 是否可枚举（例如 for...in 或 Object.keys() 中可见，默认为 false）
            configurable: true, // 是否可配置（例如能否删除或重新定义，默认为 false）
        });
    }
    if (!hasCertainProperty(p, "test_venue", "string")) {
        Object.defineProperty(p, "test_venue", {
            value: "UNKNOWN",
            writable: true,
            enumerable: true,
            configurable: true,
        });
    }
    if (!hasCertainProperty(p, "active", "boolean")) {
        Object.defineProperty(p, "active", {
            value: true,
            writable: true,
            enumerable: true,
            configurable: true,
        });
    }

    const tid = p.tid as string;
    if (!isValidId(tid)) return false;
    if (!TESTS_ALL.has(tid)) return false;

    if (!["UNKNOWN", "NULL", "TBD", "TBA", "待定", "未知", "不详"].includes((p.test_date as string).toUpperCase())) {
        return isValidFuture(p.test_date as string);
    }
    return true;
};
export const areValidTestPrepPlans = (ps: object[]): ps is TestPrepPlan[] => {
    return ps.every((p) => isValidTestPrepPlan(p));
};

export type TestPrepProgress = Brand<{
    tid: Id;
    // ...
}, `TestPrepProgress`>;

// *** TODO *** //
export type TestAnalysis = Brand<{
    tid: Id;
    // ...
}, `TestAnalysis`>;
