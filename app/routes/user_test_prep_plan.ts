import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { currentFilename, some } from "@util/util.ts";
import { app } from "@app/app.ts";
import { zodErrorHandler } from "@app/routes/handler/zod_err.ts";
import { t400, t404, t500 } from "@app/routes/handler/resp.ts";
import { toIdSKey, toIdSKeyWithSKeyPart } from "@define/id.ts";
import { createStrictT } from "@i18n/lang_t.ts";
import { K, T } from "@define/system.ts";
import { areValidTestPrepPlans } from "@define/exam/type.ts";
import { uplc } from "../controllers/user_prep_plan.ts";
import { isValidRegion } from "@define/type.ts";
import type { RegionType } from "@define/config.ts";

const route_app = new OpenAPIHono({ defaultHook: zodErrorHandler });

{
    const ReqSchemaP = z.object({
        uid: z.string(),
    });
    const ReqSchemaB = z.array(z.record(z.union([z.string(), z.boolean()])));

    const RespSchema = z.object({
        success: z.boolean().openapi({ example: true }),
        message: z.string().openapi({ example: "update ok" }),
    });

    route_app.openapi(
        createRoute(
            {
                operationId: "USER_TEST_PREP_PLAN_SET",
                method: "post",
                path: "/update/{uid}",
                tags: ["UserTestPrepPlan"],
                security: [], // [{ BearerAuth: [] }],
                summary: "USER_TEST_PREP_PLAN_SET",
                description: "Set User Selected Test Preparation Plan",
                request: {
                    params: ReqSchemaP,
                    body: {
                        description: "Update Selected Test Preparation Plan Request Body",
                        content: {
                            "application/json": {
                                schema: ReqSchemaB,
                                example: [
                                    {
                                        tid: "vce.ma.1",
                                        test_date: "2025-09-30",
                                        test_venue: "SH Primary School",
                                    },
                                    {
                                        tid: "vce.ma.3",
                                        test_date: "2025-09-30T14:00:00+08:00",
                                        test_venue: "TL Primary School",
                                    },
                                ],
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: "Update Selected Test Preparation Plan Successful",
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

            const uid = c.req.param("uid") ?? "";
            const r_uid = await toIdSKey(uid, T.REGISTER);
            if (r_uid.isErr()) return t400(c, "id.invalid", { id: uid });

            const plans = c.req.valid("json");
            if (!areValidTestPrepPlans(plans)) return t400(c, "req.invalid", { req: plans });

            const r = await uplc.setTestPrepPlan(r_uid.value, ...plans);
            if (r.isErr()) return t500(c, "set.user_test_prep_plan.err");

            const data = { success: true, message: t("set.user_test_prep_plan.ok") };
            return RespSchema.safeParse(data).success ? c.json(data) : t500(c, "resp.invalid", { resp: data });
        },
    );
}

{
    const ReqSchema = z.object({
        uid: z.string(),
        tid: z.union([z.string(), z.array(z.string())]).optional(),
    });

    const RespSchema = z.array(z.record(z.union([z.string(), z.boolean()])));

    route_app.openapi(
        createRoute(
            {
                operationId: "USER_TEST_PREP_PLAN_GET",
                method: "get",
                path: "/get",
                tags: ["UserTestPrepPlan"],
                security: [], // [{ BearerAuth: [] }],
                summary: "USER_TEST_PREP_PLAN_GET",
                description: "Get User Selected Test Preparation Plan",
                request: {
                    query: ReqSchema,
                },
                responses: {
                    200: {
                        description: "Return User Selected Test Preparation Plan",
                        content: {
                            "application/json": {
                                schema: RespSchema,
                            },
                        },
                    },
                    400: { description: "Invalid id Param" },
                    401: { description: "Unauthorized" },
                    404: { description: "Cannot Find Selected Test By Its ID" },
                    500: { description: "Internal Server Error" },
                },
            } as const,
        ),
        async (c) => {
            const uid = c.req.query("uid") ?? "";
            const r_uid = await toIdSKeyWithSKeyPart(uid, T.REGISTER, T.TEST_PREP_PLAN, K.UID);
            if (r_uid.isErr()) return t400(c, "param.invalid", { param: uid });

            let tids = c.req.query("tid")?.split(",");
            if (!some(tids)) tids = (new URL(c.req.url)).searchParams.getAll("tid");
            if (!some(tids)) tids = [];

            const r = await uplc.getTestPrepPlan(r_uid.value, ...tids!);
            if (r.isErr()) return t500(c, "get.user_test_prep_plan.err");

            const data = r.value;
            return RespSchema.safeParse(data).success ? c.json(data) : t500(c, "resp.invalid", { resp: data });
        },
    );
}

{
    const ReqSchema = z.object({ uid: z.string(), rid: z.string().optional() });

    const RespSchema = z.array(z.string());

    route_app.openapi(
        createRoute(
            {
                operationId: "USER_TEST_PREP_PLAN_LIST",
                method: "get",
                path: "/list",
                tags: ["UserTestPrepPlan"],
                security: [], // [{ BearerAuth: [] }],
                summary: "USER_TEST_PREP_PLAN_LIST",
                description: "Get User Selected Test Preparation Plan List",
                request: {
                    query: ReqSchema,
                },
                responses: {
                    200: {
                        description: "Return User Selected Test Preparation Plan List",
                        content: {
                            "application/json": {
                                schema: RespSchema,
                            },
                        },
                    },
                    400: { description: "Invalid id Param" },
                    401: { description: "Unauthorized" },
                    404: { description: "Cannot Find Selected Test By its ID" },
                    500: { description: "Internal Server Error" },
                },
            } as const,
        ),
        async (c) => {
            const uid = c.req.query("uid") ?? "";
            const r_uid = await toIdSKey(uid, T.REGISTER);
            if (r_uid.isErr()) return t400(c, "param.invalid", { param: uid });

            const rid = c.req.query("rid") ?? "";
            if (rid && !isValidRegion(rid)) return t400(c, "param.invalid", { param: rid });

            const r = await uplc.getTestPrepPlanList(r_uid.value, rid as RegionType || undefined);
            if (r.isErr()) return t500(c, "get.user_test_prep_plan_list.err");

            const data = r.value;
            return RespSchema.safeParse(data).success ? c.json(data) : t500(c, "resp.invalid", { resp: data });
        },
    );
}

{
    const ReqSchema = z.object({
        uid: z.string(),
        tid: z.union([z.string(), z.array(z.string())]).optional(),
    });

    const RespSchema = z.object({
        success: z.boolean().openapi({ example: true }),
        message: z.string().openapi({ example: "[vce.ma.1, vce.ma.2]" }),
    });

    route_app.openapi(
        createRoute(
            {
                operationId: "USER_TEST_PREP_PLAN_DELETE",
                method: "delete",
                path: "/delete",
                tags: ["UserTestPrepPlan"],
                security: [], // [{ BearerAuth: [] }],
                summary: "USER_TEST_PREP_PLAN_DELETE",
                description: "Delete User Selected Test Preparation Plan",
                request: {
                    query: ReqSchema,
                },
                responses: {
                    200: {
                        description: "Delete User Selected Test Preparation Plan Successful",
                        content: {
                            "application/json": {
                                schema: RespSchema,
                            },
                        },
                    },
                    400: { description: "Invalid id param" },
                    401: { description: "Unauthorized" },
                    404: { description: "Cannot Find Selected Test By its ID" },
                    500: { description: "Internal Server Error" },
                },
            } as const,
        ),
        async (c) => {
            const uid = c.req.query("uid") ?? "";
            const r_uid = await toIdSKey(uid, T.REGISTER);
            if (r_uid.isErr()) return t400(c, "param.invalid", { param: uid });

            let tids = c.req.query("tid")?.split(",");
            if (!some(tids)) tids = (new URL(c.req.url)).searchParams.getAll("tid");
            if (!some(tids)) tids = [];

            const r = await uplc.deleteTestPrepPlan(r_uid.value, ...tids!);
            if (r.isErr()) return t500(c, "delete.user_test_prep_plan.err");

            const data = { success: true, message: `${r.value}` };
            return RespSchema.safeParse(data).success ? c.json(data) : t500(c, "resp.invalid", { resp: data });
        },
    );
}

app.route(`/api/${currentFilename(import.meta.url, false)}`, route_app);
