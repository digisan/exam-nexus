import { err, ok, Result } from "neverthrow";
import type { Id } from "@define/id.ts";
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
            return ok(data.map((u) => u.id));
        }
        return err(`invalid filePath: ${filePath}`);
    }

    async getUserReg(filePath: string, id: Id): Promise<Result<Data, string>> {
        if (await fileExists(filePath)) {
            const content = await Deno.readTextFile(filePath);
            const data = JSON.parse(content);
            if (!Array.isArray(data)) {
                return ok(null);
            }
            return ok(data.find((u) => u.id === id));
        }
        return err(`invalid filePath: ${filePath}`);
    }
}

export const uc = new UserController();
