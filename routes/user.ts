import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { UserController } from "../controllers/userController.ts";

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
    (c) => {
        return c.json(userCtrl.getUserList());
    },
);

const UserSchema = z.object({
    id: z.string().openapi({ example: "123" }),
    name: z.string().openapi({ example: "张三" }),
});

app.openapi(
    createRoute({
        method: "get",
        path: "/{id}",
        tags: ["User"],
        // security: [{ BearerAuth: [] }],
        request: {
            params: z.object({ id: z.string() }),
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
    (c) => {
        const id = c.req.param("id");
        const user = userCtrl.getUserDetails(id);
        return user ? c.json(user) : c.text("User not found", 404);
    },
);

export default app;
