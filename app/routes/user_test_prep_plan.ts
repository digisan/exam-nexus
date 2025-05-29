import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { currentFilename } from "@util/util.ts";
import { app } from "@app/app.ts";
import { zodErrorHandler } from "@app/routes/handler/zod_err.ts";
import { t400, t404, t500 } from "@app/routes/handler/resp.ts";
import { toIdMKey, toIdSKey, toIdSKeyPart, toIdSKeyWithSKeyPart } from "@define/id.ts";
import { createStrictT } from "@i18n/lang_t.ts";
import { K, T } from "@define/system.ts";
import { isValidTestPrepPlan } from "@define/exam/type.ts";
import { uplc } from "../controllers/user_prep_plan.ts";

const route_app = new OpenAPIHono({ defaultHook: zodErrorHandler });

{
    const ReqSchemaQ = z.object({ uid: z.string() });
    const ReqSchemaB = z.record(z.string());

    const RespSchema = z.object({
        success: z.boolean().openapi({ example: true }),
        message: z.string().openapi({ example: "update ok" }),
    });

    route_app.openapi(
        createRoute(
            {
                operationId: "USER_TEST_PREP_PLAN_SET",
                method: "post",
                path: "/update",
                tags: ["UserTestPrepPlan"],
                // security: [{ BearerAuth: [] }],
                security: [], // for testing
                summary: "USER_TEST_PREP_PLAN_SET",
                description: "Set user's selected test's preparation plan",
                request: {
                    query: ReqSchemaQ,
                    body: {
                        description: "Update Selected Test's Preparation Plan Request Body",
                        content: {
                            "application/json": {
                                schema: ReqSchemaB,
                                example: { // 添加测试参数输入
                                    tid: "vce.ma.1",
                                    test_start: "2025-05-30T14:00:00+08:00",
                                    test_venue: "TBA",
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: "Update Selected Test's Preparation Plan Successful",
                        content: {
                            "application/json": {
                                schema: RespSchema,
                            },
                        },
                    },
                    400: { description: "Bad Request" },
                    401: { description: "Unauthorized" },
                    500: { description: "Internal Server Error" },
                },
            } as const,
        ),
        async (c) => {
            const t = createStrictT(c);

            const uid = c.req.query("uid") ?? "";
            const r_uid = await toIdSKey(uid, T.REGISTER, t);
            if (r_uid.isErr()) return t400(c, "id.invalid", { id: uid });

            // const uid = c.req.query("uid") ?? "";
            // const r_uid = await toIdSKeyWithSKeyPart(uid, T.REGISTER, T.TEST_PREP_PLAN, K.UID, t);
            // if (r_uid.isErr()) return t400(c, "id.invalid", { id: uid });

            // const tid = c.req.query("tid") ?? "";
            // const r_tid = await toIdSKeyPart(tid, T.TEST_PREP_PLAN, K.TID, t);
            // if (r_tid.isErr()) return t400(c, "id.invalid", { id: tid });

            const plan = c.req.valid("json");

            console.log(`${JSON.stringify(plan, null, 4)}`);

            if (!isValidTestPrepPlan(plan)) return t400(c, "req.invalid", { req: plan });

            const r = await uplc.setTestPrepPlan(r_uid.value, plan);
            if (r.isErr()) return t500(c, "set.user_test_prep_plan.err");

            const data = { success: true, message: t("set.user_test_prep_plan.ok") };
            return RespSchema.safeParse(data).success ? c.json(data) : t500(c, "resp.invalid", { resp: data });
        },
    );
}

{
}

app.route(`/api/${currentFilename(import.meta.url, false)}`, route_app);
