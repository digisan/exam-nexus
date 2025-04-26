import { ok, err, Result } from "neverthrow";
import { sign } from "hono/jwt";
import { hash, compare } from "npm:bcrypt-ts";
import { fileExists } from "@util/util.ts";
import { type TransFnType, createSaferT } from "@i18n/lang_t.ts";
import type { Email, Password } from "@define/type.ts";

const SIGNATURE_KEY = Deno.env.get("SIGNATURE_KEY");
const tokenBlacklist = new Set();
const localFilePath = "./data/users.json";

export class AuthControllerLocal {

    get SignatureKey() {
        return SIGNATURE_KEY
    }

    async register(credentials: { email: Email; password: Password }, ct?: TransFnType) {
        try {
            const t = createSaferT(ct);
            if (await fileExists(localFilePath)) {
                const content = await Deno.readTextFile(localFilePath);
                const data = JSON.parse(content);

                // check file format
                if (!Array.isArray(data)) {
                    return err(t('register.err.fmt_json'))
                }

                // check user existing status
                if (data.some((u) => u.email === credentials.email)) {
                    return err(t('register.fail.existing'))
                }

                // insert with hashed password
                data.push({ email: credentials.email, password: await hash(credentials.password, 10) });
                await Deno.writeTextFile(localFilePath, JSON.stringify(data, null, 4));
                return ok(t('register.ok.__'))

            } else {
                await Deno.writeTextFile(
                    localFilePath,
                    JSON.stringify(
                        [{ email: credentials.email, password: await hash(credentials.password, 10) }],
                        null,
                        4,
                    ),
                );
                return ok(t('register.ok.__'))
            }

        } catch (e) {
            // log here ...
            return err(`fatal: ${e}`)
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
        if (!SIGNATURE_KEY) return err(`fatal: SIGNATURE_KEY must be provided!`)
        try {
            const token = await sign(payload, SIGNATURE_KEY);
            setTimeout(() => { tokenBlacklist.delete(token); }, (expiresInSeconds + 60) * 1000); // remove unnecessary blacklisted token if real
            return ok(token)
        } catch (e) {
            return err(`fatal: token signing failed: ${e}`);
        }
    }

    async login(credentials: { email: Email; password: Password }, ct?: TransFnType) {
        try {
            const t = createSaferT(ct);
            if (!await fileExists(localFilePath)) return err(t('login.fail.not_existing'));

            const content = await Deno.readTextFile(localFilePath);
            const data = JSON.parse(content);

            // check file format
            if (!Array.isArray(data)) return err(t('login.err.fmt_json'));

            // check user existing status
            // const exists = data.some((u) => u.email === email);
            // if (!exists) {
            //     return err(t('login.fail.not_existing'))
            // }

            const userData = data.find((u) => u.email == credentials.email);
            if (!userData) return err(t('login.fail.not_existing'))
            if (!await compare(credentials.password, userData.password)) return err(t('login.fail.verification'))
            return this.genToken(credentials.email)

        } catch (e) {
            // log here ...
            return err(`fatal: ${e}`)
        }
    }

    logout(token: string) {
        tokenBlacklist.add(token);
    }

    alreadyLogout(token: string) {
        return tokenBlacklist.has(token)
    }
}
