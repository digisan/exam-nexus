import { Result } from "neverthrow";
import { dbAgent as agent } from "@db/dbService.ts";
import { T, type T_REGISTER, type T_USER_EXAM } from "@define/system.ts";
import type { Email } from "@define/type.ts";
import type { IdKey, IdMultiKey } from "@define/id.ts";
import type { Data } from "@db/dbService.ts";

class UserExamController {
    async setUserExam(email: IdKey<T_REGISTER> & Email, exam: Record<string, string[]>): Promise<Result<Data, string>> {
        return await agent.SetSingleRowData(T.USER_EXAM, email, exam);
    }

    async getUserExam(email: IdMultiKey<[T_REGISTER, T_USER_EXAM]> & Email): Promise<Result<Data, string>> {
        return await agent.GetSingleRowData(T.USER_EXAM, email);
    }

    async deleteUserExam(email: IdKey<T_REGISTER> & Email): Promise<Result<Data, string>> {
        return await agent.DeleteRowData(T.USER_EXAM, email, true);
    }
}

export const uec = new UserExamController();
