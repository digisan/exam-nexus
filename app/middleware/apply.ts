import { jwt } from "hono/jwt";
import { cors } from "hono/cors";
import { i18nMiddleware, getI18n, type CtxType } from "@i18n/lang_t.ts";
import { app, blacklistToken } from "@app/app.ts";
import { mwRateControl } from "@app/middleware/mw/rate.ts";
import { env_get } from "@define/env.ts";

// CORS
app.use(cors({
    origin: "*", // 允许所有来源
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
}));

// Locale Language
app.use(i18nMiddleware);

// Rate Control
const mwRATE = mwRateControl(10, 1000, 10000);
app.use("*", mwRATE);

// JWT
const SIGNATURE_KEY = env_get("SIGNATURE_KEY");
const mwJWT = jwt({ secret: SIGNATURE_KEY ?? "" });

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
        if (!token || blacklistToken.has(token)) {
            const t = getI18n(c)
            return c.json({ message: t('token.fail._') }, 401);
        }
        await next();
    });
});
