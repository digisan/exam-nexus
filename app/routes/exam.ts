import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { currentFilename } from "@util/util.ts";
import { app } from "@app/app.ts";
import { zodErrorHandler } from "@app/routes/handler/zod_err.ts";
import { t400, t500 } from "@app/routes/handler/resp.ts";
import { isValidRegion } from "@define/type.ts";

const route_app = new OpenAPIHono({ defaultHook: zodErrorHandler });

// Get Exam Consts
{
    const ReqSchema = z.object({
        region: z.string(),
    });

    const RespSchema = z.object({
        categories: z.array(z.string()).openapi({ example: ["selective", "proficiency"] }),
    });

    route_app.openapi(
        createRoute(
            {
                operationId: "EXAM_CONSTS",
                method: "get",
                path: "/exam_consts",
                tags: ["Exam"],
                security: [],
                summary: "EXAM_CONSTS",
                description: "Get lists of exam const",
                request: {
                    query: ReqSchema,
                },
                responses: {
                    200: {
                        description: "Return list of all exam const",
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
        async (c) => {
            const region = c.req.query("region") ?? "au";
            if (!isValidRegion(region)) return t400(c, "region.invalid", { region });
            try {
                const data = {
                    categories: (await import(`@define/exam/${region}.ts`)).EXAM_CATEGORIES,
                };
                return RespSchema.safeParse(data).success ? c.json(data) : t500(c, "resp.invalid", { resp: data });
            } catch (err) {
                return t500(c, "catch", { error: err });
            }
        },
    );
}

app.route(`/api/${currentFilename(import.meta.url, false)}`, route_app);
