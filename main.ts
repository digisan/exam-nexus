// ************************ AUTO GENERATED ************************ //
import authRouter from "@routes/auth.ts";
import postRouter from "@routes/post.ts";
import testRouter from "@routes/test.ts";
import userRouter from "@routes/user.ts";
// **************************************************************** //
import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";
import { applyMiddleWare } from "@middleware/appUse.ts";
await import("@define/const.ts");

const app = new OpenAPIHono();

applyMiddleWare(app);

app.openapi(
    createRoute(
        {
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
        } as const,
    ),
    (c) => c.text("hello exam-nexus"),
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
app.route("/api/auth", authRouter);
app.route("/api/post", postRouter);
app.route("/api/test", testRouter);
app.route("/api/user", userRouter);
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

// **************************************************************** //

const port = 8001;
const server = Deno.serve({ port: port }, app.fetch);
