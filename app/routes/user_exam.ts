import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { currentFilename } from "@util/util.ts";
import { app } from "@app/app.ts";
import { zodErrorHandler } from "@app/routes/handler/zod_err.ts";
import { t400, t500 } from "@app/routes/handler/resp.ts";
import { toEmailKey } from "@define/type.ts";
import { createStrictT } from "@i18n/lang_t.ts";
import { uec } from "@app/controllers/user_exam.ts";

const route_app = new OpenAPIHono({ defaultHook: zodErrorHandler });

// Update User Exam Tests Selection
{
    const ReqSchemaQ = z.object({ email: z.string() });
    const ReqSchemaB = z.record(z.array(z.string()));

    const RespSchema = z.object({
        success: z.boolean().openapi({ example: true }),
        message: z.string().openapi({ example: "update ok" }),
    });

    route_app.openapi(
        createRoute(
            {
                operationId: "USER_EXAM_SET",
                method: "post",
                path: "/update",
                tags: ["UserExam"],
                // security: [{ BearerAuth: [] }],
                security: [],
                summary: "USER_EXAM_SET",
                description: "Set user's selected exam",
                request: {
                    query: ReqSchemaQ,
                    body: {
                        description: "Update Selection Exam Request Body",
                        content: {
                            "application/json": {
                                schema: ReqSchemaB,
                                example: { // 添加测试参数输入
                                    vce: ["vce.ma.1", "vce.ma.2"],
                                    naplan: ["naplan.w.y5"],
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: "Update User's Selection Exam Successful",
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

            const email = c.req.query("email") ?? "";
            const r_ek = await toEmailKey(email, "register", t)
            if (r_ek.isErr()) return t400(c, "email.invalid", { email });

            const tests = c.req.valid("json");
            const result = await uec.setUserExam(r_ek.value, tests)
            if (result.isErr()) return t500(c, "set.user_exam.err");

            const data = { success: true, message: t("set.user_exam.ok") };
            return RespSchema.safeParse(data).success ? c.json(data) : t500(c, "resp.invalid", { resp: data });
        },
    );
}

app.route(`/api/${currentFilename(import.meta.url, false)}`, route_app);
