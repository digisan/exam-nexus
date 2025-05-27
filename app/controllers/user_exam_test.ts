import { uec } from "@app/controllers/user_exam.ts";
import { toIdKey, toIdMultiKey } from "@define/id.ts";
import { T } from "@define/system.ts";
import { isEmail } from "@define/type.ts";
import { printResult } from "@util/log.ts";

Deno.test("setUserExam", async () => {
    const s = "cdutwhu@yeah.net";
    const r_ek = await toIdKey(s, T.REGISTER);
    if (r_ek.isErr() || !isEmail(r_ek.value)) {
        printResult(r_ek, true, `${s} is NOT valid email or NOT registered`);
        return;
    }
    const r = await uec.setUserExam(r_ek.value, { "vce": ["vce.1", "vce.2"], "naplan": ["naplan.1"] });
    if (r.isErr()) {
        printResult(r, true, `setUserExam error ` + r.error);
        return;
    }
    console.log(r.value);
});

Deno.test("getUserExam", async () => {
    const s = "cdutwhu@yeah.net";
    const r = await toIdMultiKey(s, [T.REGISTER, T.USER_EXAM]);
    if (r.isErr() || !isEmail(r.value)) {
        printResult(r, true, `${s} is NOT both valid key for '${T.REGISTER}' & '${T.USER_EXAM}'`);
        return;
    }
    const r1 = await uec.getUserExam(r.value);
    printResult(r1, true);
});

Deno.test("deleteUserExam", async () => {
    const s = "cdutwhu@yeah.net";
    const r = await toIdKey(s, T.REGISTER);
    if (r.isErr() || !isEmail(r.value)) {
        printResult(r, true);
        return;
    }
    const r1 = await uec.deleteUserExam(r.value);
    printResult(r1, true);
});
