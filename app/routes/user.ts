import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { currentFilename, some } from "@util/util.ts";
import { isEmail } from "@define/type.ts";
import { app } from "@app/app.ts";
import { uc } from "@app/controllers/userLocal.ts";
import { zodErrorHandler } from "@app/routes/handler/zod_err.ts";
import { createStrictT } from "@i18n/lang_t.ts";

const route_app = new OpenAPIHono({ defaultHook: zodErrorHandler });

// /////////////////////////////////////////////////////////////////////////////////////

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
                method: "get",
                path: "/list",
                tags: ["User"],
                // security: [{ BearerAuth: [] }],
                responses: {
                    200: {
                        description: "返回所有用户的 ID 列表",
                        content: {
                            "application/json": {
                                schema: RespSchema,
                            },
                        },
                    },
                    204: { description: "列表为空" },
                    401: { description: "Unauthorized" },
                    500: { description: "Internal Server Error" },
                },
            } as const,
        ),
        async (c) => {
            const t = createStrictT(c);
            const r = await uc.getUserList();
            if (r.isErr()) return c.text(`Internal Server Error`, 500);

            const data = r.value;
            return RespSchema.safeParse(data).success ? c.json(data, 200) : c.text(t(`resp.invalid`, { resp: data }), 500);
        },
    );
}

// ---------------------------------- //

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
                method: "get",
                path: "/{email}",
                tags: ["User"],
                // security: [{ BearerAuth: [] }],
                request: {
                    params: ReqSchema,
                },
                responses: {
                    200: {
                        description: "return user info",
                        content: {
                            "application/json": {
                                schema: RespSchema,
                            },
                        },
                    },
                    400: { description: "非法输入, email格式有误?" },
                    401: { description: "Unauthorized" },
                    404: { description: "用户 ID 未找到" },
                    500: { description: "Internal Server Error" },
                },
            } as const,
        ),
        async (c) => {
            const t = createStrictT(c);
            const email = c.req.param("email");
            if (!isEmail(email)) {
                return c.text("Email format error", 400);
            }
            const r = await uc.getUserInfo(email);
            if (r.isErr()) return c.text(`Internal Server Error`, 500);

            const data = r.value;
            if (!some(data)) return c.text("User not found", 404);
            return RespSchema.safeParse(data).success ? c.json(data, 200) : c.text(t(`resp.invalid`, { resp: data }), 500);
        },
    );
}

// /////////////////////////////////////////////////////////////////////////////////////

app.route(`/api/${currentFilename(import.meta.url, false)}`, route_app);
