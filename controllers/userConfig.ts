import { ok, err, Result } from "neverthrow";
import { createSaferT } from "@i18n/util.ts";
import type { SafeT } from "@i18n/msg_auth_t.ts";
import { SupabaseAgent } from "@db/dbService.ts";
import type { TableKey } from "@db/dbService.ts";

const TABLE_USERSYSCFG: TableKey = 'user_sys_config';
const TABLE_DEBUG: TableKey = 'messages';

const regions = [
    "au",
    "cn",
    "us",
    "jp",
] as const;

const languages = [
    "en",
    "zh"
] as const;

type RegionKey = typeof regions[number];
type LanguageKey = typeof languages[number];

export class UserConfigController {

    private agent: SupabaseAgent;

    constructor(agent?: SupabaseAgent) {
        this.agent = agent ?? new SupabaseAgent();
    }

    async setSysCfg(cfg: { region: RegionKey; language: LanguageKey }, ct?: SafeT): Promise<Result<boolean, string>> {
        const t = createSaferT(ct);
        
        const result = await this.agent.setSingleRowData(TABLE_USERSYSCFG, cfg)

        return err(t('not implemented'))
    }

}