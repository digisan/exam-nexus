import { uec } from "@app/controllers/user_exam.ts";
import { toIdSKey, toIdSKeyWithSKeyPart } from "@define/id.ts";
import { K, T } from "@define/system.ts";
import { printResult } from "@util/log.ts";
import { isValidExamSelection } from "@define/exam/type.ts";
import { err } from "neverthrow";

Deno.test("setUserExam", async () => {
    const s = "cdutwhu@outlook.com";
    const r_ek = await toIdSKey(s, T.REGISTER);
    if (r_ek.isErr()) {
        printResult(r_ek, true, `${s} is NOT valid ID or NOT registered`);
        return;
    }
    {
        const exam = { "vce": ["vce.ma.1", "vce.ma.2", "vce.en.2"], "naplan": ["naplan.r.y3", "naplan.w.y3"] };
        if (!isValidExamSelection(exam)) {
            printResult(err(`${JSON.stringify(exam, null, 4)} is invalid exam selection`), true);
            return;
        }
        const r = await uec.setUserExam(r_ek.value, "au", exam);
        if (r.isErr()) {
            printResult(r, true, `setUserExam error ` + r.error);
            return;
        }
        console.log(r.value);
    }
    {
        const exam = { "cet": ["cet.6"] };
        if (!isValidExamSelection(exam)) {
            printResult(err(`${JSON.stringify(exam, null, 4)} is invalid exam selection`), true);
            return;
        }
        const r = await uec.setUserExam(r_ek.value, "cn", exam);
        if (r.isErr()) {
            printResult(r, true, `setUserExam error ` + r.error);
            return;
        }
        console.log(r.value);
    }
});

Deno.test("getUserExam", async () => {
    const s = "cdutwhu@outlook.com";
    const r = await toIdSKeyWithSKeyPart(s, T.REGISTER, T.USER_EXAM, K.UID);
    if (r.isErr()) {
        printResult(r, true, `'${s}' is NOT both valid key for '${T.REGISTER}' & '${T.USER_EXAM}'`);
        return;
    }
    const r1 = await uec.getUserExam(r.value, "au");
    printResult(r1, true);
});

Deno.test("deleteUserExam", async () => {
    const s = "cdutwhu@outlook.com";
    const r = await toIdSKey(s, T.REGISTER);
    if (r.isErr()) {
        printResult(r, true);
        return;
    }
    const r1 = await uec.deleteUserExam(r.value, "au");
    printResult(r1, true);
});
