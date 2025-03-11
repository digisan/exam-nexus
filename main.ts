// ************************ AUTO GENERATED ************************ //
import authRouter from "./routes/auth.ts";
import postRouter from "./routes/post.ts";
import userRouter from "./routes/user.ts";
// **************************************************************** //
import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";
import { jwt, sign } from "hono/jwt";

const app = new OpenAPIHono();

const token = "mySecretKey";

app.use("/user/*", jwt({ secret: token })); // need JWT security token

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

app.openapi(
    createRoute({
        method: "get",
        path: "/",
        tags: ["Authenticate"],
        security: [], // without jwt security here
        responses: {
            200: {
                description: "返回TOKEN",
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
    async (c) => {
        const payload = {
            sub: "user123",
            role: "admin",
            exp: Math.floor(Date.now() / 1000) + 60 * 10, // Token expires in 10 minutes
        };
        const secret = "mySecretKey";
        const token = await sign(payload, secret);
        return c.json({ message: "", token: token });
    },
);

// ************************ AUTO GENERATED ************************ //
app.route("/auth", authRouter);
app.route("/post", postRouter);
app.route("/user", userRouter);
// **************************************************************** //

const port = 8001;
const server = Deno.serve({ port: port }, app.fetch);

// **************************************************************** //

// 监听终止信号
const shutdown = async () => {
    console.log("Received shutdown signal. Shutting down...");
    await server.shutdown();
    console.log("Server has been closed.");
    Deno.exit();
};

Deno.addSignalListener("SIGINT", shutdown);
Deno.addSignalListener("SIGBREAK", shutdown);
// Deno.addSignalListener("SIGTERM", shutdown); // only for linux
