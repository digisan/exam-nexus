import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { currentFilename } from "@util/util.ts";
import { app } from "@app/app.ts";
import { zodErrorHandler } from "@app/routes/handler/zod_err.ts";
import { EXAM_CATEGORIES, LANGUAGES, REGIONS } from "@define/config.ts";
import { t400, t404, t500 } from "@app/routes/handler/resp.ts";

const route_app = new OpenAPIHono({ defaultHook: zodErrorHandler });

// Get System Consts
{
    const RespSchema = z.object({
        regions: z.array(z.string()).openapi({ example: ["cn", "au"] }),
        languages: z.array(z.string()).openapi({ example: ["zh-CN", "en-AU"] }),
        exam_categories: z.array(z.string()).openapi({ example: ["selective", "proficiency"] }),
    });

    route_app.openapi(
        createRoute(
            {
                operationId: "SYS_CONSTS",
                method: "get",
                path: "/const_list",
                tags: ["System"],
                security: [],
                summary: "SYS_CONSTS",
                description: "Get lists of const in system",
                responses: {
                    200: {
                        description: "Return list of all const",
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
            const data = { regions: REGIONS, languages: LANGUAGES, exam_categories: EXAM_CATEGORIES };
            return RespSchema.safeParse(data).success ? c.json(data) : t500(c, "resp.invalid", { resp: data });
        },
    );
}

app.route(`/api/${currentFilename(import.meta.url, false)}`, route_app);
