import { err } from "neverthrow";
import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { verifyHCaptcha, bools2idx } from "@util/util.ts";
import { AuthController } from "@controllers/authController.ts";
import { createI18n } from "hono-i18n";
import { getCookie } from "hono/cookie";
import { msg_auth } from "@i18n/msg_auth.ts";
import { isFatalErr } from "@i18n/util.ts";
import { StatusCode } from "http-status-code";

const { i18nMiddleware, getI18n } = createI18n({
    messages: msg_auth,
    defaultLocale: "en-AU",
    getLocale: (c) => getCookie(c, "locale-cookie"),
})

const app = new OpenAPIHono();
app.use(i18nMiddleware)

const authCtrl = new AuthController();

// /////////////////////////////////////////////////////////////////////////////////////

const RegisterRequestBody = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    captchaToken: z.string().min(1, "Captcha token is required"),
});

// 创建 OpenAPI 路由
app.openapi(
    createRoute({
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
                description: "Bad request",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: z.boolean().openapi({ example: false }),
                            message: z.string().openapi({ example: "failed" }),
                        }),
                    },
                },
            },
            500: { description: "Internal Deno Server Error" }
        },
    } as const),
    async (c) => {

        const { email, password, captchaToken } = c.req.valid("json");
        const t = getI18n(c) // 获取翻译函数

        const cResult = await verifyHCaptcha(captchaToken);
        // const cVerifyOk = cResult.isOk() ? cResult.value : false; // prod env

        // only for debug
        let cVerifyOk = cResult.isOk() ? cResult.value : false;
        cVerifyOk = email === 'cdutwhu@yeah.net' ? true : cVerifyOk

        const result = cVerifyOk ? await authCtrl.register({ email, password }, t) : err(`NOT trigger - 'register'`);

        const getMsgCode = (...flags: boolean[]): [string, StatusCode] =>
            [
                ...new Array(8).fill([t('register.err._'), 500]), //  0***
                ...new Array(4).fill([t('captcha.fail'), 400]), //    10**
                ...new Array(2).fill([t('register.err._'), 500]), //  110*
                ...new Array(1).fill([t('register.fail._'), 500]), // 1110
                ...new Array(1).fill([t('register.ok._'), 201]), //   1111
            ][bools2idx(...flags)] || ['undefined status', 500];

        const mc = getMsgCode(
            cResult.isOk(),
            cVerifyOk,
            isFatalErr(result),
            result.isOk()
        );
        return c.json({ success: result.isOk(), message: mc[0] }, mc[1])
    }
);

// /////////////////////////////////////////////////////////////////////////////////////

const LoginRequestBody = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(3, "Password must be at least 3 characters"),
    captchaToken: z.string().min(1, "Captcha token is required"),
});

app.openapi(
    createRoute({
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
            400: { description: "Bad Request" },
            401: { description: "Unauthorized" },
            500: { description: "Internal Deno Server Error" }
        },
    } as const),
    async (c) => {

        const { email, password, captchaToken } = c.req.valid("json");
        const t = getI18n(c) // 获取翻译函数

        const cResult = await verifyHCaptcha(captchaToken);
        // const cVerifyOk = cResult.isOk() ? cResult.value : false; // prod env

        // only for debug
        let cVerifyOk = cResult.isOk() ? cResult.value : false;
        cVerifyOk = email === 'cdutwhu@yeah.net' ? true : cVerifyOk

        const result = cVerifyOk ? await authCtrl.login({ email, password }, t) : err(`NOT trigger - 'login'`);

        const getMsgCode = (...flags: boolean[]): [string, StatusCode] =>
            [
                ...new Array(8).fill([t('login.err._'), 500]), //  0***
                ...new Array(4).fill([t('captcha.fail'), 400]), // 10**
                ...new Array(2).fill([t('login.err._'), 500]), //  110*
                ...new Array(1).fill([t('login.fail._'), 401]), // 1110
                ...new Array(1).fill([t('login.ok._'), 200]), //   1111
            ][bools2idx(...flags)] || ['undefined status', 500];

        const mc = getMsgCode(
            cResult.isOk(),
            cVerifyOk,
            isFatalErr(result),
            result.isOk()
        );

        return c.json({ token: result.isOk() ? result.value : "", message: mc[0] }, mc[1])
    }
);

// /////////////////////////////////////////////////////////////////////////////////////

app.openapi(
    createRoute({
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
            401: { description: "Invalid Token" },
            500: { description: "Internal Deno Server Error" }
        },
    } as const),
    (c) => {
        const { Authorization } = c.req.valid('header') // ✅ 自动校验，不再 undefined
        const token = Authorization.split(' ')[1]
        authCtrl.logout(token)
        return new Response(null, { status: 204 })
    },
);

// /////////////////////////////////////////////////////////////////////////////////////

// app.openapi(
//     createRoute({
//         method: "get",
//         path: "/validate-token",
//         tags: ["Auth"],
//         responses: {
//             200: { description: "Valid Token" },
//             401: { description: "Invalid Token" },
//             500: { description: "Internal Deno Server Error" }
//         },
//     } as const),
//     (_c) => new Response(null, { status: 200 }),
// );

export default app;
