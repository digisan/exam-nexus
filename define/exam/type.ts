import { type Id, isValidId } from "@define/id.ts";
import { type TransFnType, wrapOptT } from "@i18n/lang_t.ts";
import { hasCertainProperty, some } from "@util/util.ts";
import { EXAMS_AU, type ExamTypeAu, TESTS_AU } from "@define/exam/au.ts";
import { EXAMS_CN, type ExamTypeCn, TESTS_CN } from "@define/exam/cn.ts";
import { type DateRange, isValidFuture } from "@define/type.ts";

type Brand<T, B> = T & { readonly __brand: B; readonly __exact: T; readonly __types: T };

type ExamType = ExamTypeAu | ExamTypeCn;
const EXAMS = new Set([...EXAMS_AU, ...EXAMS_CN]);
const TESTS = new Set([...TESTS_AU, ...TESTS_CN]);

//                                               exam      tests
export type ExamSelection = Brand<Partial<Record<ExamType, string[]>>, `ExamSelection`>;
export const isValidExamSelection = (s: Record<string, unknown>): s is ExamSelection => {
    return Object.entries(s).every(
        ([key, val]) =>
            EXAMS.has(key as ExamType) && Array.isArray(val) && val.every(
                (v) => typeof v === "string" && TESTS.has(v),
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
    test_start: Date;
    test_venue: string;
    prep_range: DateRange;
    // ...
}, `TestPrepPlan`>;
export const isValidTestPrepPlan = (p: object, ct?: TransFnType): p is TestPrepPlan => {
    const t = wrapOptT(ct);
    if (!some(p)) return false;

    if (!hasCertainProperty(p, "tid", "string")) return false;
    if (!hasCertainProperty(p, "test_start", "string")) return false;
    if (!hasCertainProperty(p, "test_venue", "string")) return false;

    const tid = p.tid as string;
    if (!isValidId(tid)) return false;
    if (!TESTS.has(tid)) return false;

    if (!isValidFuture(p.test_start as string)) return false;

    return true;
};

export type TestPrepProcess = Brand<{
    tid: Id;
    // ...
}, `TestPrepProcess`>;

// *** TODO *** //
export type TestAnalysis = Brand<{
    tid: Id;
    // ...
}, `TestAnalysis`>;
