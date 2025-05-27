import { err, Result } from "neverthrow";
import type { TransFnType } from "@i18n/lang_t.ts";
import type { Data } from "@db/dbService.ts";
import { T } from "@define/system.ts";

class TestAnalysisController {
    // insert or update into T.TEST_ANALYSIS
    // async setTestAnalysis(analysis: Analysis, ct?: TransFnType): Promise<Result<Data, string>> {
    //     return err("");
    // }
}

export const tac = new TestAnalysisController();
