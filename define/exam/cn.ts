export const EXAM_SELECTIVE = [];

export const EXAM_PROFICIENCY = [
    "cet.4",
    "cet.6",
];

export const EXAM_CERTIFICATION = [];

export const EXAM_FINAL = [];

const ExamCatMap = {
    selective: EXAM_SELECTIVE,
    proficiency: EXAM_PROFICIENCY,
    certification: EXAM_CERTIFICATION,
    final: EXAM_FINAL,
} as const;

export const EXAM_CATEGORIES = Object.keys(ExamCatMap) as (keyof typeof ExamCatMap)[];
type ExamCatType = typeof EXAM_CATEGORIES[number];
