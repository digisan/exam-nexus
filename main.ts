// ************************ AUTO GENERATED ************************ //
import authRouter from "./routes/auth.ts";
import postRouter from "./routes/post.ts";
import userRouter from "./routes/user.ts";
import _testRouter from "./routes/_test.ts";
// **************************************************************** //
import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";
import { jwt } from "hono/jwt";

const app = new OpenAPIHono();

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
  (c) => c.text("hello exam-nexus"),
);

const SignatureKey = "mySecretKey";

app.use("/user/*", jwt({ secret: SignatureKey })); // need JWT security token

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
app.route("/auth", authRouter);
app.route("/post", postRouter);
app.route("/user", userRouter);
app.route("/_test", _testRouter);
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
