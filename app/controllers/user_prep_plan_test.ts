import { toIdKey } from "@define/id.ts";
import { uplc } from "./user_prep_plan.ts";
import { T } from "@define/system.ts";
import { printResult } from "@util/log.ts";
import { isEmail } from "@define/type.ts";
import { isValidTestPrepPlan } from "@define/exam/type.ts";
import { err } from "neverthrow";

Deno.test("setTestPrepPlan", async () => {
    {
        const uid = "cdutwhu@yeah.net";
        const plan = {
            tid: "vce.ma.1",
            test_start: new Date("2025-05-31T14:00:00+08:00"),
        };

        const r_uid = await toIdKey(uid, T.REGISTER);
        if (r_uid.isErr() || !isEmail(r_uid.value)) {
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
            test_start: new Date("2025-05-30T14:00:00+08:00"),
        };

        const r_uid = await toIdKey(uid, T.REGISTER);
        if (r_uid.isErr() || !isEmail(r_uid.value)) {
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

Deno.test("getTestPrepPlan", async () => {
});

Deno.test("deleteTestPrepPlan", async () => {
});
