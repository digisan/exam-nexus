import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { currentFilename } from "@util/util.ts";
import { app } from "@app/app.ts";
import { zodErrorHandler } from "@app/routes/handler/zod_err.ts";
import { t400, t404, t500 } from "@app/routes/handler/resp.ts";
import { toIdSKey } from "@define/id.ts";
import { createStrictT } from "@i18n/lang_t.ts";
import { uec } from "@app/controllers/user_exam.ts";
import { T } from "@define/system.ts";
import { isValidExamSelection } from "@define/exam/type.ts";
import { isValidRegion } from "@define/type.ts";

const route_app = new OpenAPIHono({ defaultHook: zodErrorHandler });

// Update User Exam Tests Selection
{
    const ReqSchemaP = z.object({ uid: z.string(), region: z.string() });
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
                path: "/update/{uid}/{region}",
                tags: ["UserExam"],
                security: [], // [{ BearerAuth: [] }],
                summary: "USER_EXAM_SET",
                description: "Set user's selected exam",
                request: {
                    params: ReqSchemaP,
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
                        description: "Update User Selection Exam Successful",
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

            const uid = c.req.param("uid") ?? "";
            const r_uid = await toIdSKey(uid, T.REGISTER);
            if (r_uid.isErr()) return t400(c, "id.invalid", { id: uid });

            const region = c.req.param("region") ?? "";
            if (!isValidRegion(region)) return t400(c, "id.invalid", { id: region });

            const tests = c.req.valid("json");
            if (!isValidExamSelection(tests)) return t400(c, "req.invalid", { req: tests });

            const result = await uec.setUserExam(r_uid.value, region, tests);
            if (result.isErr()) return t500(c, "set.user_exam.err");

            const data = { success: true, message: t("set.user_exam.ok") };
            return RespSchema.safeParse(data).success ? c.json(data) : t500(c, "resp.invalid", { resp: data });
        },
    );
}

{
    const ReqSchema = z.object({ uid: z.string(), region: z.string() });

    const RespSchema = z.record(z.array(z.string()));

    route_app.openapi(
        createRoute(
            {
                operationId: "USER_EXAM_GET",
                method: "get",
                path: "/selection",
                tags: ["UserExam"],
                security: [], // [{ BearerAuth: [] }],
                summary: "USER_EXAM_GET",
                description: "Get user's selected exam",
                request: {
                    query: ReqSchema,
                },
                responses: {
                    200: {
                        description: "return user selected exam",
                        content: {
                            "application/json": {
                                schema: RespSchema,
                            },
                        },
                    },
                    400: { description: "invalid id param" },
                    401: { description: "Unauthorized" },
                    404: { description: "Cannot find selected exam by its ID" },
                    500: { description: "Internal Server Error" },
                },
            } as const,
        ),
        async (c) => {
            const uid = c.req.query("uid") ?? "";
            const region = c.req.query("region") ?? "";

            const r_uid = await toIdSKey(uid, T.REGISTER);
            if (r_uid.isErr()) return t400(c, "param.invalid", { param: uid });

            if (!isValidRegion(region)) return t400(c, "param.invalid", { param: region });

            const result = await uec.getUserExam(r_uid.value, region);
            if (result.isErr()) return t404(c, "get.user_exam.fail");

            const data = result.value;
            return RespSchema.safeParse(data).success ? c.json(data) : t500(c, "resp.invalid", { resp: data });
        },
    );
}

{
    // delete user exam ...
}

app.route(`/api/${currentFilename(import.meta.url, false)}`, route_app);
