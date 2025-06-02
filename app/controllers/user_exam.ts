import { ok, Result } from "neverthrow";
import { dbAgent as agent } from "@db/dbService.ts";
import { T, type T_REGISTER } from "@define/system.ts";
import { EXAMS_REGION, type ExamSelection, type ExamType } from "@define/exam/type.ts";
import { type Id, isValidIdObj } from "@define/id.ts";
import type { IdSKey } from "@define/id.ts";
import type { Data } from "@db/dbService.ts";
import type { RegionType } from "@define/config.ts";
import { K } from "@define/system.ts";
import { Err } from "@i18n/lang_t.ts";
import { some } from "@util/util.ts";

class UserExamController {
    // insert or update into T.USER_EXAM
    //
    async setUserExam(uid: IdSKey<T_REGISTER>, region: RegionType, selection: ExamSelection): Promise<Result<Data, string>> {
        const id = { uid: uid as unknown as Id, rid: region };
        if (!isValidIdObj(id, [K.UID, K.RID])) return Err("param.invalid");
        const exams = Object.keys(selection);
        if (!(exams.every((e) => EXAMS_REGION.get(region)!.includes(e as ExamType)))) {
            return Err("param.invalid");
        }
        return await agent.SetSingleRowData(T.USER_EXAM, id, selection);
    }

    // get from T.USER_EXAM
    //
    async getUserExam(uid: IdSKey<T_REGISTER>, region: RegionType): Promise<Result<Data, string>> {
        const id = { uid: uid as unknown as Id, rid: region };
        if (!isValidIdObj(id, [K.UID, K.RID])) return Err("param.invalid");
        const r = await agent.GetDataRow(T.USER_EXAM, id);
        if (r.isErr()) return r;
        if (!some(r.value)) return ok({});
        if (!("data" in r.value!)) return Err("get.db.fail_data_missing");
        return ok(r.value.data as unknown as Data);
    }

    // delete from T.USER_EXAM
    //
    async deleteUserExam(uid: IdSKey<T_REGISTER>, region: RegionType): Promise<Result<Data, string>> {
        const id = { uid: uid as unknown as Id, rid: region };
        if (!isValidIdObj(id, [K.UID, K.RID])) return Err("param.invalid");
        return await agent.DeleteRowData(T.USER_EXAM, id, true);
    }
}

export const uec = new UserExamController();
