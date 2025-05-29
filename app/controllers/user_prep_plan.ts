import { err, ok, Result } from "neverthrow";
import { dbAgent as agent } from "@db/dbService.ts";
import { K, type K_UID, T, type T_REGISTER, type T_TEST_PREP_PLAN } from "@define/system.ts";
import { type Id, type IdSKey, type IdSKeyWithSKeyPart, isValidIdObj, toIdSKeyObj, toIdSKeyWithSKeyPart } from "@define/id.ts";
import type { Data } from "@db/dbService.ts";
import type { TestPrepPlan } from "@define/exam/type.ts";
import { extractField, some } from "@util/util.ts";

class UserPrepPlanController {
    async setTestPrepPlan(uid: IdSKey<T_REGISTER>, plan: TestPrepPlan): Promise<Result<Data, string>> {
        const idobj = { uid, tid: plan.tid };
        if (!isValidIdObj(idobj, [K.UID, K.TID])) {
            return err(`❌ idobj is invalid as ${JSON.stringify(idobj)}`);
        }
        return await agent.SetSingleRowData(T.TEST_PREP_PLAN, idobj, plan);
    }

    async getTestPrepPlanList(uid: IdSKeyWithSKeyPart<T_REGISTER, T_TEST_PREP_PLAN, K_UID>): Promise<Result<Data, string>> {
        const r = await agent.GetDataRow(T.TEST_PREP_PLAN, uid as unknown as Id, K.UID);
        if (r.isErr()) return r;
        const tids = extractField(r.value as Record<string, any>[], "tid");
        return ok(tids);
    }

    async getTestPrepPlan(uid: IdSKeyWithSKeyPart<T_REGISTER, T_TEST_PREP_PLAN, K_UID>, ...tids: string[]): Promise<Result<Data, string>> {
        if (!some(tids)) {
            const r = await this.getTestPrepPlanList(uid);
            if (r.isErr()) return r;
            tids = r.value as unknown as string[];
        }
        const plans = [];
        for (const tid of tids) {
            const idobj = { uid, tid };
            const r = await toIdSKeyObj(idobj, T.TEST_PREP_PLAN, [K.UID, K.TID]);
            if (r.isErr()) return r;
            const rp = await agent.GetSingleRowData(T.TEST_PREP_PLAN, r.value, K.ID, [K.UID, K.TID]);
            if (rp.isErr()) return rp;
            plans.push(rp.value);
        }
        return ok(plans as unknown as Data);
    }

    async deleteTestPrepPlan(uid: IdSKey<T_REGISTER>, ...tids: string[]): Promise<Result<Data, string>> {
        if (!some(tids)) {
            const r_uid = await toIdSKeyWithSKeyPart(uid, T.REGISTER, T.TEST_PREP_PLAN, K.UID);
            if (r_uid.isErr()) return ok([]);
            const r_pl = await this.getTestPrepPlanList(r_uid.value);
            if (r_pl.isErr()) return r_pl;
            tids = r_pl.value as unknown as string[];
        }
        const deleted = [];
        for (const tid of tids) {
            const idobj = { uid, tid };
            if (!isValidIdObj(idobj, [K.UID, K.TID])) {
                return err(`❌ idobj is invalid as ${JSON.stringify(idobj)}`);
            }
            const r_d = await agent.DeleteRowData(T.TEST_PREP_PLAN, idobj, true);
            if (r_d.isErr()) continue;
            if (some(r_d.value)) deleted.push(tid);
        }
        return ok(deleted as unknown as Data);
    }
}

export const uplc = new UserPrepPlanController();
