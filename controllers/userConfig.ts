import { Result } from "neverthrow";
import { SupabaseAgent } from "@db/dbService.ts";
import { T_REGISTER, T_USER_CONFIG } from "@define/system.ts";
import type { Data, EmailKey, Region, Language, EmailKeyOnAll, Email } from "@define/type.ts";

export class UserConfigController {

    private agent: SupabaseAgent;

    constructor(agent?: SupabaseAgent) {
        this.agent = agent ?? new SupabaseAgent();
    }

    async getUserCfg(email: EmailKeyOnAll<[T_REGISTER, T_USER_CONFIG]>): Promise<Result<Data, string>> {
        return await this.agent.getSingleRowData(T_USER_CONFIG, email as unknown as EmailKey<T_USER_CONFIG>)
    }

    async setUserCfg(cfg: { email: EmailKey<T_REGISTER>, region: Region; language: Language }): Promise<Result<Data, string>> {
        return await this.agent.setSingleRowData(T_USER_CONFIG, cfg.email as unknown as Email, cfg)
    }

    async deleteUserCfg(email: EmailKey<T_REGISTER>): Promise<Result<Data, string>> {
        return await this.agent.deleteRowData(T_USER_CONFIG, email as unknown as Email, true)
    }
}