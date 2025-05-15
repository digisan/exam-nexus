const EXAM_SELECTIVE = [
    "VCE-MATH",
    "VCE-ENGLISH",
] as const;

const EXAM_PROFICIENCY = [
    "NAPLAN-MATH",
    "NAPLAN-ENGLISH",
] as const;

const EXAM_CERTIFICATION = [
    "AWS",
] as const;

const EXAM_FINAL = [
    "YEAR-1",
] as const;

const ExamCatCollection = {
    selective: EXAM_SELECTIVE,
    proficiency: EXAM_PROFICIENCY,
    certification: EXAM_CERTIFICATION,
    final: EXAM_FINAL,
} as const;

export const EXAM_CATEGORIES = Object.keys(ExamCatCollection) as (keyof typeof ExamCatCollection)[];
type ExamCatType = typeof EXAM_CATEGORIES[number];

// *** User Selected *** //

// export const ExamSelected: {
//     [K in ExamCatType]: typeof ExamCatCollection[K][number][];
// } = {
//     selective: ["VCE-MATH"],
//     proficiency: ["NAPLAN-MATH"],
//     certification: [],
//     final: [],
// };

// *** User Selected *** //
