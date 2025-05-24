import { Result } from "neverthrow";
import { dbAgent as agent } from "@db/dbService.ts";
import { T_REGISTER, T_TEST_ANALYSIS, T_USER_EXAM } from "@define/system.ts";
import type { Id, IdKey, IdMultiKey } from "@define/id.ts";
import type { Data } from "@db/dbService.ts";

class TestPrepPlanController {
    // async setTestPrepPlan(email: EmailKey<T_REGISTER>, test: EmailKey<T_TEST_ANALYSIS>, plan: Record<string, string[]>): Promise<Result<Data, string>> {

    //     // return await agent.setS

    //     return await agent.setSingleRowData(T_USER_EXAM, email, exam);
    // }

    // async getTestPrepPlan(email: EmailKeyOnAll<[T_REGISTER, T_USER_EXAM]>): Promise<Result<Data, string>> {
    //     return await agent.getSingleRowData(T_USER_EXAM, email);
    // }

    // async deleteTestPrepPlan(email: EmailKey<T_REGISTER>): Promise<Result<Data, string>> {
    //     return await agent.deleteRowData(T_USER_EXAM, email, true);
    // }
}

export const uec = new TestPrepPlanController();
