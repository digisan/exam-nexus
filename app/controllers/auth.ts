import { err, ok, Result } from "neverthrow";
import { sign } from "hono/jwt";
import { compare, hash } from "npm:bcrypt-ts";
import { type TransFnType, wrapOptT } from "@i18n/lang_t.ts";
import { dbAgent as agent } from "@db/dbService.ts";
import { T_REGISTER } from "@define/system.ts";
import type { Credential, Email, Password } from "@define/type.ts";
import { toValidCredential } from "@define/type.ts";
import { isValidId, toIdKey } from "@define/id.ts";
import { blacklistToken } from "@app/app.ts";
import { singleton } from "@util/util.ts";
import { log2db } from "@util/log.ts";
import { env_get } from "@define/env.ts";

const SIGNATURE_KEY = env_get("SIGNATURE_KEY");

class AuthController {
    async register(info: { email: Email; password: Password }, ct?: TransFnType): Promise<Result<string, string>> {
        const t = wrapOptT(ct);
        try {
            const r_ek = await toIdKey(info.email, T_REGISTER);
            if (r_ek.isOk()) return err(t("register.fail.existing"));

            const id = info.email;
            if (!isValidId(id)) return err(t("register.fail.invalid_id"));

            const r = await agent.setSingleRowData(T_REGISTER, id, {
                email: info.email,
                password: await hash(info.password, 10),
                registered_at: new Date().toISOString(),
            });
            if (r.isErr()) return err(r.error);
            return ok(t("register.ok.__"));
        } catch (e) {
            log2db(`${e}`, "", t);
            return err(t(`catch`, { err: e }));
        }
    }

    private async genToken(email: Email): Promise<Result<string, string>> {
        const expiresInSeconds = 60 * 100; // 100 minutes
        const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
        const payload = {
            sub: email,
            role: "user",
            exp,
        };
        if (!SIGNATURE_KEY) return err(`fatal: SIGNATURE_KEY must be provided!`);
        try {
            const token = await sign(payload, SIGNATURE_KEY);
            setTimeout(() => {
                blacklistToken.delete(token);
            }, (expiresInSeconds + 60) * 1000); // remove unnecessary blacklisted token if real
            return ok(token);
        } catch (e) {
            return err(`fatal: token signing failed: ${e}`);
        }
    }

    async login(credential: Credential, ct?: TransFnType): Promise<Result<string, string>> {
        const t = wrapOptT(ct);
        try {
            const r_cred = await toValidCredential(credential);
            if (r_cred.isErr()) return err(t(`login.fail.invalid_credential`, { message: r_cred.error }));

            const id = r_cred.value.email;
            const r_id = await toIdKey(id, T_REGISTER);
            if (r_id.isErr()) return err(t("login.fail.not_existing"));

            const r = await agent.getSingleRowData(T_REGISTER, r_id.value);
            if (r.isErr()) return err(r.error);

            if (!await compare(credential.password, r.value!.password as string)) return err(t("login.fail.verification"));
            return this.genToken(credential.email);
        } catch (e) {
            log2db(`${e}`, "", t);
            return err(t(`catch`, { err: e }));
        }
    }

    logout(token: string) {
        blacklistToken.add(token);
    }
}

export const auth = new (singleton(AuthController))();
