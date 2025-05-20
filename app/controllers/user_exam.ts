import { Result } from "neverthrow";
import { dbAgent as agent } from "@db/dbService.ts";
import { T_REGISTER, T_USER_EXAM } from "@define/system.ts";
import type { Email, EmailKey, EmailKeyOnAll } from "@define/type.ts";
import type { Data } from "@db/dbService.ts";
import { singleton } from "@util/util.ts";

class UserExamController {
    async getUserExam(email: EmailKeyOnAll<[T_REGISTER, T_USER_EXAM]>): Promise<Result<Data, string>> {
        return await agent.getSingleRowData(T_USER_EXAM, email as unknown as EmailKey<T_USER_EXAM>);
    }

    async setUserExam(email: EmailKey<T_REGISTER>, exam: Record<string, string[]>): Promise<Result<Data, string>> {
        return await agent.setSingleRowData(T_USER_EXAM, email as unknown as Email, exam);
    }

    async deleteUserExam(email: EmailKey<T_REGISTER>): Promise<Result<Data, string>> {
        return await agent.deleteRowData(T_USER_EXAM, email as unknown as Email, true);
    }
}

export const uec = new (singleton(UserExamController))();
