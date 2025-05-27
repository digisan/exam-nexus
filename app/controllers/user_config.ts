import { err, Result } from "neverthrow";
import { dbAgent as agent } from "@db/dbService.ts";
import { T, type T_REGISTER, type T_USER_CONFIG } from "@define/system.ts";
import type { Config, Email } from "@define/type.ts";
import { type IdKey, type IdMultiKey, isValidId } from "@define/id.ts";
import type { Data } from "@db/dbService.ts";
import { type TransFnType, wrapOptT } from "@i18n/lang_t.ts";

class UserConfigController {
    // insert or update into T.USER_CONFIG
    //
    async setUserCfg(cfg: Config, ct?: TransFnType): Promise<Result<Data, string>> {
        const t = wrapOptT(ct);
        const id = cfg.email;
        if (!isValidId(id)) return err(t("param.invalid", { param: cfg.email }));
        return await agent.SetSingleRowData(T.USER_CONFIG, id, cfg);
    }

    // get from T.USER_CONFIG
    //
    async getUserCfg(email: IdMultiKey<[T_REGISTER, T_USER_CONFIG]> & Email, ct?: TransFnType): Promise<Result<Data, string>> {
        return await agent.GetSingleRowData(T.USER_CONFIG, email);
    }

    // delete from T.USER_CONFIG
    //
    async deleteUserCfg(email: IdKey<T_REGISTER> & Email, ct?: TransFnType): Promise<Result<Data, string>> {
        return await agent.DeleteRowData(T.USER_CONFIG, email, true);
    }
}

export const ucc = new UserConfigController();
