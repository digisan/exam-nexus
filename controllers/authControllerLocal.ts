import { ok, err } from "neverthrow";
import { sign } from "hono/jwt";
import * as bcrypt from "jsr:@da/bcrypt";
import { fileExists } from "@util/util.ts";
import { createSafeI18nT } from "@i18n/util.ts";

const SIGNATURE_KEY = Deno.env.get("SIGNATURE_KEY");
const tokenBlacklist = new Set();
const localFilePath = "./data/users.json";

export class AuthControllerLocal {

    get SignatureKey() {
        return SIGNATURE_KEY
    }

    async register(credentials: { email: string; password: string }, ct?: Function) {
        try {
            const t = createSafeI18nT(ct);
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
                data.push({ email: credentials.email, password: await bcrypt.hash(credentials.password) });
                await Deno.writeTextFile(localFilePath, JSON.stringify(data, null, 4));
                return ok(t('register.ok.to_route'))

            } else {
                await Deno.writeTextFile(
                    localFilePath,
                    JSON.stringify(
                        [{ email: credentials.email, password: await bcrypt.hash(credentials.password) }],
                        null,
                        4,
                    ),
                );
                return ok(t('register.ok.to_route'))
            }

        } catch (e) {
            // log here ...
            return err(`fatal: ${e}`)
        }
    }

    private async genToken(email: string) {
        const expIn = 60 * 100 // Token expires in 100 minutes
        const payload = {
            sub: email,
            role: "user",
            exp: Math.floor(Date.now() / 1000) + expIn,
        };
        if (!SIGNATURE_KEY) {
            return err(`fatal: SIGNATURE_KEY must be provided!`)
        }
        const token = await sign(payload, SIGNATURE_KEY);
        setTimeout(() => { tokenBlacklist.delete(token); }, expIn * 1100); // remove unnecessary blacklisted token if real
        return ok(token)
    }

    async login(credentials: { email: string; password: string }, ct?: Function) {
        try {
            const t = createSafeI18nT(ct);
            if (!await fileExists(localFilePath)) {
                return err(t('login.fail.not_existing'))
            }

            const content = await Deno.readTextFile(localFilePath);
            const data = JSON.parse(content);

            // check file format
            if (!Array.isArray(data)) {
                return err(t('login.err.fmt_json'))
            }

            // check user existing status
            // const exists = data.some((u) => u.email === email);
            // if (!exists) {
            //     return err(t('login.fail.not_existing'))
            // }

            const userData = data.find((u) => u.email == credentials.email);
            if (!userData) {
                return err(t('login.fail.not_existing'))
            }
            if (!await bcrypt.compare(credentials.password, userData.password)) {
                return err(t('login.fail.verification'))
            }

            // create user session token
            const expIn = 60 * 100 // Token expires in 100 minutes
            const payload = {
                sub: credentials.email,
                role: "user",
                exp: Math.floor(Date.now() / 1000) + expIn,
            };
            if (!SIGNATURE_KEY) {
                return err(`fatal: SIGNATURE_KEY must be provided!`)
            }
            const token = await sign(payload, SIGNATURE_KEY);
            ct && setTimeout(() => { tokenBlacklist.delete(token); }, expIn * 1100); // remove unnecessary blacklisted token if real
            return ok(token)
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
