// ****************** User Configuration ****************** //

export const REGIONS = [
    "au",
    "cn",
    "us",
    "jp",
] as const;
export type RegionType = typeof REGIONS[number];

export const LANGUAGES = [
    "en-AU",
    "zh-CN",
] as const;
export type LanguageType = typeof LANGUAGES[number];

export const EXAM_CATEGORIES = [
    "selective",
    "proficiency",
    "certification",
    "final",
] as const;
export type ExamCatType = typeof EXAM_CATEGORIES[number];
