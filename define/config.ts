// ****************** User Configuration ****************** //

export const REGIONS = [
    "au",
    "cn",
    // "us",
    // "jp",
] as const;
export type RegionType = typeof REGIONS[number];

export const LANGUAGES = [
    "en-AU",
    "zh-CN",
] as const;
export type LanguageType = typeof LANGUAGES[number];

// ****************** Plan Configuration ****************** //

export const PRIORITIES = [
    0,
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
] as const;
export type PriorityType = typeof PRIORITIES[number];
