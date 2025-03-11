import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";

const app = new OpenAPIHono();

app.openapi(
    createRoute({
        method: "get",
        path: "/env",
        tags: ["Test"],
        security: [], // without swagger UI jwt security
        responses: {
            200: {
                description: "Test Environment Variables",
                content: {
                    "application/json": {
                        schema: z.object({
                            sb_url: z.string(),
                            sb_key: z.string(),
                        }),
                    },
                },
            },
        },
    }),
    (c) => {
        const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
        const SUPABASE_KEY = Deno.env.get("SUPABASE_KEY") ?? "";
        return c.json({ sb_url: SUPABASE_URL, sb_key: SUPABASE_KEY });
    },
);

export default app;
