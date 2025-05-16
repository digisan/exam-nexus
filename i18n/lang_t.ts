// *** AUTO GENERATED, DO NOT EDIT *** //

export const lang = {
    "en-AU": {
        success: "success: {message}",
        test: "test: {message}",
        welcome: "welcome to exam-nexus",
        catch: "catch: {error}",
        fatal: "fatal: {message}",
        access: {
            block_frequently: "too many request, temporarily blocked",
            wait_frequently: "too many request, access later",
        },
        param: {
            missing: "missing param(s) - {param}",
            invalid: "invalid param(s) - {param}",
        },
        req: {
            missing: "missing req(s) - {req}",
            invalid: "invalid req(s) - {req}",
        },
        resp: {
            missing: "missing resp(s) - {resp}",
            invalid: "invalid resp(s) - {resp}",
        },
        id: {
            invalid: "invalid {id} as id",
        },
        email: {
            invalid: "invalid {email} as email",
        },
        password: {
            invalid: "invalid {password} as password",
        },
        region: {
            invalid: "invalid {region} as region",
        },
        language: {
            invalid: "invalid {language} as language",
        },
        credential: {
            empty: "empty credential content",
            invalid: "invalid credential format or content - {message}",
        },
        config: {
            empty: "empty config content",
            invalid: "invalid config format or content - {message}",
        },
        captcha: {
            err: "captcha CANNOT be verified as 3rd access error",
            fail: "captcha verification failed",
        },
        register: {
            err: {
                fmt_json: "format error on internal storage as json",
                missing_content: "missing register content",
                invalid_credential_data: "invalid data format/content in db",
                _: "Service is temporarily unavailable. Please try again later",
            },
            fail: {
                invalid_id: "invalid id format",
                invalid_email: "invalid email format",
                weak_password: "weak password format",
                invalid_credential: "invalid credential content",
                existing: "already registered",
                _: "Invalid register information.",
            },
            ok: {
                __: "registered successfully",
                _: "Welcome! now you joined EXAM-NEXUS",
            },
        },
        login: {
            err: {
                fmt_json: "format error on internal storage as json",
                _: "Service is temporarily unavailable. Please try again later",
            },
            fail: {
                invalid_email: "invalid email format",
                weak_password: "weak password format",
                invalid_credential: "invalid credential content",
                not_existing: "not registered yet",
                verification: "incorrect email or password",
                _: "Incorrect login information",
            },
            ok: {
                __: "login successfully, token sent",
                _: "Login successfully, token sent",
            },
        },
        logout: {
            ok: {
                _: "Logout",
            },
        },
        token: {
            ok: {
                _: "Token is valid",
            },
            fail: {
                _: "Token is invalid",
            },
        },
        set: {
            config: {
                err: "an error occur when setting config",
                fail: "set config failed",
                ok: "set config successfully",
            },
        },
        get: {
            config: {
                err: "an error occur when getting config",
                fail: "get config failed",
                ok: "get config successfully",
            },
            db: {
                fail_by_id: "missing item keyed by {id}",
                fail_by_email: "missing item keyed by {email}",
                fail_by_field_value: "missing item by {field} and value {value}",
            },
            user: {
                not_found: "missing user keyed by {user}",
            },
        },
        exams: {
            selective: "selective",
            proficiency: "proficiency",
            certification: "certification",
            final: "final",
        },
        exam: {
            vce: {
                ma: {
                    1: "VCE Further Mathematics",
                    2: "VCE Mathematical Methods",
                    3: "VCE Specialist Mathematics",
                },
                en: {
                    1: "VCE English as an Additional Language",
                    2: "VCE English",
                    3: "VCE English Language",
                    4: "VCE Literature",
                },
            },
            naplan: {
                r: {
                    y3: "NAPLAN Reading Year3",
                    y5: "NAPLAN Reading Year5",
                    y7: "NAPLAN Reading Year7",
                    y9: "NAPLAN Reading Year9",
                },
                w: {
                    y3: "NAPLAN Writing Year3",
                    y5: "NAPLAN Writing Year5",
                    y7: "NAPLAN Writing Year7",
                    y9: "NAPLAN Writing Year9",
                },
                lc: {
                    y3: "NAPLAN Language Conventions Year3",
                    y5: "NAPLAN Language Conventions Year5",
                    y7: "NAPLAN Language Conventions Year7",
                    y9: "NAPLAN Language Conventions Year9",
                },
                n: {
                    y3: "NAPLAN Numeracy Year3",
                    y5: "NAPLAN Numeracy Year5",
                    y7: "NAPLAN Numeracy Year7",
                    y9: "NAPLAN Numeracy Year9",
                },
            },
            cet: {
                4: "College English Test Band 4",
                6: "College English Test Band 6",
            },
        },
    } as const,
    "zh-CN": {
        success: "返回成功: {message}",
        test: "测试消息: {message}",
        welcome: "欢迎来到EXAM-NEXUS",
        catch: "异常错误: {error}",
        fatal: "严重错误: {message}",
        access: {
            block_frequently: "过于频繁访问, 暂时停止服务",
            wait_frequently: "过于频繁访问, 稍后再次访问",
        },
        param: {
            missing: "参数缺失 - {param}",
            invalid: "无效参数 - {param}",
        },
        req: {
            missing: "请求内容缺失(s) - {req}",
            invalid: "请求内容无效(s) - {req}",
        },
        resp: {
            missing: "回复内容缺失(s) - {resp}",
            invalid: "回复内容无效(s) - {resp}",
        },
        id: {
            invalid: "{id}为无效ID",
        },
        email: {
            invalid: "{email}为无效Email格式",
        },
        password: {
            invalid: "{password}为无效密码",
        },
        region: {
            invalid: "{region}为无效区域",
        },
        language: {
            invalid: "{language}为无效语言",
        },
        credential: {
            empty: "身份验证内容为空",
            invalid: "非法身份验证格式或内容 - {message}",
        },
        config: {
            empty: "配置内容为空",
            invalid: "非法配置格式或内容 - {message}",
        },
        captcha: {
            err: "验证码无法验证，因第三方访问错误",
            fail: "验证码验证失败",
        },
        register: {
            err: {
                fmt_json: "内部存储格式错误(JSON)",
                missing_content: "注册信息丢失",
                invalid_credential_data: "数据库data字段格式或内容错误",
                _: "服务暂时不可用，请稍后再试",
            },
            fail: {
                invalid_id: "无效ID",
                invalid_email: "无效Email格式",
                weak_password: "密码不符合强度要求",
                invalid_credential: "无效的身份验证信息",
                existing: "已注册",
                _: "无效的注册信息",
            },
            ok: {
                __: "注册成功",
                _: "欢迎！你已加入 EXAM-NEXUS",
            },
        },
        login: {
            err: {
                fmt_json: "内部存储格式错误(JSON)",
                _: "服务暂时不可用，请稍后再试",
            },
            fail: {
                invalid_email: "无效Email格式",
                weak_password: "密码不符合强度要求",
                invalid_credential: "无效的身份验证信息",
                not_existing: "尚未注册",
                verification: "邮箱或密码错误",
                _: "登录信息无效",
            },
            ok: {
                __: "登录成功，令牌已发送",
                _: "登录成功，令牌已发送",
            },
        },
        logout: {
            ok: {
                _: "已登出",
            },
        },
        token: {
            ok: {
                _: "有效令牌",
            },
            fail: {
                _: "令牌无效或失效",
            },
        },
        set: {
            config: {
                err: "设置配置时发生错误",
                fail: "设置配置失败",
                ok: "设置配置成功",
            },
        },
        get: {
            config: {
                err: "获取配置时错误发生",
                fail: "获取配置失败",
                ok: "获取配置成功",
            },
            db: {
                fail_by_id: "缺失主键为{id}的元素",
                fail_by_email: "缺失Email主键为{email}的元素",
                fail_by_field_value: "缺失匹配字段{field}和其值为{value}的元素",
            },
            user: {
                not_found: "缺失主键为{user}的用户信息",
            },
        },
        exams: {
            selective: "选拔类",
            proficiency: "水平测试类",
            certification: "资格认证类",
            final: "期末结业类",
        },
        exam: {
            vce: {
                ma: {
                    1: "VCE 进阶数学",
                    2: "VCE 数学方法",
                    3: "VCE 专业数学",
                },
                en: {
                    1: "VCE 英语作为附加语言",
                    2: "VCE 英语",
                    3: "VCE 英语语言",
                    4: "VCE 文学",
                },
            },
            naplan: {
                r: {
                    y3: "NAPLAN 三年级阅读",
                    y5: "NAPLAN 五年级阅读",
                    y7: "NAPLAN 七年级阅读",
                    y9: "NAPLAN 九年级阅读",
                },
                w: {
                    y3: "NAPLAN 三年级写作",
                    y5: "NAPLAN 五年级写作",
                    y7: "NAPLAN 七年级写作",
                    y9: "NAPLAN 九年级写作",
                },
                lc: {
                    y3: "NAPLAN 三年级语言规范",
                    y5: "NAPLAN 五年级语言规范",
                    y7: "NAPLAN 七年级语言规范",
                    y9: "NAPLAN 九年级语言规范",
                },
                n: {
                    y3: "NAPLAN 三年级数学",
                    y5: "NAPLAN 五年级数学",
                    y7: "NAPLAN 七年级数学",
                    y9: "NAPLAN 九年级数学",
                },
            },
            cet: {
                4: "大学英语四级考试",
                6: "大学英语六级考试",
            },
        },
    } as const,
};

const keys = [
    "success",
    "test",
    "welcome",
    "catch",
    "fatal",
    "access.block_frequently",
    "access.wait_frequently",
    "param.missing",
    "param.invalid",
    "req.missing",
    "req.invalid",
    "resp.missing",
    "resp.invalid",
    "id.invalid",
    "email.invalid",
    "password.invalid",
    "region.invalid",
    "language.invalid",
    "credential.empty",
    "credential.invalid",
    "config.empty",
    "config.invalid",
    "captcha.err",
    "captcha.fail",
    "register.err.fmt_json",
    "register.err.missing_content",
    "register.err.invalid_credential_data",
    "register.err._",
    "register.fail.invalid_id",
    "register.fail.invalid_email",
    "register.fail.weak_password",
    "register.fail.invalid_credential",
    "register.fail.existing",
    "register.fail._",
    "register.ok.__",
    "register.ok._",
    "login.err.fmt_json",
    "login.err._",
    "login.fail.invalid_email",
    "login.fail.weak_password",
    "login.fail.invalid_credential",
    "login.fail.not_existing",
    "login.fail.verification",
    "login.fail._",
    "login.ok.__",
    "login.ok._",
    "logout.ok._",
    "token.ok._",
    "token.fail._",
    "set.config.err",
    "set.config.fail",
    "set.config.ok",
    "get.config.err",
    "get.config.fail",
    "get.config.ok",
    "get.db.fail_by_id",
    "get.db.fail_by_email",
    "get.db.fail_by_field_value",
    "get.user.not_found",
    "exams.selective",
    "exams.proficiency",
    "exams.certification",
    "exams.final",
    "exam.vce.ma.1",
    "exam.vce.ma.2",
    "exam.vce.ma.3",
    "exam.vce.en.1",
    "exam.vce.en.2",
    "exam.vce.en.3",
    "exam.vce.en.4",
    "exam.naplan.r.y3",
    "exam.naplan.r.y5",
    "exam.naplan.r.y7",
    "exam.naplan.r.y9",
    "exam.naplan.w.y3",
    "exam.naplan.w.y5",
    "exam.naplan.w.y7",
    "exam.naplan.w.y9",
    "exam.naplan.lc.y3",
    "exam.naplan.lc.y5",
    "exam.naplan.lc.y7",
    "exam.naplan.lc.y9",
    "exam.naplan.n.y3",
    "exam.naplan.n.y5",
    "exam.naplan.n.y7",
    "exam.naplan.n.y9",
    "exam.cet.4",
    "exam.cet.6",
] as const;

import { createI18n } from "hono-i18n";
import { getCookie } from "hono/cookie";
import { type Context } from "hono";

export const { i18nMiddleware, getI18n } = createI18n({
    messages: lang,
    defaultLocale: "en-AU",
    getLocale: (c) => c.req.query("lang") ?? c.req.header("x-lang") ?? getCookie(c, "locale") ?? "en-AU",
});

export type TransKeyType = typeof keys[number];
export type TransFnType = (key: TransKeyType, params?: Record<string, unknown>) => string;

export const createStrictT = (c: Context): TransFnType => getI18n(c) as TransFnType;
export const wrapOptT = (t?: TransFnType): (s: TransKeyType, params?: Record<string, unknown>) => string => t ?? ((s: TransKeyType) => s + "*");

export const isTransKey = (s?: string): boolean => keys.includes(s as TransKeyType);
export const safeT = (t: TransFnType, s: string, defaultOut?: string): string => isTransKey(s) ? t(s as TransKeyType) : (defaultOut ?? s);
export const batchT = (c: Context, s: string[], prefix?: string): string[] => {
    const t = createStrictT(c);
    return prefix ? s.map((item) => safeT(t, `${prefix.replace(/\.+$/, "")}.${item}`, item)) : s.map((item) => safeT(t, item));
};
