import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { currentFilename } from "@util/util.ts";
import { createStrictT } from "@i18n/lang_t.ts";
import { app } from "@app/app.ts";
import { cc } from "@app/controllers/config.ts";
import { toEmailKeyOnAll, toValidConfig } from "@define/type.ts";
import { T_REGISTER, T_USER_CONFIG } from "@define/system.ts";
import { zodErrorHandler } from "@app/routes/handler/zod_err.ts";
import { LANGUAGES, REGIONS } from "@define/config.ts";
import { t400, t404, t500 } from "@app/routes/handler/resp.ts";

const route_app = new OpenAPIHono({ defaultHook: zodErrorHandler });

// Get System Const Config
{
    const RespSchema = z.object({
        regions: z.array(z.string()).openapi({ example: ["cn", "au"] }),
        languages: z.array(z.string()).openapi({ example: ["zh-CN", "en-AU"] }),
    });

    route_app.openapi(
        createRoute(
            {
                method: "get",
                path: "/const_list",
                tags: ["Config"],
                // security: [{ BearerAuth: [] }],
                responses: {
                    200: {
                        description: "Return list of all CONST config",
                        content: {
                            "application/json": {
                                schema: RespSchema,
                            },
                        },
                    },
                    401: { description: "Unauthorized" },
                    500: { description: "Internal Server Error" },
                },
            } as const,
        ),
        (c) => {
            const data = { regions: REGIONS, languages: LANGUAGES };
            return RespSchema.safeParse(data).success ? c.json(data) : t500(c, "resp.invalid", { resp: data });
        },
    );
}

// Update User Config
{
    const ReqSchema = z.object({
        email: z.string().email("Invalid email address"),
        region: z.string(),
        lang: z.string(),
    });

    const RespSchema = z.object({
        success: z.boolean().openapi({ example: true }),
        message: z.string().openapi({ example: "update ok" }),
    });

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
                                schema: ReqSchema,
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
                                schema: RespSchema,
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
            if (r_cfg.isErr()) return t400(c, "set.config.fail");

            const result = await cc.setUserCfg(r_cfg.value);
            if (result.isErr()) return t500(c, "set.config.err");

            const data = { success: true, message: t("set.config.ok") };
            return RespSchema.safeParse(data).success ? c.json(data) : t500(c, "resp.invalid", { resp: data });
        },
    );
}

// Get User Config
{
    const ReqSchema = z.object({
        email: z.string().email(),
    });

    const RespSchema = z.object({
        email: z.string().email().openapi({ example: "user@email.com" }),
        region: z.string().openapi({ example: "au" }),
        lang: z.string().openapi({ example: "en-AU" }),
    });

    route_app.openapi(
        createRoute(
            {
                method: "get",
                path: "/{email}",
                tags: ["Config"],
                // security: [{ BearerAuth: [] }],
                request: {
                    params: ReqSchema,
                },
                responses: {
                    200: {
                        description: "return user config",
                        content: {
                            "application/json": {
                                schema: RespSchema,
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
            if (r.isErr()) return t400(c, "param.invalid", { param: email });

            const r_cfg = await cc.getUserCfg(r.value);
            if (r_cfg.isErr()) return t404(c, "get.config.fail");

            const data = r_cfg.value;
            return RespSchema.safeParse(data).success ? c.json(data) : t500(c, "resp.invalid", { resp: data });
        },
    );
}

app.route(`/api/${currentFilename(import.meta.url, false)}`, route_app);
