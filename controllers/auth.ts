import { ok, err, Result } from "neverthrow";
import { sign } from "hono/jwt";
import { hash, compare } from "npm:bcrypt-ts";
import { createSaferT } from "@i18n/util.ts";
import type { SafeT } from "@i18n/msg_auth_t.ts";
import { SupabaseAgent } from "@db/dbService.ts";
import { type Email, type Password } from "@define/type.ts";
import { T_REG, T_DEBUG } from "@define/const.ts";

const SIGNATURE_KEY = Deno.env.get("SIGNATURE_KEY");
const tokenBlacklist = new Set();

type JSONObject = Record<string, any>;
type Data = JSONObject | JSONObject[] | null;

export class AuthController {

    private agent: SupabaseAgent;

    constructor(agent?: SupabaseAgent) {
        this.agent = agent ?? new SupabaseAgent();
    }

    SignatureKey(): string { return SIGNATURE_KEY ?? "" }

    async register(credentials: { email: Email; password: Password }, ct?: SafeT): Promise<Result<string, string>> {
        const t = createSaferT(ct);

        try {
            // Step 1: 拉取用户注册内容
            const rg = await this.agent.getSingleRowData(T_REG);
            if (rg.isErr()) {
                return err(rg.error)
            }

            // Step 2: 判断邮箱是否已存在
            if (Array.isArray(rg.value)) {
                if (rg.value.some((u) => u.email === credentials.email)) {
                    return err(t('register.fail.existing'))
                }
            } else {
                if (rg.value?.email === credentials.email) {
                    return err(t('register.fail.existing'))
                }
            }

            const ra = await this.agent.appendSingleRowData(T_REG, {
                email: credentials.email,
                password: await hash(credentials.password, 10),
                registered_at: new Date().toISOString(),
            })
            if (ra.isErr()) {
                return err(ra.error)
            }

            return ok(t('register.ok.to_route'))

        } catch (e) {
            // log here ...
            await this.agent.insertTextRow(T_DEBUG, `catch - ${e}`)
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
            const rg = await this.agent.getSingleRowData(T_REG);
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
