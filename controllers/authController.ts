import { sign } from "hono/jwt";
import { fileExists } from "@util/util.ts";
import { hash, verify } from "jsr:@felix/bcrypt";

const SIGNATUREKEY = "mySecretKey";

export class AuthController {

    get SignatureKey() {
        return SIGNATUREKEY
    }

    async register(username: string, password: string, email: string) {
        const filePath = "./data/users.json";
        if (await fileExists(filePath)) {
            const content = await Deno.readTextFile(filePath);
            const data = JSON.parse(content);

            // check file format
            if (!Array.isArray(data)) {
                return {
                    success: false,
                    message: `${username} register failed as json file format error`,
                };
            }

            // check user existing status
            const exists = data.some((u) =>
                u.username === username ||
                u.email === email
            );
            if (exists) {
                return {
                    success: false,
                    message: `${username} already registered`,
                };
            }

            // insert with hashed password
            data.push({ username, password: await hash(password), email });
            await Deno.writeTextFile(filePath, JSON.stringify(data, null, 4));

        } else {
            await Deno.writeTextFile(
                filePath,
                JSON.stringify(
                    [{ username, password: await hash(password), email }],
                    null,
                    4,
                ),
            );
        }

        return { success: true, message: `'${username}' registered successfully` };
    }

    async login(username: string, password: string) {
        const filePath = "./data/users.json";
        if (!await fileExists(filePath)) {
            return {
                success: false,
                message: `${username} hasn't been registered`,
                token: "",
            };
        }

        const content = await Deno.readTextFile(filePath);
        const data = JSON.parse(content);

        // check file format
        if (!Array.isArray(data)) {
            return {
                success: false,
                message: `${username} login failed as backend storage error`,
                token: "",
            };
        }

        // check user existing status
        // const exists = data.some((u) => u.username === username);
        // if (!exists) {
        //     return {
        //         success: false,
        //         message: `${username} hasn't been registered`,
        //         token: "",
        //     };
        // }

        const userData = data.find((u) => u.username == username);
        if (!userData) {
            return {
                success: false,
                message: `${username} hasn't been registered`,
                token: "",
            };
        }
        if (!await verify(password, userData.password)) {
            return {
                success: false,
                message: `invalid authorization info for '${username}'`,
                token: "",
            };
        }

        // create user session token
        const payload = {
            sub: username,
            role: "user",
            exp: Math.floor(Date.now() / 1000) + 60 * 1, // Token expires in 1 minutes
        };


        const token = await sign(payload, SIGNATUREKEY);
        return { success: true, message: `login ok`, token: token };
    }

    async logout(username: string) {

    }
}
