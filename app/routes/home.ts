import { createRoute, z } from "@hono/zod-openapi";
import { app } from "@app/app.ts";
import { createStrictT } from "@i18n/lang_t.ts";

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
                method: "get",
                path: "/",
                summary: "Root API",
                description: "hello exam-nexus",
                tags: ["Root"],
                security: [], // without swagger UI jwt security
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
            return RespSchema.safeParse(data).success ? c.json(data, 200) : c.text(t(`resp.invalid`, { resp: data }), 500);
        },
    );
}
