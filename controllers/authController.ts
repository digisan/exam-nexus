import { ok, err } from "neverthrow";
import { sign } from "hono/jwt";
import { fileExists } from "@util/util.ts";
import { hash, verify } from "jsr:@felix/bcrypt";

const SIGNATUREKEY = "mySecretKey";
const tokenBlacklist = new Set();

export class AuthController {

    get SignatureKey() {
        return SIGNATUREKEY
    }

    async register(email: string, password: string) {
        const filePath = "./data/users.json";
        if (await fileExists(filePath)) {
            const content = await Deno.readTextFile(filePath);
            const data = JSON.parse(content);

            // check file format
            if (!Array.isArray(data)) {
                return err(`${email} register failed: json file format error`)
            }

            // check user existing status
            const exists = data.some((u) => u.email === email);
            if (exists) {
                return err(`${email} already registered`)
            }

            // insert with hashed password
            data.push({ email, password: await hash(password) });
            await Deno.writeTextFile(filePath, JSON.stringify(data, null, 4));

        } else {
            await Deno.writeTextFile(
                filePath,
                JSON.stringify(
                    [{ email, password: await hash(password) }],
                    null,
                    4,
                ),
            );
        }

        return ok(`'${email}' registered successfully`)
    }

    async login(email: string, password: string) {
        const filePath = "./data/users.json";
        if (!await fileExists(filePath)) {
            return err(`${email} hasn't been registered`)
        }

        const content = await Deno.readTextFile(filePath);
        const data = JSON.parse(content);

        // check file format
        if (!Array.isArray(data)) {
            return err(`${email} login failed as backend storage error`)
        }

        // check user existing status
        // const exists = data.some((u) => u.email === email);
        // if (!exists) {
        //     return err(`${email} hasn't been registered`)
        // }

        const userData = data.find((u) => u.email == email);
        if (!userData) {
            return err(`${email} hasn't been registered`)
        }
        if (!await verify(password, userData.password)) {
            return err(`invalid authorization info for '${email}'`)
        }

        // create user session token
        const payload = {
            sub: email,
            role: "user",
            exp: Math.floor(Date.now() / 1000) + 60 * 100, // Token expires in 100 minutes
        };

        const token = await sign(payload, SIGNATUREKEY);
        return ok(token)
    }

    logout(token: string) {
        tokenBlacklist.add(token);
    }

    alreadyLogout(token: string) {
        return tokenBlacklist.has(token)
    }
}
