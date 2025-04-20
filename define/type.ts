import { SB_TABLES, REGIONS, LANGUAGES } from "@define/const.ts";

export type JSONObject = Record<string, any>;
export type Data = JSONObject | JSONObject[] | null;

export type TableName = typeof SB_TABLES[number];
export type RegionKey = typeof REGIONS[number];
export type LanguageKey = typeof LANGUAGES[number];
