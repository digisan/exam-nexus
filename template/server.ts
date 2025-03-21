import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";
import { jwt } from "hono/jwt";
import { cors } from 'hono/cors';
import { AuthController } from "@controllers/authController.ts";
import { rateLimitMiddleware } from "@middleware/rateLimit.ts";

const app = new OpenAPIHono();
const authCtrl = new AuthController();

app.use(cors({
    origin: '*', // 允许所有来源
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization']
}));

const mwRATE = rateLimitMiddleware(5, 1000, 10000)
app.use('*', mwRATE)

const mwJWT = jwt({ secret: authCtrl.SignatureKey })
const authPathList = [
    "/api/user/*",
    "/api/auth/logout"
];
authPathList.forEach((item) => {
    app.use(item, mwJWT);
    app.use(item, async (c: any, next) => {
        const token = c.req.header('Authorization').split(' ')[1];
        if (authCtrl.alreadyLogout(token)) {
            return c.json({ message: 'Token is invalid' }, 401);
        }
        await next();
    });
})

// **************************************************************** //

app.openapi(
    createRoute({
        method: "get",
        path: "/",
        summary: "Root API",
        description: "hello exam-nexus",
        tags: ["Root"],
        security: [], // without swagger UI jwt security
        responses: {
            200: {
                description: "return 'hello exam-nexus'",
                content: {
                    "text/plain": {
                        schema: z.string(),
                    },
                },
            },
        },
    }),
    (c: any) => c.text("hello exam-nexus"),
);

// Swagger UI [Authorize] Button
app.openAPIRegistry.registerComponent("securitySchemes", "BearerAuth", {
    type: "http",
    name: "Authorization",
    scheme: "bearer",
    in: "header",
    description: "Bearer token",
    bearerFormat: "JWT",
});

// Create OPENAPI Spec File
app.doc31("/openapi.json", {
    openapi: "3.1.0",
    info: {
        title: "Hono API 文档",
        version: "1.0.0",
    },
    security: [{ BearerAuth: [] }], // lock each API by default in swagger UI
});

// Host OPENAPI Spec File on /docs
app.get("/docs", swaggerUI({ url: "/openapi.json" }));

// ************************ AUTO GENERATED ************************ //
// ROUTER.USE... //
// **************************************************************** //

const port = 8001;
const server = Deno.serve({ port: port }, app.fetch);

// **************************************************************** //

// 监听终止信号
const shutdown = async () => {
    console.log("Received shutdown signal. Shutting down...");
    setTimeout(() => {
        console.log("Server has been closed by exit()");
        Deno.exit();
    }, 5000);
    await server.shutdown();
    console.log("Server has been closed by shutdown()");
};

Deno.addSignalListener("SIGINT", shutdown);
Deno.addSignalListener("SIGBREAK", shutdown);
// Deno.addSignalListener("SIGTERM", shutdown); // only for linux
