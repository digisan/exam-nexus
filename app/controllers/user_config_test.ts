import { isEmail, toValidConfig } from "@define/type.ts";
import { toIdKey, toIdMultiKey } from "@define/id.ts";
import { T } from "@define/system.ts";
import { ucc } from "@app/controllers/user_config.ts";
import { printResult } from "@util/log.ts";

Deno.test("setUserCfg", async () => {
    const cfg = {
        email: "cdutwhu@yeah.net",
        region: "au",
        lang: "en-AU",
    }
    const r = await toValidConfig(cfg)
    if (r.isErr()) {
        printResult(r, true)
        return
    }
    const r1 = await ucc.setUserCfg(r.value)
    printResult(r1, true)
})

Deno.test("getUserCfg", async () => {
    const s = "cdutwhu@yeah.net";
    const r_ek = await toIdKey(s, T.REGISTER);
    if (r_ek.isErr()) {
        printResult(r_ek, true);
        return;
    }
    const r_eka = await toIdMultiKey(s, [T.REGISTER, T.USER_CONFIG]);
    if (r_eka.isErr() || !isEmail(r_eka.value)) {
        console.debug(`${s} is NOT both valid key for '${T.REGISTER}' & '${T.USER_CONFIG}'`);
        return;
    }
    const r = await ucc.getUserCfg(r_eka.value);
    printResult(r, true)
});

Deno.test("deleteUserCfg", async () => {
    const s = "cdutwhu@yeah.net";
    const r = await toIdKey(s, T.REGISTER);
    if (r.isErr() || !isEmail(r.value)) {
        printResult(r, true)
        return
    }
    const r1 = await ucc.deleteUserCfg(r.value);
    printResult(r1, true);
})