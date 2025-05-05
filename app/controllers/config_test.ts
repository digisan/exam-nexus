import { isValidLanguage, isValidRegion, toEmailKey, toEmailKeyOnAll } from "@define/type.ts";
import { T_REGISTER, T_USER_CONFIG } from "@define/system.ts";
import { cc } from "./config.ts";

Deno.test(async function SetUserCfg() {
    const region = "au";
    if (!isValidRegion(region)) {
        console.debug(`${region} is NOT valid RegionType`);
        return;
    }

    const language = "en";
    if (!isValidLanguage(language)) {
        console.debug(`${language} is NOT valid LanguageType`);
        return;
    }

    const s = "123470@qq.com";

    const r_ek = await toEmailKey(s, T_REGISTER);
    if (r_ek.isErr()) {
        console.debug(`${s} is NOT valid email or NOT registered`);
        return;
    }

    const r_eka = await toEmailKeyOnAll(s, undefined, T_REGISTER, T_USER_CONFIG);
    if (r_eka.isErr()) {
        console.debug(`${s} is NOT both valid key for '${T_REGISTER}' & '${T_USER_CONFIG}'`);
        return;
    }
    const r = await cc.getUserCfg(r_eka.value);
    console.log(r);
});
