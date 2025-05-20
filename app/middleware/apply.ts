import { jwt } from "hono/jwt";
import { cors } from "hono/cors";
import { type Context } from "hono";
import { i18nMiddleware } from "@i18n/lang_t.ts";
import { app, blacklistToken } from "@app/app.ts";
import { rateControl } from "@app/middleware/mw/rate.ts";
import { env_get } from "@define/env.ts";
import { t401 } from "@app/routes/handler/resp.ts";

// CORS
app.use(cors({
    origin: "*", // 允许所有来源
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
}));

// Locale Language
app.use(i18nMiddleware);

// Rate Control
app.use("*", rateControl(10, 1000, 5000));

// JWT
const mw_jwt = jwt({ secret: env_get("SIGNATURE_KEY") ?? "" });

const authPaths = [
    // "/",
    // "/api/user/*", // for testing
    "/api/auth/logout",
    "/api/auth/validate-token",
    "/api/config/*",
    "/api/user_exam/*",
];

const getToken = (c: Context): string | null => {
    const auth = c.req.header("Authorization");
    if (!auth || !auth.startsWith("Bearer ")) return null;
    return auth.split(" ")[1];
};

authPaths.forEach((path) => {
    // standard JWT
    app.use(path, mw_jwt);

    // manual logout blacklist check
    app.use(path, async (c: Context, next) => {
        const token = getToken(c);
        if (!token || blacklistToken.has(token)) return t401(c, "token.fail._");
        await next();
    });
});
