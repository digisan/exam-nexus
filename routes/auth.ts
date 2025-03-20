import { ok, err } from "neverthrow";
import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { verifyHCaptcha, bools2idx } from "@util/util.ts";
import { AuthController } from "@controllers/authController.ts";
import { Status as S } from "@routes/_ENUM.ts";

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

        const cResult = await verifyHCaptcha(captchaToken);
        // const cVerifyOk = cResult.isOk() ? cResult.value : false; // prod env

        // only for debug
        let cVerifyOk = cResult.isOk() ? cResult.value : false;
        cVerifyOk = email === 'cdutwhu@yeah.net' ? true : cVerifyOk

        const result = cVerifyOk ? await authCtrl.register(email, password) : err(`NOT trigger - 'register'`);

        const M = new Map<S, [string, number]>([
            [S.Ok, [`welcome! now '${email}' joined EXAM-NEXUS`, 200]],
            [S.RegErr, [`registration failed. already registered?`, 500]],
            [S.CapVerFail, [`captcha verification failed`, 400]],
            [S.CapVerErr, [`captcha CANNOT be verified`, 500]]
        ]);

        const getMsgCode = (...flags: boolean[]): [string, number] =>
            [
                ...new Array(4).fill(M.get(S.CapVerErr)), // 0**
                ...new Array(2).fill(M.get(S.CapVerFail)), // 10*
                ...new Array(1).fill(M.get(S.RegErr)), // 110
                ...new Array(1).fill(M.get(S.Ok)), // 111
            ][bools2idx(...flags)] || ['undefined status', 500];

        const success = result.isOk()
        const mc = getMsgCode(cResult.isOk(), cVerifyOk, result.isOk())
        return c.json({ success, message: mc[0] }, mc[1])
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

        const cResult = await verifyHCaptcha(captchaToken);
        // const cVerifyOk = cResult.isOk() ? cResult.value : false; // prod env

        // only for debug
        let cVerifyOk = cResult.isOk() ? cResult.value : false;
        cVerifyOk = email === 'cdutwhu@yeah.net' ? true : cVerifyOk

        const result = cVerifyOk ? await authCtrl.login(email, password) : err(`NOT trigger - 'login'`);

        const M = new Map<S, [string, number]>([
            [S.Ok, [`'${email}' signed in`, 200]],
            [S.LoginErr, [`login failed. check login email or password`, 401]],
            [S.CapVerFail, [`captcha verification failed`, 400]],
            [S.CapVerErr, [`captcha CANNOT be verified`, 500]]
        ]);

        const getMsgCode = (...flags: boolean[]): [string, number] =>
            [
                ...new Array(4).fill(M.get(S.CapVerErr)), // 0**
                ...new Array(2).fill(M.get(S.CapVerFail)), // 10*
                ...new Array(1).fill(M.get(S.LoginErr)), // 110
                ...new Array(1).fill(M.get(S.Ok)), // 111
            ][bools2idx(...flags)] || ['undefined status', 500];

        const token = result.isOk() ? result.value : "";
        const mc = getMsgCode(cResult.isOk(), cVerifyOk, result.isOk());
        return c.json({ token, message: mc[0] }, mc[1])
    }
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
