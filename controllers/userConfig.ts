import { Result } from "neverthrow";
import type { SafeT } from "@i18n/msg_auth_t.ts";
import { SupabaseAgent } from "@db/dbService.ts";
import { T_CONFIG } from "@define/system.ts";
import type { Data } from "@define/type.ts";
import type { EmailKey, Region, Language } from "@define/type.ts";

export class UserConfigController {

    private agent: SupabaseAgent;

    constructor(agent?: SupabaseAgent) {
        this.agent = agent ?? new SupabaseAgent();
    }

    // getUserCfg(email: EmailKey): Promise<Result<Data, string>> {
    //     this.agent.getSingleRowData(T_CONFIG)
    // }

    setUserCfg(cfg: { email: EmailKey, region: Region; language: Language }, ct?: SafeT): Promise<Result<Data, string>> {
        return this.agent.upsertSingleRowDataObject(T_CONFIG, "email", cfg)
    }

    deleteUserCfg(email: EmailKey): Promise<Result<Data, string>> {
        return this.agent.removeSingleRowDataObject(T_CONFIG, "email", email)
    }

}