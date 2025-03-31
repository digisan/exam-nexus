import { OpenAPIHono } from "@hono/zod-openapi";
import { jwt } from "hono/jwt";
import { cors } from "hono/cors";
import { createI18n } from "hono-i18n";
import { getCookie } from "hono/cookie";
import { msg_auth } from "@i18n/msg_auth.ts";
import { AuthController } from "@controllers/authController.ts";
import { rateLimitMiddleware } from "@middleware/rateLimit.ts";

export const applyMiddleWare = (app: OpenAPIHono) => {

    app.use(cors({
        origin: "*", // 允许所有来源
        allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowHeaders: ["Content-Type", "Authorization"],
    }));

    const { i18nMiddleware, getI18n } = createI18n({
        messages: msg_auth,
        defaultLocale: "en-AU",
        getLocale: (c) => getCookie(c, "locale-cookie"),
    })
    app.use(i18nMiddleware)

    const mwRATE = rateLimitMiddleware(10, 1000, 10000);
    app.use("*", mwRATE);

    const authCtrl = new AuthController();
    const mwJWT = jwt({ secret: authCtrl.SignatureKey });
    const authPathList = [
        "/api/user/*",
        "/api/auth/logout",
        "/api/auth/validate-token",
    ];
    authPathList.forEach((item) => {
        // standard JWT
        app.use(item, mwJWT);
        // manual logout blacklist check
        app.use(item, async (c: any, next) => {
            const t = getI18n(c) // 获取翻译函数
            const token = c.req.header("Authorization").split(" ")[1];
            if (authCtrl.alreadyLogout(token)) {
                return c.json({ message: t('token.fail._') }, 401);
            }
            await next();
        });
    });
}

