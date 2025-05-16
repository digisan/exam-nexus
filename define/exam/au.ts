export const EXAM_SELECTIVE = [
    "VCE-MATH",
    "VCE-ENGLISH",
] as const;

export const EXAM_PROFICIENCY = [
    "NAPLAN-MATH",
    "NAPLAN-ENGLISH",
] as const;

export const EXAM_CERTIFICATION = [
    "AWS",
] as const;

const EXAM_FINAL = [
    "YEAR-1",
] as const;

const ExamCatMap = {
    selective: EXAM_SELECTIVE,
    proficiency: EXAM_PROFICIENCY,
    certification: EXAM_CERTIFICATION,
    // final: EXAM_FINAL,
} as const;

export const EXAM_CATEGORIES = Object.keys(ExamCatMap) as (keyof typeof ExamCatMap)[];
type ExamCatType = typeof EXAM_CATEGORIES[number];

// *** User Selected *** //

// export const ExamSelected: {
//     [K in ExamCatType]: typeof ExamCatMap[K][number][];
// } = {
//     selective: ["VCE-MATH"],
//     proficiency: ["NAPLAN-MATH"],
//     certification: [],
//     final: [],
// };

// *** User Selected *** //
