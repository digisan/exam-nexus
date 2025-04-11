export const msg_auth = {
    "en-AU": {
        captcha: {
            err: "captcha CANNOT be verified as 3rd access error",
            fail: "captcha verification failed",
        },
        register: {
            err: {
                fmt_json: "format error on internal storage as json",
                _: "Service is temporarily unavailable. Please try again later"
            },
            fail: {
                existing: "already registered",
                _: "Invalid register information."
            },
            ok: {
                __: "registered successfully",
                _: "Welcome! now you joined EXAM-NEXUS"
            }
        },
        login: {
            err: {
                fmt_json: "format error on internal storage as json",
                _: "Service is temporarily unavailable. Please try again later"
            },
            fail: {
                not_existing: "not registered yet",
                verification: "incorrect email or password",
                _: "Incorrect login information"
            },
            ok: {
                __: "login successfully, token sent",
                _: "Login successfully, token sent"
            }
        },
        token: {
            fail: {
                _: "Token is invalid"
            }
        }
    } as const,
    "zh-CN": {
        captcha: {
            err: "验证码无法验证，因第三方访问错误",
            fail: "验证码验证失败"
        },
        register: {
            err: {
                fmt_json: "内部存储格式错误（JSON）",
                _: "服务暂时不可用，请稍后再试"
            },
            fail: {
                existing: "已注册",
                _: "无效的注册信息"
            },
            ok: {
                __: "注册成功",
                _: "欢迎！你已加入 EXAM-NEXUS"
            }
        },
        login: {
            err: {
                fmt_json: "内部存储格式错误（JSON）",
                _: "服务暂时不可用，请稍后再试"
            },
            fail: {
                not_existing: "尚未注册",
                verification: "邮箱或密码错误",
                _: "登录信息无效"
            },
            ok: {
                __: "登录成功，令牌已发送",
                _: "登录成功，令牌已发送"
            }
        },
        token: {
            fail: {
                _: "令牌无效或失效"
            }
        }
    } as const
}

// import { flatten } from 'flat'

// function flattenToMap(obj: Record<string, any>): Map<string, any> {
//     const flat = flatten(obj) as Record<string, any>;
//     return new Map(Object.entries(flat));
// }

// function generateConstKeysToFile(map: Map<string, any>, filename: string) {
//     const keys = Array.from(map.keys());
//     const content1 = `const keys = ${JSON.stringify(keys, null, 4)} as const;\n\n`;
//     const content2 = `export type TranslationKey = typeof keys[number];\n\n`;
//     const content3 = `export type SafeT = (key: TranslationKey, params?: Record<string, unknown>) => string;`;
//     Deno.writeTextFileSync(filename, content1 + content2 + content3);
//     console.log(`Keys written to ${filename}`);
// }

// function validateTransKeys(m1: Map<string, any>, m2: Map<string, any>) {
//     const keys1 = new Set(Array.from(m1.keys()))
//     const keys2 = new Set(Array.from(m2.keys()))
//     if (keys1.size !== keys2.size) return false;
//     for (const item of keys1) {
//         if (!keys2.has(item)) return false;
//     }
//     return true;
// }

// const m_en = flattenToMap(msg_auth['en-AU'])
// const m_zh = flattenToMap(msg_auth['zh-CN'])

// if (validateTransKeys(m_en, m_zh)) {
//     generateConstKeysToFile(flattenToMap(msg_auth['zh-CN']), "./msg_auth_t.ts")
// } else {
//     throw new Error("validateTransKeys went wrong");
// }

