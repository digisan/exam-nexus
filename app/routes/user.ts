import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { currentFilename, some } from "@util/util.ts";
import { isEmail } from "@define/type.ts";
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
        example: ["email_1", "email_2"],
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
                description: "List of user ID(email)",
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
    const ReqSchema = z.object({
        email: z.string().email(),
    });

    const RespSchema = z.object({
        email: z.string().email().openapi({ example: "张三@EMAIL.COM" }),
        password: z.string().openapi({ example: "bcrypted...password..." }),
    });

    route_app.openapi(
        createRoute(
            {
                operationId: "USER_REG",
                method: "get",
                path: "/reg/{email}",
                tags: ["User"],
                security: [], // without swagger UI lock
                summary: "USER_REG",
                description: "Get a user's reg by its ID(email)",
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
                    400: { description: "Invalid request, email incorrect?" },
                    401: { description: "Unauthorized" },
                    404: { description: "Not Found User by ID(email)" },
                    500: { description: "Internal Server Error" },
                },
            } as const,
        ),
        async (c) => {
            const email = c.req.param("email");
            if (!isEmail(email)) return t400(c, "email.invalid");
            const r = await uc.getUserReg(email);
            if (r.isErr()) return t500(c, "fatal", { message: r.error });

            const data = r.value;
            if (!some(data)) return t404(c, "get.user.not_found", { user: email });
            return RespSchema.safeParse(data).success ? c.json(data) : t500(c, "resp.invalid", { resp: data });
        },
    );
}

app.route(`/api/${currentFilename(import.meta.url, false)}`, route_app);
