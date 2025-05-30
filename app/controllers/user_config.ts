import { err, Result } from "neverthrow";
import { dbAgent as agent } from "@db/dbService.ts";
import { T, type T_REGISTER, type T_USER_CONFIG } from "@define/system.ts";
import type { Config } from "@define/type.ts";
import { type Id, type IdMKey, type IdSKey, isValidId } from "@define/id.ts";
import type { Data } from "@db/dbService.ts";
import { type TransFnType, wrapOptT } from "@i18n/lang_t.ts";

class UserConfigController {
    // insert or update into T.USER_CONFIG
    //
    async setUserCfg(cfg: Config, ct?: TransFnType): Promise<Result<Data, string>> {
        const t = wrapOptT(ct);
        const id = cfg.id;
        if (!isValidId(id)) return err(t("param.invalid", { param: cfg.id }));
        return await agent.SetSingleRowData(T.USER_CONFIG, id, cfg);
    }

    // get from T.USER_CONFIG
    //
    async getUserCfg(id: IdMKey<[T_REGISTER, T_USER_CONFIG]>, ct?: TransFnType): Promise<Result<Data, string>> {
        return await agent.GetSingleRowData(T.USER_CONFIG, id as unknown as IdSKey<T_USER_CONFIG>);
    }

    // delete from T.USER_CONFIG
    //
    async deleteUserCfg(id: IdSKey<T_REGISTER>, ct?: TransFnType): Promise<Result<Data, string>> {
        return await agent.DeleteRowData(T.USER_CONFIG, id as unknown as Id, true);
    }
}

export const ucc = new UserConfigController();
