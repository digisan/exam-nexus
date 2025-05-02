import { toEmailKey, isValidLanguage, isValidRegion, toEmailKeyOnAll } from "@define/type.ts";
import { T_REGISTER, T_USER_CONFIG } from "@define/system.ts";
import { cc } from "./config.ts";

Deno.test(async function SetUserCfg() {
    const region = "au";
    if (!isValidRegion(region)) {
        console.debug(`${region} is NOT valid RegionType`);
        return
    }

    const language = "en"
    if (!isValidLanguage(language)) {
        console.debug(`${language} is NOT valid LanguageType`);
        return
    }

    const s = "123470@qq.com";

    const email = await toEmailKey(s, T_REGISTER);
    if (!email) {
        console.debug(`${s} is NOT valid email or NOT registered`);
        return;
    }

    const emailBoth = await toEmailKeyOnAll(s, T_REGISTER, T_USER_CONFIG)
    if (!emailBoth) {
        console.debug(`${s} is NOT both valid key for '${T_REGISTER}' & '${T_USER_CONFIG}'`);
        return
    }
    const result = await cc.getUserCfg(emailBoth)
    console.log(result)
});
