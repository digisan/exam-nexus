import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { sign } from "hono/jwt";
import { verifyHCaptcha } from "../util/util.ts";

const app = new OpenAPIHono();

// 定义请求体 Schema
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

        const { username, password, captchaToken } = await c.req.json();

        const result = await verifyHCaptcha(captchaToken);
        if (result.isOk()) {
            if (result.value) { // captcha verification result OK

                // check (username, password)
                if (username !== "admin" || password !== "123") {
                    return c.json({ message: `user or password is invalid`, token: "" }, 400);
                }

                // create user session token
                const payload = {
                    sub: username,
                    role: "admin",
                    exp: Math.floor(Date.now() / 1000) + 60 * 10, // Token expires in 10 minutes
                };

                const SignatureKey = "mySecretKey";
                const token = await sign(payload, SignatureKey);
                return c.json({ message: "token string", token: token });
            }
            return c.json({ message: `captcha verification failed`, token: "" }, 400); // captcha verification result FAILED
        }
        return c.json({ message: `captcha CANNOT be verified ${result.error}`, token: "" }, 500); // captcha verification ERROR
    },
);

// app.post('/register', (ctx) => {
//     return ctx.json({ message: 'Register' });
// });

export default app;
