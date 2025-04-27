import { Result } from "neverthrow";
import { dbAgent as agent } from "@db/dbService.ts";
import { T_REGISTER, T_USER_CONFIG } from "@define/system.ts";
import type { Data, EmailKey, Region, Language, EmailKeyOnAll, Email } from "@define/type.ts";

export class UserConfigController {

    async getUserCfg(email: EmailKeyOnAll<[T_REGISTER, T_USER_CONFIG]>): Promise<Result<Data, string>> {
        return await agent.getSingleRowData(T_USER_CONFIG, email as unknown as EmailKey<T_USER_CONFIG>)
    }

    async setUserCfg(cfg: { email: EmailKey<T_REGISTER>, region: Region; language: Language }): Promise<Result<Data, string>> {
        return await agent.setSingleRowData(T_USER_CONFIG, cfg.email as unknown as Email, cfg)
    }

    async deleteUserCfg(email: EmailKey<T_REGISTER>): Promise<Result<Data, string>> {
        return await agent.deleteRowData(T_USER_CONFIG, email as unknown as Email, true)
    }
}