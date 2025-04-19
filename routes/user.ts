import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { UserController } from "@controllers/user.ts";
import { isEmail } from "@util/util.ts";

const app = new OpenAPIHono();
const userCtrl = new UserController();

// const UserIdListSchema = z.object({
//     userIds: z.array(z.string()).openapi({ example: ['123', '456'] }),
// })

const UserIdListSchema = z.array(z.string()).openapi({
    example: ["email_1", "email_2"],
});

// 定义 API 路由，并关联 OpenAPI 规范
app.openapi(
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
                            schema: UserIdListSchema,
                        },
                    },
                },
                204: { description: "列表为空" },
                401: { description: "未授权(JWT 令牌无效,缺失或失效)" },
            },
        } as const,
    ),
    async (c) => {
        return c.json(await userCtrl.getUserList());
    },
);

const UserSchema = z.object({
    email: z.string().email().openapi({ example: "张三@EMAIL.COM" }),
    password: z.string().openapi({ example: "bcrypted...password..." }),
});

app.openapi(
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
                    description: "返回所有用户的 ID 列表",
                    content: {
                        "application/json": {
                            schema: UserSchema,
                        },
                    },
                },
                400: { description: "非法输入, email格式有误?" },
                401: { description: "未授权(JWT 令牌无效,缺失或失效)" },
                404: { description: "用户 ID 未找到" },
            },
        } as const,
    ),
    async (c) => {
        const email = c.req.param("email");
        if (!isEmail(email)) {
            return c.text("Email format error", 400)
        }
        const user = await userCtrl.getUserInfo(email);
        return user ? c.json(user) : c.text("User not found", 404);
    },
);

export default app;
