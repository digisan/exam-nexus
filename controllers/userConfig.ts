import { Result } from "neverthrow";
import type { SafeT } from "@i18n/msg_auth_t.ts";
import { SupabaseAgent } from "@db/dbService.ts";
import { T_USERSYSCFG } from "@define/const.ts";
import type { Data, RegionKey, LanguageKey } from "@define/type.ts";
import type { ExistEmail } from "@define/type_b.ts";

export class UserConfigController {

    private agent: SupabaseAgent;

    constructor(agent?: SupabaseAgent) {
        this.agent = agent ?? new SupabaseAgent();
    }

    setSysCfg(cfg: { email: ExistEmail, region: RegionKey; language: LanguageKey }, ct?: SafeT): Promise<Result<Data, string>> {
        return this.agent.upsertSingleRowDataObject(T_USERSYSCFG, "email", cfg)
    }
}