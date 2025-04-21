import { Result } from "neverthrow";
import type { SafeT } from "@i18n/msg_auth_t.ts";
import { SupabaseAgent } from "@db/dbService.ts";
import { T_USER_SYSCFG } from "@define/const.ts";
import type { Data } from "@define/type.ts";
import type { EmailExist, Region, Language } from "@define/type.ts";

export class UserConfigController {

    private agent: SupabaseAgent;

    constructor(agent?: SupabaseAgent) {
        this.agent = agent ?? new SupabaseAgent();
    }

    // getUserCfg(email: EmailExist): Promise<Result<Data, string>> {
    //     this.agent.getSingleRowData(T_USER_SYSCFG)
    // }

    setUserCfg(cfg: { email: EmailExist, region: Region; language: Language }, ct?: SafeT): Promise<Result<Data, string>> {
        return this.agent.upsertSingleRowDataObject(T_USER_SYSCFG, "email", cfg)
    }

    deleteUserCfg(email: EmailExist): Promise<Result<Data, string>> {
        return this.agent.removeSingleRowDataObject(T_USER_SYSCFG, "email", email)
    }

}