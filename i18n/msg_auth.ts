import { Result } from "neverthrow"

export const isFatalErr = (r: Result<string, Error>) => r.isErr() && r.error.message.toLowerCase().includes('fatal');

export const createSafeI18nT = (f?: Function) => (args: any) => (f ? f(args) : args);

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
    },
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
    }
}