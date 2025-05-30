import { toIdSKey, toIdSKeyWithSKeyPart } from "@define/id.ts";
import { uplc } from "./user_prep_plan.ts";
import { K, T } from "@define/system.ts";
import { printResult } from "@util/log.ts";
import { isValidTestPrepPlan } from "@define/exam/type.ts";
import { err } from "neverthrow";

Deno.test("setTestPrepPlan", async () => {
    {
        const uid = "cdutwhu@yeah.net";
        const plan = {
            tid: "vce.ma.1",
            test_start: "2025-05-31T14:00:00+08:00",
            test_venue: "TBA",
        };

        const r_uid = await toIdSKey(uid, T.REGISTER);
        if (r_uid.isErr()) {
            printResult(r_uid, true);
            return;
        }
        if (!isValidTestPrepPlan(plan)) {
            printResult(err(`${JSON.stringify(plan)} is invalid`), true);
            return;
        }

        const r = await uplc.setTestPrepPlan(r_uid.value, plan);
        printResult(r, true);
    }
    {
        const uid = "cdutwhu@yeah.net";
        const plan = {
            tid: "vce.en.1",
            test_start: "2025-05-30T14:00:00+08:00",
            test_venue: "TBA",
        };

        const r_uid = await toIdSKey(uid, T.REGISTER);
        if (r_uid.isErr()) {
            printResult(r_uid, true);
            return;
        }
        if (!isValidTestPrepPlan(plan)) {
            printResult(err(`${JSON.stringify(plan)} is invalid`), true);
            return;
        }

        const r = await uplc.setTestPrepPlan(r_uid.value, plan);
        printResult(r, true);
    }
});

Deno.test("getTestPrepPlanList", async () => {
    const uid = "cdutwhu@yeah.net";
    const r = await toIdSKey(uid, T.REGISTER);
    if (r.isErr()) {
        printResult(err(`${uid} is invalid`));
        return;
    }
    const r1 = await uplc.getTestPrepPlanList(r.value);
    printResult(r1, true);
});

Deno.test("getTestPrepPlan", async () => {
    {
        const uid = "cdutwhu@yeah.net";
        const r = await toIdSKeyWithSKeyPart(uid, T.REGISTER, T.TEST_PREP_PLAN, K.UID);
        if (r.isErr()) {
            printResult(err(`${uid} is invalid`));
            return;
        }
        const tid = "vce.en.1";
        const r2 = await uplc.getTestPrepPlan(r.value, tid);
        printResult(r2, true);
    }
});

Deno.test("deleteTestPrepPlan", async () => {
    const uid = "cdutwhu@yeah.net";
    const r = await toIdSKey(uid, T.REGISTER);
    if (r.isErr()) {
        printResult(r, true);
        return;
    }
    const tid = "vce.ma.1";
    const r1 = await uplc.deleteTestPrepPlan(r.value, tid);
    printResult(r1, true);
});
