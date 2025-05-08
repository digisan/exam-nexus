import { flatten } from "flat";
import { fileExists } from "@util/util.ts";
import type { LanguageType } from "@define/config.ts";

if (import.meta.main) {
    console.log(`--> generating 'lang_t.ts'...`);

    const out_lang = "./lang_t.ts";

    const flattenToMap = (obj: Record<string, unknown>): Map<string, unknown> => {
        const flat = flatten(obj) as Record<string, unknown>;
        return new Map(Object.entries(flat));
    };

    const openLangPart = (i18nMsgsName: string) => {
        const content = `
    // *** AUTO GENERATED, DO NOT EDIT *** //

    export const ${i18nMsgsName} = {
    `;
        Deno.writeTextFileSync(out_lang, content);
    };

    const closeLangPart = () => Deno.writeTextFileSync(out_lang, `};\n`, { append: true });

    const toTsObjectLiteral = (obj: unknown, indent = 4): string => {
        const pad = (n: number) => " ".repeat(n);
        const format = (value: unknown, level: number): string => {
            const spacing = pad(level);
            if (Array.isArray(value)) {
                const items = value.map((v) => format(v, level + indent)).join(", ");
                return `[${items}]`;
            } else if (typeof value === "object" && value !== null) {
                const entries = Object.entries(value as Record<string, unknown>)
                    .map(([k, v]) => `${spacing}${k}: ${format(v, level + indent)}`)
                    .join(",\n");
                return `{\n${entries}\n${pad(level - indent)}}`;
            } else if (typeof value === "string") {
                return `"${value}"`;
            } else {
                return String(value);
            }
        };
        return format(obj, indent);
    };

    const appendLangObject = async (jsonFile: string, lang: LanguageType): Promise<Map<string, unknown>> => {
        if (!await fileExists(out_lang)) throw Error(`'${out_lang}' is NOT EXISTING for appending objects`);

        const jsonText = await Deno.readTextFile(jsonFile);
        const jsonData = JSON.parse(jsonText);
        const tsContent = `"${lang}": ${toTsObjectLiteral(jsonData)} as const,\n`;
        await Deno.writeTextFile(out_lang, tsContent, { append: true });
        return flattenToMap(jsonData);
    };

    ////////////////////////////////////////////

    const appendExContent = async (map: Map<string, unknown>, messages: string, defaultLocale: LanguageType = "en-AU") => {
        if (!await fileExists(out_lang)) throw Error(`'${out_lang}' is NOT EXISTING for appending extra content`);

        const content = `
    const keys = ${JSON.stringify(Array.from(map.keys()), null, 4)} as const;

    import { createI18n } from "hono-i18n";
    import { getCookie } from "hono/cookie";
    import { type Context } from "hono";

    export const { i18nMiddleware, getI18n } = createI18n({
        messages: ${messages},
        defaultLocale: "${defaultLocale}",
        getLocale: (c) => c.req.query("lang") ?? c.req.header("x-lang") ?? getCookie(c, "lang") ?? "en-AU",
    })

    export type TransKeyType = typeof keys[number]
    export type TransFnType = (key: TransKeyType, params?: Record<string, unknown>) => string

    export const createStrictT = (c: Context): TransFnType => getI18n(c) as TransFnType
    export const wrapOptT = (t?: TransFnType): (s: TransKeyType, params?: Record<string, unknown>) => string => t ?? ((s: TransKeyType) => s + "*");
    `;
        Deno.writeTextFileSync(out_lang, content, { append: true });
    };

    const validateTransKeys = (m1: Map<string, unknown>, m2: Map<string, unknown>) => {
        const keys1 = new Set(Array.from(m1.keys()));
        const keys2 = new Set(Array.from(m2.keys()));
        if (keys1.size !== keys2.size) return false;
        for (const item of keys1) {
            if (!keys2.has(item)) return false;
        }
        return true;
    };

    ///////////////////////////////////////////////////////////////////////////////////////

    // from some lang.json
    //
    const langRoot = "lang";
    openLangPart(langRoot);
    const m_en_au = await appendLangObject("en-au.json", "en-AU");
    const m_zh_cn = await appendLangObject("zh-cn.json", "zh-CN");
    closeLangPart();

    if (validateTransKeys(m_en_au, m_zh_cn)) {
        appendExContent(m_en_au, langRoot);

        // 格式化输出文件
        const fmt = new Deno.Command("deno", {
            args: ["fmt", out_lang],
        });
        const fmtProcess = await fmt.output();
        if (!fmtProcess.success) {
            console.error(`❌ 格式化失败:`, new TextDecoder().decode(fmtProcess.stderr));
        }
    } else {
        throw new Error("validateTransKeys went wrong");
    }
}
