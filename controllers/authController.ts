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
                return {
                    success: false,
                    message: `${email} register failed as json file format error`,
                };
            }

            // check user existing status
            const exists = data.some((u) => u.email === email);
            if (exists) {
                return {
                    success: false,
                    message: `${email} already registered`,
                };
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

        return { success: true, message: `'${email}' registered successfully` };
    }

    async login(email: string, password: string) {
        const filePath = "./data/users.json";
        if (!await fileExists(filePath)) {
            return {
                success: false,
                message: `${email} hasn't been registered`,
                token: "",
            };
        }

        const content = await Deno.readTextFile(filePath);
        const data = JSON.parse(content);

        // check file format
        if (!Array.isArray(data)) {
            return {
                success: false,
                message: `${email} login failed as backend storage error`,
                token: "",
            };
        }

        // check user existing status
        // const exists = data.some((u) => u.email === email);
        // if (!exists) {
        //     return {
        //         success: false,
        //         message: `${email} hasn't been registered`,
        //         token: "",
        //     };
        // }

        const userData = data.find((u) => u.email == email);
        if (!userData) {
            return {
                success: false,
                message: `${email} hasn't been registered`,
                token: "",
            };
        }
        if (!await verify(password, userData.password)) {
            return {
                success: false,
                message: `invalid authorization info for '${email}'`,
                token: "",
            };
        }

        // create user session token
        const payload = {
            sub: email,
            role: "user",
            exp: Math.floor(Date.now() / 1000) + 60 * 100, // Token expires in 100 minutes
        };

        const token = await sign(payload, SIGNATUREKEY);
        return { success: true, message: `login ok`, token: token };
    }

    logout(token: string) {
        tokenBlacklist.add(token);
    }

    alreadyLogout(token: string) {
        return tokenBlacklist.has(token)
    }
}
