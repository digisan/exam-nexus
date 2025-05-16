export const EXAM_SELECTIVE = [
    "vce.ma.1",
    "vce.ma.2",
    "vce.ma.3",
    "vce.en.1",
    "vce.en.2",
    "vce.en.3",
    "vce.en.4",
];

export const EXAM_PROFICIENCY = [
    "naplan.r.y3",
    "naplan.r.y5",
    "naplan.r.y7",
    "naplan.r.y9",
    "naplan.w.y3",
    "naplan.w.y5",
    "naplan.w.y7",
    "naplan.w.y9",
    "naplan.lc.y3",
    "naplan.lc.y5",
    "naplan.lc.y7",
    "naplan.lc.y9",
    "naplan.n.y3",
    "naplan.n.y5",
    "naplan.n.y7",
    "naplan.n.y9",
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
