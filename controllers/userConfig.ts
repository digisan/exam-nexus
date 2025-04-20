import { Result } from "neverthrow";
import type { SafeT } from "@i18n/msg_auth_t.ts";
import { SupabaseAgent } from "@db/dbService.ts";
import { T_USERSYSCFG } from "@define/const.ts";
import type { Data } from "@define/type.ts";
import type { ExistEmail, Region, Language } from "@define/type.ts";

export class UserConfigController {

    private agent: SupabaseAgent;

    constructor(agent?: SupabaseAgent) {
        this.agent = agent ?? new SupabaseAgent();
    }

    getUserCfg(email: ExistEmail): Promise<Result<Data, string>> {
        this.agent.getSingleRowData(T_USERSYSCFG)
    }

    setUserCfg(cfg: { email: ExistEmail, region: Region; language: Language }, ct?: SafeT): Promise<Result<Data, string>> {
        return this.agent.upsertSingleRowDataObject(T_USERSYSCFG, "email", cfg)
    }

    deleteUserCfg(email: ExistEmail): Promise<Result<Data, string>> {
        return this.agent.removeSingleRowDataObject(T_USERSYSCFG, "email", email)
    }

}