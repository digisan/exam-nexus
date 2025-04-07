import { ok, err } from "neverthrow";
import { sign } from "hono/jwt";
import * as bcrypt from "jsr:@da/bcrypt";
import { createSafeI18nT } from "@util/util.ts";
import { SupabaseAgent } from "@db/dbService.ts";

const SIGNATURE_KEY = Deno.env.get("SIGNATURE_KEY");
const tokenBlacklist = new Set();
const RegTable = 'register';

export class AuthController {

    get SignatureKey() {
        return SIGNATURE_KEY
    }

    async register(credentials: { email: string; password: string }, ct?: Function) {
        try {
            const t = createSafeI18nT(ct);
            const sa = new SupabaseAgent();
            const rg = await sa.getSingleRowData(RegTable);
            if (rg.isOk()) {
                if (!Array.isArray(rg.value)) {
                    if (rg.value && rg.value.email === credentials.email) {
                        return err(t('register.fail.existing'))
                    }
                } else {
                    if (rg.value.some((u) => u.email === credentials.email)) {
                        return err(t('register.fail.existing'))
                    }
                }
                const ra = await sa.appendSingleRowData(RegTable, { email: credentials.email, password: await bcrypt.hash(credentials.password) })
                if (ra.isOk()) {
                    return ok(t('register.ok.to_route'))
                }
                return err(ra.error)
            }
            return err(rg.error)

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
            const sa = new SupabaseAgent();
            const rg = await sa.getSingleRowData(RegTable);
            if (rg.isOk()) {
                if (Array.isArray(rg.value)) {
                    const user = rg.value.find((u) => u.email === credentials.email);
                    if (!user) {
                        return err(t('login.fail.not_existing'))
                    }
                    if (!await bcrypt.compare(credentials.password, user.password)) {
                        return err(t('login.fail.verification'))
                    }
                    return this.genToken(credentials.email)
                } else {
                    if (rg.value?.email === credentials.email) {
                        if (!await bcrypt.compare(credentials.password, rg.value.password)) {
                            return err(t('login.fail.verification'))
                        }
                        return this.genToken(credentials.email)
                    }
                    return err(t('login.fail.not_existing'))
                }
            }
            return err(rg.error)

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
