import { ok, err, Result } from "neverthrow";
import { createSaferT } from "@i18n/util.ts";
import type { SafeT } from "@i18n/msg_auth_t.ts";
import { SupabaseAgent } from "@db/dbService.ts";

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

    // async setSysCfg(cfg: { region: RegionKey; language: LanguageKey }, ct?: SafeT): Promise<Result<boolean, string>> {
    //     const t = createSaferT(ct);

    //     await this.agent.setSingleRowData()

    //     return err(t('not implemented'))
    // }

}