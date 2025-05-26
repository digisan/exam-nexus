import { uec } from "@app/controllers/user_exam.ts";
import { toIdKey } from "@define/id.ts";
import { T } from "@define/system.ts";
import { isEmail } from "@define/type.ts";

Deno.test("SetUserExam", async () => {
    const s = "cdutwhu@yeah.net";

    const r_ek = await toIdKey(s, T.REGISTER);
    if (r_ek.isErr() || !isEmail(r_ek.value)) {
        console.debug(`${s} is NOT valid email or NOT registered`);
        return;
    }

    const r = await uec.setUserExam(r_ek.value, { "vce": ["vce.1", "vce.2"], "naplan": ["naplan.1"] });
    if (r.isErr()) {
        console.debug(`setUserExam error ` + r.error);
        return;
    }

    console.log(r.value);
});
