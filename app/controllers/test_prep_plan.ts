import { Result } from "neverthrow";
import { dbAgent as agent } from "@db/dbService.ts";
import { T, type T_REGISTER, type T_TEST_PREP_PLAN } from "@define/system.ts";
import type { IdKey, IdMultiKey } from "@define/id.ts";
import type { Data } from "@db/dbService.ts";
import type { Email, TestPrepPlan } from "@define/type.ts";

class TestPrepPlanController {
    async setTestPrepPlan(email: IdKey<T_REGISTER> & Email, plan: TestPrepPlan): Promise<Result<Data, string>> {
        return await agent.SetSingleRowData(T.TEST_PREP_PLAN, email, plan);
    }

    async getTestPrepPlan(email: IdMultiKey<[T_REGISTER, T_TEST_PREP_PLAN]> & Email): Promise<Result<Data, string>> {
        return await agent.GetSingleRowData(T.TEST_PREP_PLAN, email);
    }

    async deleteTestPrepPlan(email: IdKey<T_REGISTER> & Email): Promise<Result<Data, string>> {
        return await agent.DeleteRowData(T.TEST_PREP_PLAN, email, true);
    }
}

export const tpplc = new TestPrepPlanController();
