const EXAM_SELECTIVE: Record<string, readonly string[]> = {};

const EXAM_PROFICIENCY: Record<string, readonly string[]> = {
    cet: ["4", "6"] as const,
};

const EXAM_CERTIFICATION: Record<string, readonly string[]> = {};

const EXAM_FINAL: Record<string, readonly string[]> = {};

const addKeyAsPrefix = (input: Record<string, readonly string[]>): Record<string, string[]> => {
    const result: Record<string, string[]> = {};
    for (const [key, values] of Object.entries(input)) {
        result[key] = values.map((v) => `${key}.${v}`);
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
