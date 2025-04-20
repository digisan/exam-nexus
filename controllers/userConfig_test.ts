import { UserConfigController } from "@controllers/userConfig.ts";
import { toExistEmail, isValidLanguage, isValidRegion } from "@define/type.ts";

Deno.test(async function SetUserCfg() {

    const ucc = new UserConfigController();

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
    const email = await toExistEmail(s);
    if (!email) {
        console.debug(`${s} is NOT valid email or NOT registered`);
        return;
    }

    const result = await ucc.setUserCfg({ email, region, language })
    console.log(result)
});
