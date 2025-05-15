import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { createStrictT } from "@i18n/lang_t.ts";
import { app } from "@app/app.ts";
import { isAllowedPassword, isEmail, toValidCredential } from "@define/type.ts";
import { auth } from "@app/controllers/auth.ts";
import { verifyHCaptcha } from "@util/captcha.ts";
import { currentFilename } from "@util/util.ts";
import { zodErrorHandler } from "@app/routes/handler/zod_err.ts";
import { t400, t401, t402, t403, t500 } from "@app/routes/handler/resp.ts";

const route_app = new OpenAPIHono({ defaultHook: zodErrorHandler });

{
    const ReqSchema = z.object({
        email: z.string().email("Invalid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
        captchaToken: z.string().min(1, "Captcha token is required"),
    });

    const RespSchema = z.object({
        success: z.boolean().openapi({ example: true }),
        message: z.string().openapi({ example: "registered" }),
    });

    // 创建 OpenAPI 路由
    route_app.openapi(
        createRoute(
            {
                operationId: "REGISTER",
                method: "post",
                path: "/register",
                tags: ["Auth"],
                security: [], // without swagger UI lock
                summary: "REGISTER",
                description: "Sign up a user",
                request: {
                    body: {
                        description: "Register request body",
                        content: {
                            "application/json": {
                                schema: ReqSchema,
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
                                schema: RespSchema,
                            },
                        },
                    },
                    400: { description: "Bad Request" }, // 邮箱格式错误, 密码太弱, 用户已存在
                    500: { description: "Internal Server Error" }, // 数据库异常, 邮件服务崩溃 等
                },
            } as const,
        ),
        async (c) => {
            const t = createStrictT(c);
            const { email, password, captchaToken } = c.req.valid("json");

            if (!isEmail(email)) return t400(c, "register.fail.invalid_email");
            if (!isAllowedPassword(password)) return t400(c, "register.fail.weak_password");

            const rCaptcha = await verifyHCaptcha(captchaToken);
            if (rCaptcha.isErr()) return t500(c, "captcha.err");
            if (!rCaptcha.value) return t400(c, "captcha.fail");

            const result = await auth.register({ email, password }, t);
            if (result.isErr()) return t500(c, "register.fail._");

            const data = { success: true, message: t(`register.ok._`) };
            return RespSchema.safeParse(data).success ? c.json(data, 201) : t500(c, "resp.invalid", { resp: data });
        },
    );
}

{
    const ReqSchema = z.object({
        email: z.string().email("Invalid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
        captchaToken: z.string().min(1, "Captcha token is required"),
    });

    const RespSchema = z.object({
        success: z.boolean().openapi({ example: true }),
        message: z.string().openapi({ example: "ok" }),
        token: z.string().openapi({ example: "token string" }),
    });

    route_app.openapi(
        createRoute(
            {
                operationId: "LOGIN",
                method: "post",
                path: "/login",
                tags: ["Auth"],
                security: [], // without swagger UI lock
                summary: "LOGIN",
                description: "User login",
                request: {
                    body: {
                        description: "Login request body",
                        content: {
                            "application/json": {
                                schema: ReqSchema,
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
                                schema: RespSchema,
                            },
                        },
                    },
                    400: { description: "Bad Request" }, // 参数缺失
                    401: { description: "Unauthorized" }, // 账号或密码错误
                    500: { description: "Internal Server Error" },
                },
            } as const,
        ),
        async (c) => {
            const t = createStrictT(c);
            const { email, password, captchaToken } = c.req.valid("json");

            const r_cred = await toValidCredential({ email, password });
            if (r_cred.isErr()) return t400(c, "login.fail.invalid_credential");

            const rCaptcha = await verifyHCaptcha(captchaToken);
            if (rCaptcha.isErr()) return t500(c, "captcha.err");
            if (!rCaptcha.value) return t400(c, "captcha.fail");

            const result = await auth.login(r_cred.value, t);
            if (result.isErr()) return t500(c, "login.fail._");

            const data = { success: true, message: t(`login.ok._`), token: result.value };
            return RespSchema.safeParse(data).success ? c.json(data) : t500(c, "resp.invalid", { resp: data });
        },
    );
}

{
    const ReqSchema = z.object({
        Authorization: z.string().openapi({
            description: "Bearer token",
            example: "Bearer xxx.yyy.zzz",
        }),
    });

    const RespSchema = z.object({
        success: z.boolean().openapi({ example: true }),
        message: z.string().openapi({ example: "ok" }),
    });

    route_app.openapi(
        createRoute(
            {
                operationId: "LOGOUT",
                method: "post",
                path: "/logout",
                tags: ["Auth"],
                security: [{ BearerAuth: [] }],
                summary: "LOGOUT",
                description: "User logout",
                request: {
                    headers: ReqSchema,
                },
                responses: {
                    200: {
                        description: "Token Disabled",
                        content: {
                            "application/json": {
                                schema: RespSchema,
                            },
                        },
                    },
                    401: { description: "Unauthorized" },
                    500: { description: "Internal Server Error" },
                },
            } as const,
        ),
        (c) => {
            const t = createStrictT(c);
            const { Authorization } = c.req.valid("header"); // ✅ 自动校验，不再 undefined
            const token = Authorization.split(" ")[1];
            auth.logout(token);

            const data = { success: true, message: t(`logout.ok._`) };
            return RespSchema.safeParse(data).success ? c.json(data) : t500(c, "resp.invalid", { resp: data });
        },
    );
}

{
    const RespSchema = z.object({
        success: z.boolean().openapi({ example: true }),
        message: z.string().openapi({ example: "ok" }),
    });

    // for front-end checking token when it's page routing
    route_app.openapi(
        createRoute(
            {
                operationId: "VALIDATE_TOKEN",
                method: "get",
                path: "/validate-token",
                tags: ["Auth"],
                security: [{ BearerAuth: [] }],
                summary: "VALIDATE_TOKEN",
                description: "Validate a token",
                responses: {
                    200: {
                        description: "Token is valid",
                        content: {
                            "application/json": {
                                schema: RespSchema,
                            },
                        },
                    },
                    401: { description: "Unauthorized" },
                    500: { description: "Internal Server Error" },
                },
            } as const,
        ),
        (c) => {
            const t = createStrictT(c);
            const data = { success: true, message: t(`token.ok._`) };
            return RespSchema.safeParse(data).success ? c.json(data) : t500(c, "resp.invalid", { resp: data });
        },
    );
}

app.route(`/api/${currentFilename(import.meta.url, false)}`, route_app);
