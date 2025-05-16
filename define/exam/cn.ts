export const EXAM_SELECTIVE = [
    "GAOKAO-MATH",
    "ZHONGKAO-MATH",
] as const;

export const EXAM_PROFICIENCY = [
    "CET-4",
    "CET-6",
] as const;

export const EXAM_CERTIFICATION = [
    "AWS",
] as const;

const EXAM_FINAL = [
    "Y1-MATH",
] as const;

const ExamCatCollection = {
    selective: EXAM_SELECTIVE,
    proficiency: EXAM_PROFICIENCY,
    certification: EXAM_CERTIFICATION,
    // final: EXAM_FINAL,
} as const;

export const EXAM_CATEGORIES = Object.keys(ExamCatCollection) as (keyof typeof ExamCatCollection)[];
type ExamCatType = typeof EXAM_CATEGORIES[number];
