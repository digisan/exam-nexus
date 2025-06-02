import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { currentFilename, some } from "@util/util.ts";
import { toIdSKey } from "@define/id.ts";
import { app } from "@app/app.ts";
import { uc } from "@app/controllers/users.ts";
import { zodErrorHandler } from "@app/routes/handler/zod_err.ts";
import { n204, t400, t404, t500 } from "@app/routes/handler/resp.ts";
import { T } from "@define/system.ts";
import { createStrictT } from "@i18n/lang_t.ts";

const route_app = new OpenAPIHono({ defaultHook: zodErrorHandler });

{
    // const RespSchema = {
    //     userIds: z.array(z.string()).openapi({ example: ['123', '456'] }),
    // }
    const RespSchema = z.array(z.string()).openapi({
        example: ["id_1", "id_2"],
    });

    // 定义 API 路由，并关联 OpenAPI 规范
    route_app.openapi(
        createRoute(
            {
                operationId: "USER_LIST",
                method: "get",
                path: "/list",
                tags: ["User"],
                security: [], // without swagger UI lock
                summary: "USER_LIST",
                description: "List of user ID",
                responses: {
                    200: {
                        description: "Get list of user ID",
                        content: {
                            "application/json": {
                                schema: RespSchema,
                            },
                        },
                    },
                    204: { description: "Empty List" },
                    401: { description: "Unauthorized" },
                    500: { description: "Internal Server Error" },
                },
            } as const,
        ),
        async (c) => {
            const r = await uc.getUserList();
            if (r.isErr()) return t500(c, "fatal", { message: r.error });

            const data = r.value;
            if (!some(data)) return n204([]);
            return RespSchema.safeParse(data).success ? c.json(data) : t500(c, "resp.invalid", { resp: data });
        },
    );
}

{
    const ReqSchema = z.object({ id: z.string() });

    const RespSchema = z.object({
        email: z.string().email().openapi({ example: "user@gmail.com" }),
        // password: z.string().openapi({ example: "bcrypted...password..." }),
        registered_at: z.string().datetime().openapi({ example: "2025-05-27T00:15:30.833Z" }),
    });

    route_app.openapi(
        createRoute(
            {
                operationId: "USER_REG",
                method: "get",
                path: "/reg/{id}",
                tags: ["User"],
                security: [], // without swagger UI lock
                summary: "USER_REG",
                description: "Get a user's reg by its ID",
                request: {
                    params: ReqSchema,
                },
                responses: {
                    200: {
                        description: "return user registration successfully",
                        content: {
                            "application/json": {
                                schema: RespSchema,
                            },
                        },
                    },
                    400: { description: "Invalid request, id incorrect?" },
                    401: { description: "Unauthorized" },
                    404: { description: "Not Found User by ID" },
                    500: { description: "Internal Server Error" },
                },
            } as const,
        ),
        async (c) => {
            const t = createStrictT(c);
            const id = c.req.param("id") ?? "";

            const r_id = await toIdSKey(id, T.REGISTER);
            if (r_id.isErr()) return t400(c, "id.invalid", { id });

            const r = await uc.getUserReg(r_id.value);
            if (r.isErr()) return t500(c, "fatal", { message: r.error });

            const data = r.value;
            if (!some(data)) return t404(c, "get.user.not_found", { user: id });

            // remove 'password' field for return
            const { password: _, ...rest } = data as { password: string } & Record<string, unknown>;

            return RespSchema.safeParse(rest).success ? c.json(rest) : t500(c, "resp.invalid", { resp: rest });
        },
    );
}

app.route(`/api/${currentFilename(import.meta.url, false)}`, route_app);
