import { ok, err, Result } from "neverthrow";
import { sign } from "hono/jwt";
import { hash, compare } from "npm:bcrypt-ts";
import { type TransFnType, wrapOptT } from "@i18n/lang_t.ts";
import { dbAgent as agent } from "@db/dbService.ts";
import { T_REGISTER, T_TEST } from "@define/system.ts";
import type { Email, Password, EmailKey } from "@define/type.ts";
import { toEmailKey, isValidId } from "@define/type.ts";
import { hasSome } from "@util/util.ts";

const SIGNATURE_KEY = Deno.env.get("SIGNATURE_KEY");
const tokenBlacklist = new Set();

export class AuthController {

    SignatureKey(): string { return SIGNATURE_KEY ?? "" }

    async register(credentials: { email: Email; password: Password }, ct?: TransFnType): Promise<Result<string, string>> {

        const t = wrapOptT(ct);

        try {
            if (await toEmailKey(credentials.email, T_REGISTER)) return err(t('register.fail.existing'))

            const r = await agent.setSingleRowData(T_REGISTER, credentials.email, {
                email: credentials.email,
                password: await hash(credentials.password, 10),
                registered_at: new Date().toISOString(),
            })
            if (r.isErr()) return err(r.error)

            return ok(t('register.ok.__'))

        } catch (e) {

            // log error to db here ...
            const id = new Date().toISOString();
            if (!isValidId(id)) return err(`fatal: registering failed: ${e} and cannot log error`)
            await agent.setSingleRowData(T_TEST, id, { msg: `${e}` })

            return err(`fatal: registering failed: ${e}`)
        }
    }

    private async genToken(email: EmailKey<T_REGISTER>): Promise<Result<string, string>> {
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

    async login(credentials: { email: EmailKey<T_REGISTER>; password: Password }, ct?: TransFnType): Promise<Result<string, string>> {

        const t = wrapOptT(ct);

        try {
            const r = await agent.getSingleRowData(T_REGISTER, credentials.email)
            if (r.isErr()) return err(r.error)
            if (!hasSome(r.value)) return err(t(`register.err.missing_content`))
            if (!await compare(credentials.password, (r.value as any).password)) {
                return err(t('login.fail.verification'));
            }
            return this.genToken(credentials.email);

        } catch (e) {

            // log error to db here ...
            const id = new Date().toISOString();
            if (!isValidId(id)) return err(`fatal: login failed: ${e} and cannot log error`)
            await agent.setSingleRowData(T_TEST, id, { msg: `${e}` })

            return err(`fatal: login failed: ${e}`)
        }
    }

    logout(token: string) {
        tokenBlacklist.add(token);
    }

    alreadyLogout(token: string): boolean {
        return tokenBlacklist.has(token)
    }
}
