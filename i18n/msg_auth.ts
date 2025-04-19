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
                invalid_email: "invalid email format",
                weak_password: "weak password format",
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
                invalid_email: "invalid email format",
                weak_password: "weak password format",
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
                invalid_email: "无效Email格式",
                weak_password: "密码不符合强度要求",
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
                invalid_email: "无效Email格式",
                weak_password: "密码不符合强度要求",
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
