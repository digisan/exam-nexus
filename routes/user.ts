import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { UserController } from "@controllers/userController.ts";

const app = new OpenAPIHono();
const userCtrl = new UserController();

// const UserIdListSchema = z.object({
//     userIds: z.array(z.string()).openapi({ example: ['123', '456'] }),
// })

const UserIdListSchema = z.array(z.string()).openapi({
    example: ["123", "456"],
});

// 定义 API 路由，并关联 OpenAPI 规范
app.openapi(
    createRoute({
        method: "get",
        path: "/",
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
            401: { description: "未授权(JWT 令牌无效或缺失)" },
        },
    }),
    (c: any) => {
        return c.json(userCtrl.getUserList());
    },
);

const UserSchema = z.object({
    username: z.string().openapi({ example: "张三" }),
    email: z.string().email().openapi({ example: "张三@EMAIL.COM" }),
});

app.openapi(
    createRoute({
        method: "get",
        path: "/{username}",
        tags: ["User"],
        // security: [{ BearerAuth: [] }],
        request: {
            params: z.object({ username: z.string() }),
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
            401: { description: "未授权(JWT 令牌无效或缺失)" },
            404: { description: "用户 ID 未找到" },
        },
    }),
    (c: any) => {
        const username = c.req.param("username");
        const user = userCtrl.getUserInfo(username);
        return user ? c.json(user) : c.text("User not found", 404);
    },
);

export default app;
