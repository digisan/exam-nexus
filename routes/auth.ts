import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { verifyHCaptcha } from "../util/util.ts";
import { AuthController } from "../controllers/authController.ts";

const app = new OpenAPIHono();

const authCtrl = new AuthController();

// /////////////////////////////////////////////////////////////////////////////////////

const RegisterRequestBody = z.object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    email: z.string().email("Invalid email address"),
    captchaToken: z.string().min(1, "Captcha token is required"),
});

// 创建 OpenAPI 路由
app.openapi(
    createRoute({
        method: "post",
        path: "/register",
        request: {
            body: {
                description: "Register request body",
                content: {
                    "application/json": {
                        schema: RegisterRequestBody,
                        example: { // 添加测试参数输入
                            username: "john_doe",
                            password: "secure-password-123",
                            email: "john.doe@example.com",
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
                            success: z.boolean(),
                            message: z.string(),
                        }),
                    },
                },
            },
            400: {
                description: "Bad request",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: z.boolean(),
                            message: z.string(),
                        }),
                    },
                },
            },
        },
    }),
    async (c: any) => {
        const { username, password, email, captchaToken } = c.req.valid("json");
        const result = await verifyHCaptcha(captchaToken);
        if (result.isOk()) {
            if (result.value) { // captcha verification result OK
                return c.json(await authCtrl.register(username, password, email));
            }
            return c.json({ success: false, message: `captcha verification failed` }, 400); // captcha verification result FAILED
        }
        return c.json({ success: false, message: `captcha CANNOT be verified ${result.error}` }, 500); // captcha verification ERROR
    }
);

// /////////////////////////////////////////////////////////////////////////////////////

const LoginRequestBody = z.object({
    username: z.string().min(1, "Username is required"),
    password: z.string().min(3, "Password must be at least 3 characters"),
    captchaToken: z.string().min(1, "Captcha token is required"),
});

app.openapi(
    createRoute({
        method: "post",
        path: "/login",
        tags: ["Authenticate"],
        security: [], // without swagger UI jwt security
        request: {
            body: {
                description: "Login request body",
                content: {
                    "application/json": {
                        schema: LoginRequestBody,
                        example: { // 添加测试参数输入
                            username: "admin",
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
                            message: z.string(),
                            token: z.string(),
                        }),
                    },
                },
            },
        },
    }),
    async (c: any) => {
        const { username, password, captchaToken } = c.req.valid("json");
        const result = await verifyHCaptcha(captchaToken);
        if (result.isOk()) {
            if (result.value) { // captcha verification result OK
                return c.json(await authCtrl.login(username, password));
            }
            return c.json({ message: `captcha verification failed`, token: "" }, 400); // captcha verification result FAILED
        }
        return c.json({ message: `captcha CANNOT be verified ${result.error}`, token: "" }, 500); // captcha verification ERROR
    },
);

// /////////////////////////////////////////////////////////////////////////////////////

export default app;
