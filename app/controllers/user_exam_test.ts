import { uec } from "./user_exam.ts";
import { toEmailKey } from "@define/type.ts";
import { T_REGISTER } from "@define/system.ts";

Deno.test(async function SetUserExam() {
    const s = "cdutwhu@yeah.net";

    const r_ek = await toEmailKey(s, T_REGISTER);
    if (r_ek.isErr()) {
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
