import { fileExists } from "../util/util.ts";

export class UserController {
    async getUserList() {
        const filePath = "./data/users.json";
        if (await fileExists(filePath)) {
            const content = await Deno.readTextFile(filePath);
            const data = JSON.parse(content);
            if (!Array.isArray(data)) {
                return null;
            }
            return data.map((u) => u.username);
        }
        return null
    }

    async getUserInfo(username: string) {
        const filePath = "./data/users.json";
        if (await fileExists(filePath)) {
            const content = await Deno.readTextFile(filePath);
            const data = JSON.parse(content);
            if (!Array.isArray(data)) {
                return null;
            }
            return data.find((u) => u.username == username);
        }
        return null
    }
}