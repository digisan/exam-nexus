import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { getConnInfo } from 'hono/deno'
import { fromFileUrl } from "jsr:@std/path";
import { dbAgent as agent } from "@db/dbService.ts";
import { getPublicIP } from "@util/net.ts";
import { T_TEST } from "@define/system.ts";
import { isValidId } from "@define/type.ts";
import { app } from "@app/app.ts";
import { env_get } from "@define/env.ts";

const route_app = new OpenAPIHono();

// /////////////////////////////////////////////////////////////////////////////////////

route_app.openapi(
    createRoute(
        {
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
        } as const,
    ),
    (c) => {
        const SUPABASE_URL = env_get("SUPABASE_URL") ?? "";
        const SUPABASE_KEY = env_get("SUPABASE_KEY") ?? "";
        return c.json({ sb_url: SUPABASE_URL, sb_key: SUPABASE_KEY });
    },
);

// ---------------------------------- //

route_app.openapi(
    createRoute(
        {
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
                400: {
                    description: "invalid insert id for inserting table",
                    content: {
                        "text/plain": {
                            schema: z.string(),
                        },
                    },
                },
            },
        } as const,
    ),
    async (c) => {
        const id = "test_id"
        if (!isValidId(id)) return c.text(`${id} error`, 400)
        await agent.insertDataRow(T_TEST, id, { msg: "my test message" });
        return c.text("insert test message to supabase table success");
    },
);

// ---------------------------------- //

route_app.openapi(
    createRoute(
        {
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
        } as const,
    ),
    async (c) => {
        return c.json({ ip: await getPublicIP() });
    },
);

// ---------------------------------- //

route_app.openapi(
    createRoute(
        {
            method: "get",
            path: "/client_ip",
            operationId: "getClientAccessIP",
            tags: ["_Test"],
            security: [], // without swagger UI jwt security
            summary: "访问者IP",
            description: "返回访问者的公网 IP 地址",
            responses: {
                200: {
                    description: "成功获取访问者 IP",
                    content: {
                        "application/json": {
                            schema: z.object({
                                ip: z.string().ip(),
                            }),
                        },
                    },
                },
            },
        } as const,
    ),
    (c) => {
        const info = getConnInfo(c)
        return c.json({ ip: info.remote.address ?? "" });
    },
);

// ///////////////////////////////////////////////////////////////////////////////////

const fullPath = fromFileUrl(import.meta.url);
const parts = fullPath.split(/[\\/]/); // 兼容 Windows 和 Unix
const filenameWithExt = parts.pop();
const filename = filenameWithExt?.replace(/\.[^/.]+$/, '');

app.route(`/api/${filename}`, route_app);