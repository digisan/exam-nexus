import { OpenAPIHono } from "@hono/zod-openapi";
import { jwt } from "hono/jwt";
import { cors } from "hono/cors";
import { createI18n } from "hono-i18n";
import { getCookie } from "hono/cookie";
import { msg_auth } from "@i18n/msg_auth.ts";
import { AuthController } from "@controllers/auth.ts";
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
    const mwJWT = jwt({ secret: authCtrl.SignatureKey() });

    const authPathList = [
        "/api/user/*",
        "/api/auth/logout",
        "/api/auth/validate-token",
    ];

    type c_type = Parameters<typeof getI18n>[0]

    const extractToken = (c: c_type): string | null => {
        const auth = c.req.header("Authorization");
        if (!auth || !auth.startsWith("Bearer ")) return null;
        return auth.split(" ")[1];
    }

    authPathList.forEach((path) => {
        // standard JWT
        app.use(path, mwJWT);

        // manual logout blacklist check
        app.use(path, async (c: c_type, next) => {
            const token = extractToken(c);
            if (!token || authCtrl.alreadyLogout(token)) {
                const t = getI18n(c) // 获取翻译函数
                return c.json({ message: t('token.fail._') }, 401);
            }
            await next();
        });
    });
}
