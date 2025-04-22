import { ok, err, Result } from "neverthrow";
import { sign } from "hono/jwt";
import { hash, compare } from "npm:bcrypt-ts";
import { type SafeT, createSaferT } from "@i18n/msg_auth_t.ts";
import { SupabaseAgent } from "@db/dbService.ts";
import { T_REGISTER, T_TEST } from "@define/system.ts";
import type { Data, JSONObject, Email, Password } from "@define/type.ts";
import { toEmailKey, isValidId } from "@define/type.ts";

const SIGNATURE_KEY = Deno.env.get("SIGNATURE_KEY");
const tokenBlacklist = new Set();

export class AuthController {

    private agent: SupabaseAgent;

    constructor(agent?: SupabaseAgent) {
        this.agent = agent ?? new SupabaseAgent();
    }

    SignatureKey(): string { return SIGNATURE_KEY ?? "" }

    async register(credentials: { email: Email; password: Password }, ct?: SafeT): Promise<Result<string, string>> {

        const t = createSaferT(ct);

        try {

            const emailKey = await toEmailKey(credentials.email, T_REGISTER)
            if (emailKey) {
                return err(t('register.fail.existing'))
            }

            const id = credentials.email
            if (!isValidId(id)) return err(t('register.fail.invalid_id'))

            const r = await this.agent.setSingleRowData(T_REGISTER, id, {
                email: credentials.email,
                password: await hash(credentials.password, 10),
                registered_at: new Date().toISOString(),
            })

            if (r.isErr()) return err(r.error)

            return ok(t('register.ok.to_route'))

        } catch (e) {
            // log here ...
            // await this.agent.insertTextRow(T_TEST, `catch - ${e}`)
            // 
            return err(`fatal: registering failed: ${e}`)
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
        if (!SIGNATURE_KEY) {
            return err(`fatal: SIGNATURE_KEY must be provided!`)
        }

        try {
            const token = await sign(payload, SIGNATURE_KEY);
            setTimeout(() => { tokenBlacklist.delete(token); }, (expiresInSeconds + 60) * 1000); // remove unnecessary blacklisted token if real
            return ok(token)
        } catch (e) {
            return err(`fatal: token signing failed: ${e}`);
        }
    }

    private findUserByEmail(data: Data, email: Email): JSONObject | null {
        if (Array.isArray(data)) {
            return data.find((u) => u.email === email) ?? null;
        }
        return data?.email === email ? data : null;
    }

    async login(credentials: { email: Email; password: Password }, ct?: SafeT): Promise<Result<string, string>> {

        const t = createSaferT(ct);

        try {
            const rg = await this.agent.getSingleRowData(T_REGISTER);
            if (rg.isErr()) {
                return err(rg.error);
            }

            const user = this.findUserByEmail(rg.value, credentials.email);
            if (!user) {
                // return err(t('login.fail.not_existing'))
                return err(t('login.fail.verification'));
            }

            const passwordMatch = await compare(credentials.password, user.password);
            if (!passwordMatch) {
                return err(t('login.fail.verification'));
            }

            return this.genToken(credentials.email);

        } catch (e) {
            // log here ...
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
