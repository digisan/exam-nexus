import { err, ok, Result } from "neverthrow";
import type { Email } from "@define/type.ts";
import { fileExists } from "@util/util.ts";
import type { Data } from "@db/dbService.ts";

class UserController {
    async getUserList(filePath: string): Promise<Result<Data, string>> {
        if (await fileExists(filePath)) {
            const content = await Deno.readTextFile(filePath);
            const data = JSON.parse(content);
            if (!Array.isArray(data)) {
                return ok(null);
            }
            return ok(data.map((u) => u.email));
        }
        return err(`invalid filePath: ${filePath}`);
    }

    async getUserReg(filePath: string, email: Email): Promise<Result<Data, string>> {
        if (await fileExists(filePath)) {
            const content = await Deno.readTextFile(filePath);
            const data = JSON.parse(content);
            if (!Array.isArray(data)) {
                return ok(null);
            }
            return ok(data.find((u) => u.email == email));
        }
        return err(`invalid filePath: ${filePath}`);
    }
}

export const uc = new UserController();
