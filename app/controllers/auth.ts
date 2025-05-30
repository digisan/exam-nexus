import { err, ok, Result } from "neverthrow";
import { sign } from "hono/jwt";
import { compare, hash } from "npm:bcrypt-ts";
import { type TransFnType, wrapOptT } from "@i18n/lang_t.ts";
import { dbAgent as agent } from "@db/dbService.ts";
import { T } from "@define/system.ts";
import type { Credential, Email, Password } from "@define/type.ts";
import type { Id } from "@define/id.ts";
import { toValidCredential } from "@define/type.ts";
import { isValidId, toIdSKey } from "@define/id.ts";
import { blacklistToken } from "@app/app.ts";
import { log2db } from "@util/log.ts";
import { env_get } from "@define/env.ts";
import { sleep } from "@util/util.ts";

const SIGNATURE_KEY = env_get("SIGNATURE_KEY");

class AuthController {
    async register(info: { email: Email; password: Password }, ct?: TransFnType): Promise<Result<string, string>> {
        const t = wrapOptT(ct);
        try {
            const r_ek = await toIdSKey(info.email, T.REGISTER);
            if (r_ek.isOk()) return err(t("register.fail.existing"));

            const id = info.email;
            if (!isValidId(id)) return err(t("register.fail.invalid_id"));

            const r = await agent.SetSingleRowData(T.REGISTER, id, {
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

    private async genToken(id: Id): Promise<Result<string, string>> {
        const expiresInSeconds = 60 * 100; // 100 minutes
        const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
        const payload = {
            sub: id,
            role: "user",
            exp,
        };
        if (!SIGNATURE_KEY) return err(`fatal: SIGNATURE_KEY must be provided!`);
        try {
            const token = await sign(payload, SIGNATURE_KEY);
            const timer = setTimeout(async () => {
                blacklistToken.delete(token);
                await sleep(50);
                clearTimeout(timer);
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

            const id = r_cred.value.id;
            const r_id = await toIdSKey(id, T.REGISTER);
            if (r_id.isErr()) return err(t("login.fail.not_existing"));

            const r = await agent.GetSingleRowData(T.REGISTER, r_id.value);
            if (r.isErr()) return err(r.error);

            if (!await compare(credential.password, r.value!.password as string)) return err(t("login.fail.verification"));
            return this.genToken(credential.id);
        } catch (e) {
            log2db(`${e}`, "", t);
            return err(t(`catch`, { err: e }));
        }
    }

    logout(token: string) {
        blacklistToken.add(token);
    }
}

export const auth = new AuthController();
