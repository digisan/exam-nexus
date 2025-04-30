import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { createStrictT } from "@i18n/lang_t.ts";
import { app } from "@app/app.ts";
import { isAllowedPassword, isEmail, toValidCredential } from "@define/type.ts";
import { auth } from "@app/controllers/auth.ts";
import { verifyHCaptcha } from "@util/captcha.ts";

const route_app = new OpenAPIHono();
app.route("/api/auth", route_app);

// /////////////////////////////////////////////////////////////////////////////////////

const RegisterReqBody = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    captchaToken: z.string().min(1, "Captcha token is required"),
});

// 创建 OpenAPI 路由
route_app.openapi(
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
                            schema: RegisterReqBody,
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
        const t = createStrictT(c)
        const { email, password, captchaToken } = c.req.valid("json");

        if (!isEmail(email)) return c.json({ success: false, message: t('register.fail.invalid_email') }, 400)
        if (!isAllowedPassword(password)) return c.json({ success: false, message: t('register.fail.weak_password') }, 400)

        const rCaptcha = await verifyHCaptcha(captchaToken);
        if (rCaptcha.isErr()) return c.json({ success: false, message: t('captcha.err') }, 500)
        if (!rCaptcha.value) return c.json({ success: false, message: t('captcha.fail') }, 400)

        const result = await auth.register({ email, password }, t);
        if (result.isErr()) return c.json({ success: false, message: t('register.fail._') }, 500)
        return c.json({ success: true, message: t(`register.ok._`) }, 200)
    }
);

// /////////////////////////////////////////////////////////////////////////////////////

const LoginReqBody = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    captchaToken: z.string().min(1, "Captcha token is required"),
});

route_app.openapi(
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
                            schema: LoginReqBody,
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
        const t = createStrictT(c)
        const { email, password, captchaToken } = c.req.valid("json");

        const cred = await toValidCredential({ email, password })
        if (!cred) return c.json({ success: false, message: t('login.fail.invalid_credential') }, 400)

        const rCaptcha = await verifyHCaptcha(captchaToken);
        if (rCaptcha.isErr()) return c.json({ success: false, message: t('captcha.err') }, 500)
        if (!rCaptcha.value) return c.json({ success: false, message: t('captcha.fail') }, 400)

        const result = await auth.login(cred, t);
        if (result.isErr()) return c.json({ success: false, message: t('login.fail._') }, 500)
        return c.json({ success: true, token: result.value, message: t(`login.ok._`) }, 200)
    }
);

// /////////////////////////////////////////////////////////////////////////////////////

route_app.openapi(
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
        auth.logout(token)
        return new Response(null, { status: 204 })
    },
);

// /////////////////////////////////////////////////////////////////////////////////////

// for front-end checking token when it's page routing
route_app.openapi(
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
