import { err, ok, Result } from "neverthrow";
import type { Id, IdSKey } from "@define/id.ts";
import type { Data } from "@db/dbService.ts";
import { dbAgent as agent } from "@db/dbService.ts";
import { K, T, type T_REGISTER } from "@define/system.ts";

class UserController {
    async getUserList(): Promise<Result<Id[], string>> {
        const r = await agent.QueryId(T.REGISTER, K.ID);
        if (r.isErr()) return err(r.error);
        return ok(r.value as Id[]);
    }

    async getUserReg(id: IdSKey<T_REGISTER>): Promise<Result<Data, string>> {
        const r = await agent.GetSingleRowData(T.REGISTER, id);
        if (r.isErr()) return err(r.error);
        return ok(r.value);
    }
}

export const uc = new UserController();
