import { err, Result } from "neverthrow";
import { dbAgent as agent } from "@db/dbService.ts";
import { type K_UID, T, type T_REGISTER, type T_USER_EXAM } from "@define/system.ts";
import type { ExamSelection } from "@define/exam/type.ts";
import { type Id, isValidIdObj, toIdSKeyObj } from "@define/id.ts";
import type { IdSKey, IdSKeyWithSKeyPart } from "@define/id.ts";
import type { Data } from "@db/dbService.ts";
import type { RegionType } from "@define/config.ts";
import { K } from "@define/system.ts";
import { type TransFnType, wrapOptT } from "@i18n/lang_t.ts";

class UserExamController {
    // insert or update into T.USER_EXAM
    //
    async setUserExam(uid: IdSKey<T_REGISTER>, region: RegionType, exam: ExamSelection, ct?: TransFnType): Promise<Result<Data, string>> {
        const t = wrapOptT(ct);
        const id = { uid: uid as unknown as Id, rid: region };
        if (!isValidIdObj(id, [K.UID, K.RID])) return err(t("param.invalid", { param: id }));
        return await agent.SetSingleRowData(T.USER_EXAM, id, exam);
    }

    // get from T.USER_EXAM
    //
    async getUserExam(uid: IdSKeyWithSKeyPart<T_REGISTER, T_USER_EXAM, K_UID>, region: RegionType, ct?: TransFnType): Promise<Result<Data, string>> {
        const t = wrapOptT(ct);
        const id = { uid: uid as unknown as Id, rid: region };
        const r_id = await toIdSKeyObj(id, T.USER_EXAM, [K.UID, K.RID]);
        if (r_id.isErr()) return err(t("param.invalid", { param: id }));
        return await agent.GetSingleRowData(T.USER_EXAM, r_id.value, undefined, [K.UID, K.RID]);
    }

    // delete from T.USER_EXAM
    //
    async deleteUserExam(uid: IdSKey<T_REGISTER>, region: RegionType, ct?: TransFnType): Promise<Result<Data, string>> {
        const t = wrapOptT(ct);
        const id = { uid: uid as unknown as Id, rid: region };
        if (!isValidIdObj(id, [K.UID, K.RID])) return err(t("param.invalid", { param: id }));
        return await agent.DeleteRowData(T.USER_EXAM, id, true);
    }
}

export const uec = new UserExamController();
