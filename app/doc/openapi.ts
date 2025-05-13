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
        title: "Easy Exam API Doc",
        version: "0.1.0",
    },
    servers: [
        {
            url: 'https://exam-nexus.deno.dev',
            description: 'default base',
        },
        {
            url: 'http://localhost:8001', // port refers to main.ts
            description: 'local dev base',
        }
    ],
    security: [{ BearerAuth: [] }], // lock each API by default in swagger UI
});

// Host OPENAPI Spec File on /docs
app.get("/docs", swaggerUI({ url: "/openapi.json" }));
