import { err, Result } from "neverthrow";
import { SupabaseAgent } from "@db/dbService.ts";
import { T_REGISTER, T_USER_CONFIG } from "@define/system.ts";
import type { Data, EmailKey, Region, Language } from "@define/type.ts";
import { isEmail, toEmailKey } from "@define/type.ts";
import { type SafeT, createSaferT } from "@i18n/msg_auth_t.ts";

export class UserConfigController {

    private agent: SupabaseAgent;

    constructor(agent?: SupabaseAgent) {
        this.agent = agent ?? new SupabaseAgent();
    }

    // async getUserCfg(email: EmailKey<T_REGISTER> & EmailKey<T_USER_CONFIG>, ct?: SafeT): Promise<Result<Data, string>> {
    async getUserCfg(email: EmailKey<T_REGISTER & T_USER_CONFIG>, ct?: SafeT): Promise<Result<Data, string>> {

        const t = createSaferT(ct);

        if (!toEmailKey(email, T_REGISTER)) return err(t(`captcha.err`))

        return await this.agent.getSingleRowData(T_USER_CONFIG, email)
    }

    // async setUserCfg(cfg: { email: EmailKey<T_REGISTER>, region: Region; language: Language }): Promise<Result<Data, string>> {
    //     if (!isEmail(cfg.email)) return err(`'${cfg.email}' is invalid email format`)
    //     return await this.agent.setSingleRowData(T_USER_CONFIG, cfg.email, cfg)
    // }

    // deleteUserCfg(email: EmailKey): Promise<Result<Data, string>> {
    //     return this.agent.removeSingleRowDataObject(T_CONFIG, "email", email)
    // }

}