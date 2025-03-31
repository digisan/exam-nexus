import { ok, err } from "neverthrow";
import { sign } from "hono/jwt";
import { fileExists } from "@util/util.ts";
import * as bcrypt from "jsr:@da/bcrypt";

const SIGNATURE_KEY = "mySecretKey";
const tokenBlacklist = new Set();

export class AuthController {

    get SignatureKey() {
        return SIGNATURE_KEY
    }

    async register(email: string, password: string, t: Function) {
        const filePath = "./data/users.json";
        if (await fileExists(filePath)) {
            const content = await Deno.readTextFile(filePath);
            const data = JSON.parse(content);

            // check file format
            if (!Array.isArray(data)) {
                return err(t('register.err.fmt_json'))
            }

            // check user existing status
            const exists = data.some((u) => u.email === email);
            if (exists) {
                return err(t('register.fail.existing'))
            }

            // insert with hashed password
            data.push({ email, password: await bcrypt.hash(password) });
            await Deno.writeTextFile(filePath, JSON.stringify(data, null, 4));

        } else {
            await Deno.writeTextFile(
                filePath,
                JSON.stringify(
                    [{ email, password: await bcrypt.hash(password) }],
                    null,
                    4,
                ),
            );
        }

        return ok(t('register.ok.to_route'))
    }

    async login(email: string, password: string, t: Function) {
        const filePath = "./data/users.json";
        if (!await fileExists(filePath)) {
            return err(t('login.fail.not_existing'))
        }

        const content = await Deno.readTextFile(filePath);
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

        const userData = data.find((u) => u.email == email);
        if (!userData) {
            return err(t('login.fail.not_existing'))
        }
        if (!await bcrypt.compare(password, userData.password)) {
            return err(t('login.fail.verification'))
        }

        // create user session token

        const expIn = 60 * 100 // Token expires in 100 minutes

        const payload = {
            sub: email,
            role: "user",
            exp: Math.floor(Date.now() / 1000) + expIn,
        };

        const token = await sign(payload, SIGNATURE_KEY);
        setTimeout(() => { tokenBlacklist.delete(token); }, expIn * 1100); // remove unnecessary blacklisted token
        return ok(token)
    }

    logout(token: string) {
        tokenBlacklist.add(token);
    }

    alreadyLogout(token: string) {
        return tokenBlacklist.has(token)
    }
}
