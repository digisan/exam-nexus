import type { Email } from "@define/type_b.ts";
import { fileExists } from "@util/util.ts";

export class UserController {
    async getUserList() {
        const filePath = "./data/users.json";
        if (await fileExists(filePath)) {
            const content = await Deno.readTextFile(filePath);
            const data = JSON.parse(content);
            if (!Array.isArray(data)) {
                return null;
            }
            return data.map((u) => u.email);
        }
        return null
    }

    async getUserInfo(email: Email) {
        const filePath = "./data/users.json";
        if (await fileExists(filePath)) {
            const content = await Deno.readTextFile(filePath);
            const data = JSON.parse(content);
            if (!Array.isArray(data)) {
                return null;
            }
            return data.find((u) => u.email == email);
        }
        return null
    }
}