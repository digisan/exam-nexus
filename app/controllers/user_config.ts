import { Result } from "neverthrow";
import { dbAgent as agent } from "@db/dbService.ts";
import { T_REGISTER, T_USER_CONFIG } from "@define/system.ts";
import type { Config, Email, EmailKey, EmailKeyOnAll } from "@define/type.ts";
import type { Data } from "@db/dbService.ts";
import { singleton } from "@util/util.ts";

class UserConfigController {
    async getUserCfg(email: EmailKeyOnAll<[T_REGISTER, T_USER_CONFIG]>): Promise<Result<Data, string>> {
        return await agent.getSingleRowData(T_USER_CONFIG, email as unknown as EmailKey<T_USER_CONFIG>);
    }

    // insert or update into T_USER_CONFIG
    async setUserCfg(cfg: Config): Promise<Result<Data, string>> {
        return await agent.setSingleRowData(T_USER_CONFIG, cfg.email as unknown as Email, cfg);
    }

    // delete from T_USER_CONFIG
    async deleteUserCfg(email: EmailKey<T_REGISTER>): Promise<Result<Data, string>> {
        return await agent.deleteRowData(T_USER_CONFIG, email as unknown as Email, true);
    }
}

export const ucc = new (singleton(UserConfigController))();
