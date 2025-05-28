import { err, Result } from "neverthrow";
import { dbAgent as agent } from "@db/dbService.ts";
import { K, type K_UID, T, type T_REGISTER, type T_TEST_PREP_PLAN } from "@define/system.ts";
import { type IdMKey, type IdSKey, type IdSKeyPart, type IdSKeyWithSKeyPart, isValidIdObj, toIdSKeyObj } from "@define/id.ts";
import type { Data } from "@db/dbService.ts";
import type { TestPrepPlan } from "@define/exam/type.ts";

class UserPrepPlanController {
    async setTestPrepPlan(uid: IdSKey<T_REGISTER>, plan: TestPrepPlan): Promise<Result<Data, string>> {
        const idobj = { uid, tid: plan.tid };
        if (!isValidIdObj(idobj, [K.UID, K.TID])) {
            return err(`❌ idobj is invalid as ${JSON.stringify(idobj)}`);
        }
        return await agent.SetSingleRowData(T.TEST_PREP_PLAN, idobj, plan);
    }

    async getTestPrepPlan(uid: IdSKeyWithSKeyPart<T_REGISTER, T_TEST_PREP_PLAN, K_UID>, tid: string): Promise<Result<Data, string>> {
        const idobj = { uid, tid };
        const r = await toIdSKeyObj(idobj, T.TEST_PREP_PLAN, [K.UID, K.TID]);
        if (r.isErr()) return r;
        return await agent.GetSingleRowData(T.TEST_PREP_PLAN, r.value, [K.UID, K.TID]);
    }

    async deleteTestPrepPlan(uid: IdSKey<T_REGISTER>, tid: string): Promise<Result<Data, string>> {
        const idobj = { uid, tid };
        if (!isValidIdObj(idobj, [K.UID, K.TID])) {
            return err(`❌ idobj is invalid as ${JSON.stringify(idobj)}`);
        }
        return await agent.DeleteRowData(T.TEST_PREP_PLAN, idobj, true);
    }
}

export const uplc = new UserPrepPlanController();
