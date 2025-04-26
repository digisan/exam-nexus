import { OpenAPIHono } from "@hono/zod-openapi";
import { jwt } from "hono/jwt";
import { cors } from "hono/cors";
import { i18nMiddleware, getI18n, type CtxType } from "@i18n/lang_t.ts";
import { AuthController } from "@controllers/auth.ts";
import { rateLimitMiddleware } from "@middleware/rateLimit.ts";

export const applyMiddleWare = (app: OpenAPIHono) => {

    // CORS
    app.use(cors({
        origin: "*", // 允许所有来源
        allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowHeaders: ["Content-Type", "Authorization"],
    }));

    // Locale Language
    app.use(i18nMiddleware);

    // Rate Control
    const mwRATE = rateLimitMiddleware(10, 1000, 10000);
    app.use("*", mwRATE);

    // JWT
    const authCtrl = new AuthController();
    const mwJWT = jwt({ secret: authCtrl.SignatureKey() });

    const authPathList = [
        "/api/user/*",
        "/api/auth/logout",
        "/api/auth/validate-token",
    ];

    const extractToken = (c: CtxType): string | null => {
        const auth = c.req.header("Authorization");
        if (!auth || !auth.startsWith("Bearer ")) return null;
        return auth.split(" ")[1];
    }

    authPathList.forEach((path) => {
        // standard JWT
        app.use(path, mwJWT);

        // manual logout blacklist check
        app.use(path, async (c: CtxType, next) => {
            const token = extractToken(c);
            if (!token || authCtrl.alreadyLogout(token)) {
                const t = getI18n(c) // 获取翻译函数
                return c.json({ message: t('token.fail._') }, 401);
            }
            await next();
        });
    });
}
