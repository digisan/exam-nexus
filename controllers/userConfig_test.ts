import { UserConfigController } from "@controllers/userConfig.ts";
import { toExistEmail, isValidLanguage, isValidRegion } from "@define/type.ts";

Deno.test(async function SetUserCfg() {

    const ucc = new UserConfigController();

    const l = prompt("", "");
    if (!isValidLanguage(l)) {
        return
    }

    const r = prompt("", "");
    if (!isValidRegion(r)) {
        return
    }

    const s = "ccc@qq.com";
    const existEmail = await toExistEmail(s);
    if (!existEmail) {
        console.log(`${s} is NOT a valid email or NOT registered`);
        return;
    }

    const result = await ucc.setUserCfg({ email: existEmail, region: r, language: l })
    console.log(result)
});
