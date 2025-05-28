import { Result } from "neverthrow";
import { dbAgent as agent } from "@db/dbService.ts";
import { T, type T_REGISTER, type T_USER_EXAM } from "@define/system.ts";
import type { ExamSelection } from "@define/exam/type.ts";
import type { Id } from "@define/id.ts";
import type { IdMKey, IdSKey } from "@define/id.ts";
import type { Data } from "@db/dbService.ts";

class UserExamController {
    // insert or update into T.USER_EXAM
    //
    async setUserExam(id: IdSKey<T_REGISTER>, exam: ExamSelection): Promise<Result<Data, string>> {
        return await agent.SetSingleRowData(T.USER_EXAM, id as unknown as Id, exam);
    }

    // get from T.USER_EXAM
    //
    async getUserExam(id: IdMKey<[T_REGISTER, T_USER_EXAM]>): Promise<Result<Data, string>> {
        return await agent.GetSingleRowData(T.USER_EXAM, id as unknown as IdSKey<T_REGISTER>);
    }

    // delete from T.USER_EXAM
    //
    async deleteUserExam(id: IdSKey<T_REGISTER>): Promise<Result<Data, string>> {
        return await agent.DeleteRowData(T.USER_EXAM, id as unknown as Id, true);
    }
}

export const uec = new UserExamController();
