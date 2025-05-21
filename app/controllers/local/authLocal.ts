import { err, ok, Result } from "neverthrow";
import { sign } from "hono/jwt";
import { compare, hash } from "npm:bcrypt-ts";
import { fileExists } from "@util/util.ts";
import { type TransFnType, wrapOptT } from "@i18n/lang_t.ts";
import type { Email, Password } from "@define/type.ts";
import { singleton } from "@util/util.ts";
import { blacklistToken } from "@app/app.ts";
import { env_get } from "@define/env.ts";

const SIGNATURE_KEY = env_get("SIGNATURE_KEY");
const localFilePath = "./data/users.json";

class AuthLocalController {
    async register(credential: { email: Email; password: Password }, ct?: TransFnType) {
        const t = wrapOptT(ct);

        try {
            if (await fileExists(localFilePath)) {
                const content = await Deno.readTextFile(localFilePath);
                const data = JSON.parse(content);

                // check file format
                if (!Array.isArray(data)) {
                    return err(t("register.err.fmt_json"));
                }

                // check user existing status
                if (data.some((u) => u.email === credential.email)) {
                    return err(t("register.fail.existing"));
                }

                // insert with hashed password
                data.push({ email: credential.email, password: await hash(credential.password, 10) });
                await Deno.writeTextFile(localFilePath, JSON.stringify(data, null, 4));
                return ok(t("register.ok.__"));
            } else {
                await Deno.writeTextFile(
                    localFilePath,
                    JSON.stringify(
                        [{ email: credential.email, password: await hash(credential.password, 10) }],
                        null,
                        4,
                    ),
                );
                return ok(t("register.ok.__"));
            }
        } catch (e) {
            // log here ...
            return err(`fatal: ${e}`);
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

    async login(credential: { email: Email; password: Password }, ct?: TransFnType) {
        const t = wrapOptT(ct);

        try {
            if (!await fileExists(localFilePath)) return err(t("login.fail.not_existing"));

            const content = await Deno.readTextFile(localFilePath);
            const data = JSON.parse(content);

            // check file format
            if (!Array.isArray(data)) return err(t("login.err.fmt_json"));

            // check user existing status
            // const exists = data.some((u) => u.email === email);
            // if (!exists) {
            //     return err(t('login.fail.not_existing'))
            // }

            const userData = data.find((u) => u.email == credential.email);
            if (!userData) return err(t("login.fail.not_existing"));
            if (!await compare(credential.password, userData.password)) return err(t("login.fail.verification"));
            return this.genToken(credential.email);
        } catch (e) {
            // log here ...
            return err(`fatal: ${e}`);
        }
    }

    logout(token: string) {
        blacklistToken.add(token);
    }
}

export const authLocal = new (singleton(AuthLocalController))();
