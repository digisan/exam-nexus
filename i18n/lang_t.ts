// *** AUTO GENERATED, DO NOT EDIT *** //

export const lang = {
    "en-AU": {
        test: "test: {message}",
        catch: "catch: {error}",
        fatal: "fatal: {message}",
        id: {
            invalid: "invalid id",
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
        token: {
            fail: {
                _: "Token is invalid",
            },
        },
    } as const,
    "zh-CN": {
        test: "测试消息: {message}",
        catch: "异常错误: {error}",
        fatal: "严重错误: {message}",
        id: {
            invalid: "非法ID",
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
                invalid_id: "无效ID格式",
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
        token: {
            fail: {
                _: "令牌无效或失效",
            },
        },
    } as const,
};

const keys = [
    "test",
    "catch",
    "fatal",
    "id.invalid",
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
    "token.fail._",
] as const;

import { createI18n } from "hono-i18n";
import { getCookie } from "hono/cookie";

export const { i18nMiddleware, getI18n } = createI18n({
    messages: lang,
    defaultLocale: "en-AU",
    getLocale: (c) => c.req.query('lang') ?? c.req.header('x-lang') ?? getCookie(c, 'lang') ?? 'en-AU',
});

export type TransKeyType = typeof keys[number];
export type TransFnType = (key: TransKeyType, params?: Record<string, unknown>) => string;
export type CtxType = Parameters<typeof getI18n>[0];

export const createStrictT = (c: CtxType): TransFnType => getI18n(c) as TransFnType;
export const wrapOptT = (t?: TransFnType): (s: TransKeyType, params?: Record<string, unknown>) => string => t ?? ((s: TransKeyType) => s + "*");
