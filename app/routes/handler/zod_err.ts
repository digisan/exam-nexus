import { z, type ZodIssue, ZodIssueCode } from "zod";
import { getCookie } from "hono/cookie";
import type { Context, ValidationTargets } from "hono";
import { isValidLanguage, type Language } from "@define/type.ts";
import { type LanguageType } from "@define/config.ts";
import { hasCertainProperty } from "@util/util.ts";
import { t500 } from "@app/routes/handler/resp.ts";

const VALIDATION = [
    "email",
    "url",
    "uuid",
    "regex",
    "datetime",
    "invalid_instanceof",
    "invalid_record_key",
] as const;

type ZodIssueCodeType = keyof typeof ZodIssueCode;
type ZodIssueValidationType = typeof VALIDATION[number];
type ZodIssueType = ZodIssueCodeType | ZodIssueValidationType;

const messages: Record<LanguageType, Record<ZodIssueType, string>> = {
    "en-AU": {
        invalid_type: "Invalid type",
        invalid_literal: "Invalid literal value",
        custom: "Invalid value",
        invalid_union: "Value does not match any of the union types",
        invalid_union_discriminator: "Invalid discriminator value",
        invalid_enum_value: "Invalid enum value",
        unrecognized_keys: "Unrecognized key(s) in object",
        invalid_arguments: "Invalid function arguments",
        invalid_return_type: "Invalid function return type",
        invalid_date: "Invalid date",
        invalid_string: "Invalid string",
        too_small: "Too small",
        too_big: "Too big",
        not_multiple_of: "Not a multiple of expected value",
        not_finite: "Must be a finite number",
        invalid_intersection_types: "Invalid intersection types",
        //
        invalid_instanceof: "Invalid class instance",
        invalid_record_key: "Invalid object key",
        email: "Invalid email format",
        url: "Invalid URL format",
        uuid: "Invalid UUID format",
        regex: "Invalid string pattern",
        datetime: "Invalid datetime string",
    },
    "zh-CN": {
        invalid_type: "类型不正确",
        invalid_literal: "不符合预期的固定值",
        custom: "自定义验证未通过",
        invalid_union: "不符合联合类型的任一项",
        invalid_union_discriminator: "无效的 discriminant 值",
        invalid_enum_value: "枚举值不合法",
        unrecognized_keys: "对象中包含未识别的字段",
        invalid_arguments: "函数参数不合法",
        invalid_return_type: "函数返回值不合法",
        invalid_date: "日期无效",
        invalid_string: "字符串无效",
        too_small: "太小",
        too_big: "太大",
        not_multiple_of: "不是指定倍数",
        not_finite: "必须是有限数字",
        invalid_intersection_types: "交叉类型不合法",
        //
        invalid_instanceof: "不是指定类的实例",
        invalid_record_key: "对象键名无效",
        email: "邮箱格式不正确",
        url: "URL 格式不正确",
        uuid: "UUID 格式不正确",
        regex: "字符串格式不符合要求",
        datetime: "日期时间格式无效",
    },
};

const translateZodIssue = (issue: ZodIssue, lang: LanguageType): string => {
    const dict = messages[lang as LanguageType] ?? messages["en-AU"];
    if (hasCertainProperty(issue, "validation", "string")) {
        if (VALIDATION.includes(issue.validation as ZodIssueValidationType)) {
            return dict[issue.validation as ZodIssueValidationType];
        }
    }
    return dict[issue.code] || issue.message || "Validation failed";
};

const translateZodIssues = (issues: ZodIssue[], raw: Record<string, unknown>, lang: Language): string[] => {
    return issues.map((issue) => {
        const path = issue.path.join(".");
        const val = raw?.[path];
        const valStr = typeof val === "undefined" ? "undefined" : JSON.stringify(val);
        const msg = translateZodIssue(issue, lang);
        return `${path}: ${valStr} ${msg}`;
    });
};

const createZodErrorHandler = () => {
    return async (
        result: { target: keyof ValidationTargets } & ({ success: false; error: z.ZodError } | { success: true; data: unknown }),
        c: Context,
    ) => {
        if (!result.success) {
            const lang = c.req.query("lang") || c.req.header("x-lang") || getCookie(c, "locale") || "en-AU" || "zh-CN";
            if (!isValidLanguage(lang)) return t500(c, "req.invalid", { req: lang });
            let body: Record<string, unknown> = {};
            try {
                body = await c.req.json();
            } catch {
                body = {};
            }
            const raw = { ...c.req.param(), ...c.req.query(), ...body };
            const messages = translateZodIssues(result.error.issues, raw, lang);
            return c.text(messages.join("\n"), 400); // only here, 'c.text' for text returning (as already translated).
        }
    };
};

// 默认导出一个预配置的处理器
export const zodErrorHandler = createZodErrorHandler();

// example
// {
//     "success": false,
//     "error": {
//       "issues": [
//         {
//           "validation": "email",
//           "code": "invalid_string",
//           "message": "Invalid email",
//           "path": [
//             "email"
//           ]
//         }
//       ],
//       "name": "ZodError"
//     }
//   }
