import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { getConnInfo } from "hono/deno";
import { currentFilename } from "@util/util.ts";
import { dbAgent as agent } from "@db/dbService.ts";
import { getPublicIP } from "@util/net.ts";
import { T_TEST } from "@define/system.ts";
import { isValidId } from "@define/id.ts";
import { app } from "@app/app.ts";
import { env_get } from "@define/env.ts";
import { zodErrorHandler } from "@app/routes/handler/zod_err.ts";
import { t200, t400 } from "./handler/resp.ts";

const route_app = new OpenAPIHono({ defaultHook: zodErrorHandler });

{
    route_app.openapi(
        createRoute(
            {
                operationId: "ENVVAR",
                method: "get",
                path: "/env",
                tags: ["_Test"],
                security: [], // without swagger UI lock
                summary: "ENVVAR",
                description: "Get environment variables",
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
}

{
    route_app.openapi(
        createRoute(
            {
                operationId: "INSERT_SB_TEST",
                method: "post",
                path: "/sb_insert",
                tags: ["_Test"],
                security: [], // without swagger UI lock
                summary: "INSERT_SB_TEST",
                description: "Insert data to supabase",
                responses: {
                    200: {
                        description: "insert test data to a supabase table",
                        content: {
                            "text/plain": {
                                schema: z.string(),
                            },
                        },
                    },
                    400: { description: "invalid insert id for inserting table" },
                },
            } as const,
        ),
        async (c) => {
            const id = "test_id";
            if (!isValidId(id)) return t400(c, "id.invalid");
            await agent.insertDataRow(T_TEST, id, { msg: "my test message" });
            return t200(c, "success", { message: "insert test message to supabase table success" });
        },
    );
}

{
    route_app.openapi(
        createRoute(
            {
                operationId: "SERVER_IP",
                method: "get",
                path: "/pub_ip",
                tags: ["_Test"],
                security: [], // without swagger UI lock
                summary: "SERVER_IP",
                description: "Server public IP",
                responses: {
                    200: {
                        description: "Get IP successfully",
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
}

{
    route_app.openapi(
        createRoute(
            {
                operationId: "CLIENT_PUB_IP",
                method: "get",
                path: "/client_ip",
                tags: ["_Test"],
                security: [], // without swagger UI lock
                summary: "CLIENT_PUB_IP",
                description: "Client public IP",
                responses: {
                    200: {
                        description: "Get IP successfully",
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
            const info = getConnInfo(c);
            return c.json({ ip: info.remote.address ?? "" });
        },
    );
}

{
    route_app.openapi(
        createRoute(
            {
                operationId: "I18N_TEST",
                method: "get",
                path: "/translate",
                tags: ["_Test"],
                security: [], // without swagger UI lock
                summary: "I18N_TEST",
                description: "translate & template test",
                request: {
                    query: z.object({ lang: z.string().optional() }),
                    headers: z.object({ "x-lang": z.string().optional() }),
                    cookies: z.object({ locale: z.string().optional() }),
                },
                responses: {
                    200: { description: "translate template test" },
                },
            } as const,
        ),
        (c) => {
            return t200(c, "test", { message: `this is my test message` }); // exception for return OK as text!
        },
    );
}

app.route(`/api/${currentFilename(import.meta.url, false)}`, route_app);
