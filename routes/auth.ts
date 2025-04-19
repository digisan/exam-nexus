import { ok, err, Result } from "neverthrow";
import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { verifyHCaptcha, len, lastElem, true2err, false2err, isEmail, isAllowedPassword } from "@util/util.ts";
import { AuthController } from "@controllers/auth.ts";
import { createI18n } from "hono-i18n";
import { getCookie } from "hono/cookie";
import { msg_auth } from "@i18n/msg_auth.ts";
import type { TranslationKey, SafeT } from "@i18n/msg_auth_t.ts";
import { isFatalErr } from "@i18n/util.ts";
import { StatusCode } from "http-status-code";

const { i18nMiddleware, getI18n } = createI18n({
    messages: msg_auth,
    defaultLocale: "en-AU",
    getLocale: (c) => getCookie(c, "locale-cookie"),
})

const withSafeT = (c: any): SafeT => getI18n(c) as SafeT // 获取翻译函数

const getMsgCode = (listMsgCode: [Result<any, string>, TranslationKey, StatusCode][], t: SafeT): [string, StatusCode] => {
    if (len(listMsgCode) === 0) {
        return ['listMsgCode is empty', 500]
    }
    for (const [_i, mc] of listMsgCode.entries()) {
        if (mc[0].isErr()) {
            return [t(mc[1]), mc[2]]
        }
    }
    const last = lastElem(listMsgCode)
    if (last && last[0].isOk()) {
        return [t(last[1]), last[2]]
    }
    return ['missing last OK status from listMsgCode', 500]
}

const app = new OpenAPIHono();
app.use(i18nMiddleware)

const authCtrl = new AuthController();

// /////////////////////////////////////////////////////////////////////////////////////

const RegisterRequestBody = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    captchaToken: z.string().min(1, "Captcha token is required"),
});

// 创建 OpenAPI 路由
app.openapi(
    createRoute(
        {
            method: "post",
            path: "/register",
            tags: ["Auth"],
            security: [], // without swagger UI jwt security
            request: {
                body: {
                    description: "Register request body",
                    content: {
                        "application/json": {
                            schema: RegisterRequestBody,
                            example: { // 添加测试参数输入
                                email: "john.doe@example.com",
                                password: "secure-password-123",
                                captchaToken: "valid_captcha_token",
                            },
                        },
                    },
                },
            },
            responses: {
                201: {
                    description: "Registration successful",
                    content: {
                        "application/json": {
                            schema: z.object({
                                success: z.boolean().openapi({ example: true }),
                                message: z.string().openapi({ example: "registered" }),
                            }),
                        },
                    },
                },
                400: {
                    description: "Bad request", // 邮箱格式错误, 密码太弱, 用户已存在
                    content: {
                        "application/json": {
                            schema: z.object({
                                success: z.boolean().openapi({ example: false }),
                                message: z.string().openapi({ example: "failed" }),
                            }),
                        },
                    },
                },
                500: { description: "Internal Deno Server Error" } // 数据库异常, 邮件服务崩溃 等
            },
        } as const,
    ),
    async (c) => {

        const t = withSafeT(c)

        const { email, password, captchaToken } = c.req.valid("json");
        if (!isEmail(email)) {
            return c.json({ success: false, message: t('register.fail.invalid_email') }, 400)
        }
        if (!isAllowedPassword(password)) {
            return c.json({ success: false, message: t('register.fail.weak_password') }, 400)
        }

        let cAccessResult: Result<boolean, string>;
        let cVerifyResult: Result<boolean, string>;

        if (email.startsWith(`c`)) {
            cAccessResult = ok(true)
            cVerifyResult = ok(true)  // only for swagger debug !!! in prod, only keep ... in 'else {...}'
        } else {
            cAccessResult = await verifyHCaptcha(captchaToken);
            if (cAccessResult.isOk()) {
                cVerifyResult = false2err(cAccessResult.value, "captcha failed"); // only this line in prod
            } else {
                cVerifyResult = err(cAccessResult.error); // 原始错误
            }
        }

        const result = cVerifyResult.isOk() ? await authCtrl.register({ email, password }, t) : err(`NOT trigger - 'register'`);
        const isFatalResult = true2err(isFatalErr(result), 'fatal at register');
        const listMsgCode: [Result<string | boolean, string>, TranslationKey, StatusCode][] = [
            [cAccessResult, 'register.err._', 500],
            [cVerifyResult, 'captcha.fail', 400],
            [isFatalResult, 'register.err._', 500],
            [result, 'register.fail._', 500],
            [result, 'register.ok._', 201],
        ]
        const mc = getMsgCode(listMsgCode, t);
        return c.json({ success: result.isOk(), message: mc[0] }, mc[1])
    }
);

// /////////////////////////////////////////////////////////////////////////////////////

const LoginRequestBody = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    captchaToken: z.string().min(1, "Captcha token is required"),
});

app.openapi(
    createRoute(
        {
            method: "post",
            path: "/login",
            tags: ["Auth"],
            security: [], // without swagger UI jwt security
            request: {
                body: {
                    description: "Login request body",
                    content: {
                        "application/json": {
                            schema: LoginRequestBody,
                            example: { // 添加测试参数输入
                                email: "john.doe@example.com",
                                password: "password123",
                                captchaToken: "valid_captcha_token",
                            },
                        },
                    },
                },
            },
            responses: {
                200: {
                    description: "Return Token",
                    content: {
                        "application/json": {
                            schema: z.object({
                                message: z.string().openapi({ example: "ok" }),
                                token: z.string().openapi({ example: "token string" }),
                            }),
                        },
                    },
                },
                400: { description: "Bad Request" }, // 参数缺失
                401: { description: "Unauthorized" }, // 账号或密码错误
                500: { description: "Internal Deno Server Error" }
            },
        } as const,
    ),
    async (c) => {

        const t = withSafeT(c)

        const { email, password, captchaToken } = c.req.valid("json");
        if (!isEmail(email)) {
            return c.json({ success: false, message: t('login.fail.invalid_email') }, 400)
        }
        if (!isAllowedPassword(password)) {
            return c.json({ success: false, message: t('login.fail.weak_password') }, 400)
        }

        let cAccessResult: Result<boolean, string>;
        let cVerifyResult: Result<boolean, string>;

        if (email.startsWith(`c`)) {
            cAccessResult = ok(true)
            cVerifyResult = ok(true)  // only for debug !!!
        } else {
            cAccessResult = await verifyHCaptcha(captchaToken);
            if (cAccessResult.isOk()) {
                cVerifyResult = false2err(cAccessResult.value, "captcha failed"); // only this line in prod
            } else {
                cVerifyResult = err(cAccessResult.error); // 原始错误
            }
        }

        const result = cVerifyResult.isOk() ? await authCtrl.login({ email, password }, t) : err(`NOT trigger - 'login'`);
        const isFatalResult = true2err(isFatalErr(result), 'fatal at register');
        const listMsgCode: [Result<string | boolean, string>, TranslationKey, StatusCode][] = [
            [cAccessResult, 'login.err._', 500],
            [cVerifyResult, 'captcha.fail', 400],
            [isFatalResult, 'login.err._', 500],
            [result, 'login.fail._', 401],
            [result, 'login.ok._', 200],
        ]
        const mc = getMsgCode(listMsgCode, t);
        return c.json({ token: result.isOk() ? result.value : "", message: mc[0] }, mc[1])
    }
);

// /////////////////////////////////////////////////////////////////////////////////////

app.openapi(
    createRoute(
        {
            method: "post",
            path: "/logout",
            tags: ["Auth"],
            request: {
                headers: z.object({
                    Authorization: z.string().openapi({
                        description: "Bearer token",
                        example: "Bearer xxx.yyy.zzz",
                    }),
                }),
            },
            responses: {
                204: { description: "Disable Token" },
                401: { description: "Invalid Token" }, // 未登录或 token 失效
                500: { description: "Internal Deno Server Error" }
            },
        } as const,
    ),
    (c) => {
        const { Authorization } = c.req.valid('header') // ✅ 自动校验，不再 undefined
        const token = Authorization.split(' ')[1]
        authCtrl.logout(token)
        return new Response(null, { status: 204 })
    },
);

// /////////////////////////////////////////////////////////////////////////////////////

// for front-end checking token when it's page routing
app.openapi(
    createRoute(
        {
            method: "get",
            path: "/validate-token",
            tags: ["Auth"],
            responses: {
                200: { description: "Valid Token" },
                401: { description: "Invalid Token" },
                500: { description: "Internal Deno Server Error" }
            },
        } as const,
    ),
    (_c) => new Response(null, { status: 200 }),
);

export default app;
