import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { currentFilename } from "@util/util.ts";
import { app } from "@app/app.ts";
import { zodErrorHandler } from "@app/routes/handler/zod_err.ts";
import { t400, t500 } from "@app/routes/handler/resp.ts";
import { isValidRegion } from "@define/type.ts";
import type { RegionType } from "@define/config.ts";
import * as examAu from "@define/exam/au.ts";
import * as examCn from "@define/exam/cn.ts";
import { getExamsAsJSON } from "@define/exam/util.ts";

const route_app = new OpenAPIHono({ defaultHook: zodErrorHandler });

// Get Exam Consts
{
    const ReqSchema = z.object({
        region: z.string(),
    });

    const dynInnerMap = z.record(z.array(z.string()));
    const RespSchema = z.object({
        selective: dynInnerMap,
        proficiency: dynInnerMap,
        certification: dynInnerMap,
        final: dynInnerMap,
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
                    headers: z.object({ "x-lang": z.string().optional() }), // translating test
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
        (c) => {
            const region = c.req.query("region") ?? "au";
            if (!isValidRegion(region)) return t400(c, "region.invalid", { region });
            try {
                // *** dynamic import cannot work on deploy environment! *** //
                // const mod = await import(`@define/exam/${region}.ts`);

                // *** so have to use static import *** //
                const examMods = [examAu, examCn] as const;
                const mRouteMod = new Map<RegionType, typeof examMods[number]>([
                    ["au", examAu],
                    ["cn", examCn],
                ]);
                const mod = mRouteMod.get(region)!;

                const data = getExamsAsJSON(mod.ExamCatMap);
                return RespSchema.safeParse(data).success ? c.json(data) : t500(c, "resp.invalid", { resp: data });
            } catch (err) {
                return t500(c, "catch", { error: err });
            }
        },
    );
}

app.route(`/api/${currentFilename(import.meta.url, false)}`, route_app);
