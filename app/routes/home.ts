import { createRoute, z } from "@hono/zod-openapi";
import { app } from "@app/app.ts";

// Example for api with doc
//
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
    (c) => c.text("HELLO EXAM-NEXUS"), // exception for return OK as text!
);
