import { err, Result } from "neverthrow";
import { SupabaseAgent } from "@db/dbService.ts";
import { T_CONFIG, type TableType } from "@define/system.ts";
import type { Data, EmailKey, Region, Language, EmailKeyOn } from "@define/type.ts";
import { isEmail } from "@define/type.ts";

export class UserConfigController {

    private agent: SupabaseAgent;

    constructor(agent?: SupabaseAgent) {
        this.agent = agent ?? new SupabaseAgent();
    }

    getUserCfg(email: EmailKeyOn<['register', 'user_config']>): Promise<Result<Data, string>> {
        return this.agent.getSingleRowData(T_CONFIG, email)
    }

    async setUserCfg(cfg: { email: EmailKey<TableType>, region: Region; language: Language }): Promise<Result<Data, string>> {
        if (!isEmail(cfg.email)) return err(`'${cfg.email}' is invalid email format`)
        return await this.agent.setSingleRowData(T_CONFIG, cfg.email, cfg)
    }

    // deleteUserCfg(email: EmailKey): Promise<Result<Data, string>> {
    //     return this.agent.removeSingleRowDataObject(T_CONFIG, "email", email)
    // }

}