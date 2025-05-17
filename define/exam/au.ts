const EXAM_SELECTIVE: Record<string, readonly string[]> = {
    vce: ["ma.1", "ma.2", "ma.3", "en.1", "en.2", "en.3", "en.4"] as const,
};

const EXAM_PROFICIENCY: Record<string, readonly string[]> = {
    naplan: ["r.y3", "r.y5", "r.y7", "r.y9", "w.y3", "w.y5", "w.y7", "w.y9", "lc.y3", "lc.y5", "lc.y7", "lc.y9", "n.y3", "n.y5", "n.y7", "n.y9"] as const,
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
