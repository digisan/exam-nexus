import { isEmail, isValidLanguage, isValidRegion } from "@define/type.ts";
import { toIdKey, toIdMultiKey } from "@define/id.ts";
import { T_REGISTER, T_USER_CONFIG } from "@define/system.ts";
import { ucc } from "@app/controllers/user_config.ts";

Deno.test(async function SetUserCfg() {
    const region = "au";
    if (!isValidRegion(region)) {
        console.debug(`${region} is NOT valid RegionType`);
        return;
    }

    const language = "en-AU";
    if (!isValidLanguage(language)) {
        console.debug(`${language} is NOT valid LanguageType`);
        return;
    }

    const s = "cdutwhu@yeah.net";

    const r_ek = await toIdKey(s, T_REGISTER);
    if (r_ek.isErr()) {
        console.debug(`${s} is NOT valid email or NOT registered`);
        return;
    }

    const r_eka = await toIdMultiKey(s, [T_REGISTER, T_USER_CONFIG]);
    if (r_eka.isErr() || !isEmail(r_eka.value)) {
        console.debug(`${s} is NOT both valid key for '${T_REGISTER}' & '${T_USER_CONFIG}'`);
        return;
    }
    const r = await ucc.getUserCfg(r_eka.value);
    console.log(r);
});
