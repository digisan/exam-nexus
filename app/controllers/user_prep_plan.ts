import { err, ok, Result } from "neverthrow";
import { dbAgent as agent } from "@db/dbService.ts";
import { K, type K_UID, T, type T_REGISTER, type T_TEST_PREP_PLAN } from "@define/system.ts";
import { type Id, type IdSKey, type IdSKeyWithSKeyPart, isValidIdObj, toIdSKey, toIdSKeyObj } from "@define/id.ts";
import type { Data } from "@db/dbService.ts";
import type { TestPrepPlan } from "@define/exam/type.ts";
import { extractField, some } from "@util/util.ts";

class UserPrepPlanController {
    async setTestPrepPlan(uid: IdSKey<T_REGISTER>, ...plans: TestPrepPlan[]): Promise<Result<Data, string>> {
        const setGroup = [];
        for (const plan of plans) {
            const id = { uid, tid: plan.tid };
            if (!isValidIdObj(id, [K.UID, K.TID])) {
                return err(`❌ id is invalid as ${JSON.stringify(id)}`);
            }
            const r = await agent.SetSingleRowData(T.TEST_PREP_PLAN, id, plan);
            if (r.isErr()) return err(r.error);
            if (r.value) setGroup.push(r.value);
        }
        return ok(setGroup);
    }

    async getTestPrepPlanList(uid: IdSKey<T_REGISTER>): Promise<Result<Data, string>> {
        const r = await agent.GetDataRow(T.TEST_PREP_PLAN, uid as unknown as Id, K.UID);
        if (r.isErr()) return r;
        if (Array.isArray(r.value)) {
            return ok(extractField(r.value as Record<string, any>[], "tid"));
        } else {
            if (some(r.value)) return ok([(r.value as Record<string, any>)["tid"]]);
            return ok([]);
        }
    }

    async getTestPrepPlan(uid: IdSKeyWithSKeyPart<T_REGISTER, T_TEST_PREP_PLAN, K_UID>, ...tids: string[]): Promise<Result<Data, string>> {
        if (!some(tids)) {
            const r = await this.getTestPrepPlanList(uid as unknown as IdSKey<T_REGISTER>);
            if (r.isErr()) return r;
            tids = r.value as unknown as string[];
        }
        const plans = [];
        for (const tid of tids) {
            const id = { uid, tid };
            const r = await toIdSKeyObj(id, T.TEST_PREP_PLAN, [K.UID, K.TID]);
            if (r.isErr()) return r;
            const rp = await agent.GetSingleRowData(T.TEST_PREP_PLAN, r.value, K.ID, [K.UID, K.TID]);
            if (rp.isErr()) return rp;
            plans.push(rp.value);
        }
        return ok(plans as unknown as Data);
    }

    async deleteTestPrepPlan(uid: IdSKey<T_REGISTER>, ...tids: string[]): Promise<Result<Data, string>> {
        if (!some(tids)) {
            const r_uid = await toIdSKey(uid, T.REGISTER);
            if (r_uid.isErr()) return ok([]);
            const r_pl = await this.getTestPrepPlanList(r_uid.value);
            if (r_pl.isErr()) return r_pl;
            tids = r_pl.value as unknown as string[];
        }
        const deleted = [];
        for (const tid of tids) {
            const id = { uid, tid };
            if (!isValidIdObj(id, [K.UID, K.TID])) {
                return err(`❌ id is invalid as ${JSON.stringify(id)}`);
            }
            const r_d = await agent.DeleteRowData(T.TEST_PREP_PLAN, id, true);
            if (r_d.isErr()) continue;
            if (some(r_d.value)) deleted.push(tid);
        }
        return ok(deleted as unknown as Data);
    }
}

export const uplc = new UserPrepPlanController();
