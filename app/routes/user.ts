import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { currentFilename } from "@util/util.ts";
import { isEmail } from "@define/type.ts";
import { app } from "@app/app.ts";
import { uc } from "@app/controllers/userLocal.ts";

const route_app = new OpenAPIHono();

// /////////////////////////////////////////////////////////////////////////////////////

// const UserlistResp = {
//     userIds: z.array(z.string()).openapi({ example: ['123', '456'] }),
// }

const UserlistResp = z.array(z.string()).openapi({
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
                            schema: UserlistResp,
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
        const r = await uc.getUserList()
        if (r.isErr()) return c.text(`Internal Server Error`, 500)
        return c.json(r.value, 200);
    },
);

// ---------------------------------- //

const UserResp = {
    email: z.string().email().openapi({ example: "张三@EMAIL.COM" }),
    password: z.string().openapi({ example: "bcrypted...password..." }),
};

route_app.openapi(
    createRoute(
        {
            method: "get",
            path: "/{email}",
            tags: ["User"],
            // security: [{ BearerAuth: [] }],
            request: {
                params: z.object({ email: z.string().email() }),
            },
            responses: {
                200: {
                    description: "return user info",
                    content: {
                        "application/json": {
                            schema: z.object(UserResp),
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
        const email = c.req.param("email");
        if (!isEmail(email)) {
            return c.text("Email format error", 400);
        }
        const r = await uc.getUserInfo(email);
        if (r.isErr()) return c.text(`Internal Server Error`, 500)
        const user = r.value;
        return user ? c.json(user, 200) : c.text("User not found", 404);
    },
);

// /////////////////////////////////////////////////////////////////////////////////////

app.route(`/api/${currentFilename(import.meta.url, false)}`, route_app);
