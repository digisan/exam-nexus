import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { currentFilename, sameStruct } from "@util/util.ts";
import { createStrictT } from "@i18n/lang_t.ts";
import { app } from "@app/app.ts";
import { cc } from "@app/controllers/config.ts";
import { toEmailKeyOnAll, toValidConfig } from "@define/type.ts";
import { T_REGISTER, T_USER_CONFIG } from "@define/system.ts";

const route_app = new OpenAPIHono();

// /////////////////////////////////////////////////////////////////////////////////////

const ConfigReq = {
    email: z.string().email("Invalid email address"),
    region: z.string(),
    lang: z.string(),
};

route_app.openapi(
    createRoute(
        {
            method: "post",
            path: "/update",
            tags: ["Config"],
            // security: [], // with swagger UI jwt security
            request: {
                body: {
                    description: "Update Config Request Body",
                    content: {
                        "application/json": {
                            schema: z.object(ConfigReq),
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
                200: {
                    description: "Update Config Successful",
                    content: {
                        "application/json": {
                            schema: z.object({
                                message: z.string().openapi({ example: "update ok" }),
                            }),
                        },
                    },
                },
                400: { description: "Bad Request" },
                401: { description: "Unauthorized" },
                500: { description: "Internal Server Error" }, // 数据库异常, 邮件服务崩溃 等
            },
        } as const,
    ),
    async (c) => {
        const t = createStrictT(c);

        const r_cfg = await toValidConfig(c.req.valid("json"));
        if (r_cfg.isErr()) return c.text(t("set.config.fail"), 400);

        const result = await cc.setUserCfg(r_cfg.value);
        if (result.isErr()) return c.text(t("set.config.err"), 500);
        return c.json({ message: t("set.config.ok") }, 200);
    },
);

// ---------------------------------- //

const ConfigResp = {
    email: z.string().email().openapi({ example: "user@email.com" }),
    region: z.string().openapi({ example: "au" }),
    lang: z.string().openapi({ example: "en-AU" }),
};

route_app.openapi(
    createRoute(
        {
            method: "get",
            path: "/{email}",
            tags: ["Config"],
            // security: [{ BearerAuth: [] }],
            request: {
                params: z.object(
                    { email: z.string().email() },
                ),
            },
            responses: {
                200: {
                    description: "return user config",
                    content: {
                        "application/json": {
                            schema: z.object(ConfigResp),
                        },
                    },
                },
                400: { description: "invalid email param" },
                401: { description: "Unauthorized" },
                404: { description: "Cannot find config by its ID" },
                500: { description: "Internal Server Error" },
            },
        } as const,
    ),
    async (c) => {
        const t = createStrictT(c);
        const email = c.req.param("email");
        const r = await toEmailKeyOnAll(email, t, T_REGISTER, T_USER_CONFIG);
        if (r.isErr()) return c.text(t("param.invalid", { param: email }), 400);

        const r_cfg = await cc.getUserCfg(r.value);
        if (r_cfg.isErr()) return c.text(t(`get.config.fail`), 404);

        if (!sameStruct(r_cfg.value!, ConfigResp, true)) return c.text(t(`get.config.err`), 500);

        return c.json(r_cfg.value, 200);
    },
);

// /////////////////////////////////////////////////////////////////////////////////////

app.route(`/api/${currentFilename(import.meta.url, false)}`, route_app);
