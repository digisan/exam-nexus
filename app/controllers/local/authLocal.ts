import { err, ok, Result } from "neverthrow";
import { sign } from "hono/jwt";
import { compare, hash } from "npm:bcrypt-ts";
import { fileExists } from "@util/util.ts";
import { Err, Ok } from "@i18n/lang_t.ts";
import type { Email, Password } from "@define/type.ts";
import { blacklistToken } from "@app/app.ts";
import { env_get } from "@define/env.ts";
import type { Id } from "@define/id.ts";

const SIGNATURE_KEY = env_get("SIGNATURE_KEY");
const localFilePath = "./data/users.json";

class AuthLocalController {
    async register(info: { email: Email; password: Password }) {
        const email = info.email;

        try {
            if (await fileExists(localFilePath)) {
                const content = await Deno.readTextFile(localFilePath);
                const data = JSON.parse(content);

                // check file format
                if (!Array.isArray(data)) {
                    return Err("register.err.fmt_json");
                }

                // check user existing status
                if (data.some((u) => u.id === email)) {
                    return Err("register.fail.existing");
                }

                // insert with hashed password
                data.push({ id: email, email, password: await hash(info.password, 10) });
                await Deno.writeTextFile(localFilePath, JSON.stringify(data, null, 4));
                return Ok("register.ok.__");
            } else {
                await Deno.writeTextFile(
                    localFilePath,
                    JSON.stringify(
                        [{ id: email, email, password: await hash(info.password, 10) }],
                        null,
                        4,
                    ),
                );
                return Ok("register.ok.__");
            }
        } catch (e) {
            // log here ...
            return err(`fatal: ${e}`);
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
            setTimeout(() => {
                blacklistToken.delete(token);
            }, (expiresInSeconds + 60) * 1000); // remove unnecessary blacklisted token if real
            return ok(token);
        } catch (e) {
            return err(`fatal: token signing failed: ${e}`);
        }
    }

    async login(credential: { id: Id; password: Password }) {
        try {
            if (!await fileExists(localFilePath)) return Err("login.fail.not_existing");

            const content = await Deno.readTextFile(localFilePath);
            const data = JSON.parse(content);

            // check file format
            if (!Array.isArray(data)) return Err("login.err.fmt_json");

            const userData = data.find((u) => u.id == credential.id);
            if (!userData) return Err("login.fail.not_existing");
            if (!await compare(credential.password, userData.password)) return Err("login.fail.verification");
            return this.genToken(credential.id);
        } catch (e) {
            // log here ...
            return err(`fatal: ${e}`);
        }
    }

    logout(token: string) {
        blacklistToken.add(token);
    }
}

export const authLocal = new AuthLocalController();
