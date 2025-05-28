import { err, Result } from "neverthrow";
import { dbAgent as agent } from "@db/dbService.ts";
import { K, T, type T_REGISTER, type T_TEST_PREP_PLAN } from "@define/system.ts";
import { type Id, type IdKey, type IdMultiKey, isValidIdObj, toIdObjKey } from "@define/id.ts";
import type { Data } from "@db/dbService.ts";
import type { Email } from "@define/type.ts";
import type { TestPrepPlan } from "@define/exam/type.ts";

class UserPrepPlanController {
    async setTestPrepPlan(email: IdKey<T_REGISTER> & Email, plan: TestPrepPlan): Promise<Result<Data, string>> {
        const idobj = { uid: email, tid: plan.tid };
        if (!isValidIdObj(idobj, [K.UID, K.TID])) {
            return err(`❌ idobj is invalid as ${JSON.stringify(idobj)}`);
        }
        return await agent.SetSingleRowData(T.TEST_PREP_PLAN, idobj, plan);
    }

    async getTestPrepPlan(email: IdMultiKey<[T_REGISTER, T_TEST_PREP_PLAN]> & Email, tid: string): Promise<Result<Data, string>> {
        const idobj = { uid: email as Id, tid };
        const r = await toIdObjKey(idobj, T.TEST_PREP_PLAN, [K.UID, K.TID]);
        if (r.isErr()) return r;
        return await agent.GetSingleRowData(T.TEST_PREP_PLAN, r.value, [K.UID, K.TID]);
    }

    async deleteTestPrepPlan(email: IdKey<T_REGISTER> & Email, tid: string): Promise<Result<Data, string>> {
        const idobj = { uid: email, tid };
        if (!isValidIdObj(idobj, [K.UID, K.TID])) {
            return err(`❌ idobj is invalid as ${JSON.stringify(idobj)}`);
        }
        return await agent.DeleteRowData(T.TEST_PREP_PLAN, idobj, true);
    }
}

export const uplc = new UserPrepPlanController();
