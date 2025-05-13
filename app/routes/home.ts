import { createRoute, z } from "@hono/zod-openapi";
import { app } from "@app/app.ts";
import { createStrictT } from "@i18n/lang_t.ts";
import { t500 } from "@app/routes/handler/resp.ts";

// Example homepage for api with doc
//
{
    const RespSchema = z.object({
        success: z.boolean().openapi({ example: true }),
        message: z.string().openapi({ example: "hello exam-nexus" }),
    });

    app.openapi(
        createRoute(
            {
                operationId: "ROOT",
                method: "get",
                path: "/",
                summary: "ROOT",
                description: "HELLO Exam-Nexus",
                tags: ["Root"],
                security: [], // without swagger UI lock
                responses: {
                    200: {
                        description: "HomePage 'hello exam-nexus'",
                        content: {
                            "application/json": {
                                schema: RespSchema,
                            },
                        },
                    },
                    500: { description: "Internal Server Error" },
                },
            } as const,
        ),
        (c) => {
            const t = createStrictT(c);
            const data = { success: true, message: t(`welcome`) };
            return RespSchema.safeParse(data).success ? c.json(data) : t500(c, "resp.invalid", { resp: data });
        },
    );
}
