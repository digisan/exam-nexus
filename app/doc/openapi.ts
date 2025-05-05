import { swaggerUI } from "@hono/swagger-ui";
import { app } from "@app/app.ts";

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
