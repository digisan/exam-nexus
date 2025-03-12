import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { SupabaseAgent } from "../db/test.ts";
import { getPublicIP } from "../util/util.ts";

const app = new OpenAPIHono();
const sb_agent = new SupabaseAgent();

app.openapi(
    createRoute({
        method: "get",
        path: "/env",
        tags: ["_Test"],
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

app.openapi(
    createRoute({
        method: "post",
        path: "/sb_insert",
        tags: ["_Test"],
        security: [], // without swagger UI jwt security
        responses: {
            200: {
                description: "insert message to a supabase table",
                content: {
                    "text/plain": {
                        schema: z.string(),
                    },
                },
            },
        },
    }),
    async (c) => {
        await sb_agent.insertMessage("my test message");
        return c.text("insert test message to supabase table success");
    },
);

app.openapi(
    createRoute({
        method: "get",
        path: "/pub_ip",
        operationId: "getPublicIP",
        tags: ["_Test"],
        security: [], // without swagger UI jwt security
        summary: "本地公网 IP",
        description: "返回服务器的公网 IP 地址",
        responses: {
            200: {
                description: "成功获取公网 IP",
                content: {
                    "application/json": {
                        schema: z.object({
                            ip: z.string().ip(),
                        }),
                    },
                },
            },
        },
    }),
    async (c) => {
        return c.json({ ip: await getPublicIP() });
    },
);

export default app;
