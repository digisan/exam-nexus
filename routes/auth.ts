import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { verifyHCaptcha } from "@util/util.ts";
import { AuthController } from "@controllers/authController.ts";

const app = new OpenAPIHono();

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
            200: {
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
        },
    }),
    async (c: any) => {
        const { email, password, captchaToken } = c.req.valid("json");
        const result = await verifyHCaptcha(captchaToken);
        if (result.isOk()) {
            if (result.value) { // captcha verification result OK
                return c.json(await authCtrl.register(email, password));
            }
            return c.json({ success: false, message: `captcha verification failed` }, 400); // captcha verification result FAILED
        }
        return c.json({ success: false, message: `captcha CANNOT be verified ${result.error}` }, 500); // captcha verification ERROR
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
                description: "Return TOKEN",
                content: {
                    "application/json": {
                        schema: z.object({
                            message: z.string().openapi({ example: "ok" }),
                            token: z.string().openapi({ example: "token string" }),
                        }),
                    },
                },
            },
        },
    }),
    async (c: any) => {
        const { email, password, captchaToken } = c.req.valid("json");
        const result = await verifyHCaptcha(captchaToken);
        if (result.isOk()) {
            if (result.value) { // captcha verification result OK
                return c.json(await authCtrl.login(email, password));
            }
            return c.json({ message: `captcha verification failed`, token: "" }, 400); // captcha verification result FAILED
        }
        return c.json({ message: `captcha CANNOT be verified ${result.error}`, token: "" }, 500); // captcha verification ERROR
    },
);

// /////////////////////////////////////////////////////////////////////////////////////

app.openapi(
    createRoute({
        method: "post",
        path: "/logout",
        tags: ["Auth"],
        responses: {
            200: {
                description: "Disable TOKEN",
                content: {
                    "application/json": {
                        schema: z.object({
                            message: z.string().openapi({ example: "logout" }),
                        }),
                    },
                },
            },
            401: { description: "未授权(JWT 令牌无效,缺失或失效)" },
        },
    }),
    (c: any) => {
        const token = c.req.header('Authorization').split(' ')[1];
        authCtrl.logout(token)
        return c.json({ message: `logout` });
    },
);

export default app;
