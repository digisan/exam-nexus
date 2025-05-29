import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { currentFilename, some } from "@util/util.ts";
import { isValidId } from "@define/id.ts";
import { app } from "@app/app.ts";
import { uc } from "@app/controllers/local/userLocal.ts";
import { zodErrorHandler } from "@app/routes/handler/zod_err.ts";
import { n204, t400, t404, t500 } from "@app/routes/handler/resp.ts";

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
            const r = await uc.getUserList("./data/users.json");
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
        id: z.string().openapi({ example: "张三@gmail.COM" }),
        email: z.string().email().openapi({ example: "张三@gmail.COM" }),
        password: z.string().openapi({ example: "bcrypted...password..." }),
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
            const id = c.req.param("id") ?? "";
            if (!isValidId(id)) return t400(c, "id.invalid");
            const r = await uc.getUserReg("./data/users.json", id);
            if (r.isErr()) return t500(c, "fatal", { message: r.error });

            const data = r.value;
            if (!some(data)) return t404(c, "get.user.not_found", { user: id });
            return RespSchema.safeParse(data).success ? c.json(data) : t500(c, "resp.invalid", { resp: data });
        },
    );
}

app.route(`/api/${currentFilename(import.meta.url, false)}`, route_app);
