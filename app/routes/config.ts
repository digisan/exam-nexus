import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { currentFilename } from "@util/util.ts";
import { createStrictT } from "@i18n/lang_t.ts";
import { app } from "@app/app.ts";
import { cc } from "@app/controllers/config.ts";
import { toValidConfig } from "@define/type.ts";

const route_app = new OpenAPIHono();

// /////////////////////////////////////////////////////////////////////////////////////

const UpdateConfigReqBody = z.object({
    email: z.string().email("Invalid email address"),
    region: z.string(),
    lang: z.string(),
});

route_app.openapi(
    createRoute(
        {
            method: "post",
            path: "/update",
            tags: ["Config"],
            // security: [], // without swagger UI jwt security
            request: {
                body: {
                    description: "Update Config Request Body",
                    content: {
                        "application/json": {
                            schema: UpdateConfigReqBody,
                            example: { // 添加测试参数输入
                                email: "email as id",
                                region: "au",
                                lang: "en-AU",
                            },
                        },
                    },
                },
            },
            responses: {
                201: {
                    description: "Update Config Successful",
                    content: {
                        "application/json": {
                            schema: z.object({
                                success: z.boolean().openapi({ example: true }),
                                message: z.string().openapi({ example: "config updated" }),
                            }),
                        },
                    },
                },
                400: {
                    description: "Bad Request",
                    content: {
                        "application/json": {
                            schema: z.object({
                                success: z.boolean().openapi({ example: false }),
                                message: z.string().openapi({ example: "config update failed" }),
                            }),
                        },
                    },
                },
                500: { description: "Internal Server Error" }, // 数据库异常, 邮件服务崩溃 等
            },
        } as const,
    ),
    async (c) => {
        const t = createStrictT(c)

        const cfg = await toValidConfig(c.req.valid("json"))
        if (!cfg) return c.json({ success: false, message: t('set.config.fail') }, 400)

        const result = await cc.setUserCfg(cfg);
        if (result.isErr()) return c.json({ success: false, message: t('set.config.err') }, 500)
        return c.json({ success: true, token: result.value, message: t('set.config.ok') }, 200)
    },
);

// /////////////////////////////////////////////////////////////////////////////////////

app.route(`/api/${currentFilename(import.meta.url, false)}`, route_app);
