// *** AUTO GENERATED, DO NOT EDIT *** //

export const lang = {
    "en-AU": {
        test: "test: {message}",
        catch: "catch: {error}",
        fatal: "fatal: {message}",
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
        },
    } as const,
    "zh-CN": {
        test: "测试消息: {message}",
        catch: "异常错误: {error}",
        fatal: "严重错误: {message}",
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
                fail_by_id: "缺少主键为{id}的元素",
                fail_by_email: "缺少Email主键为{email}的元素",
                fail_by_field_value: "缺少匹配字段{field}和其值为{value}的元素",
            },
        },
    } as const,
};

const keys = [
    "test",
    "catch",
    "fatal",
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
] as const;

import { createI18n } from "hono-i18n";
import { getCookie } from "hono/cookie";
import { type Context } from "hono";

export const { i18nMiddleware, getI18n } = createI18n({
    messages: lang,
    defaultLocale: "en-AU",
    getLocale: (c) => c.req.query("lang") ?? c.req.header("x-lang") ?? getCookie(c, "lang") ?? "en-AU",
});

export type TransKeyType = typeof keys[number];
export type TransFnType = (key: TransKeyType, params?: Record<string, unknown>) => string;

export const createStrictT = (c: Context): TransFnType => getI18n(c) as TransFnType;
export const wrapOptT = (t?: TransFnType): (s: TransKeyType, params?: Record<string, unknown>) => string => t ?? ((s: TransKeyType) => s + "*");
