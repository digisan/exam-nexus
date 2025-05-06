import { isValidId } from "@define/type.ts";
import { err } from "neverthrow";
import { dbAgent as agent } from "@db/dbService.ts";
import { T_TEST } from "@define/system.ts";
import { type TransFnType, wrapOptT } from "@i18n/lang_t.ts";
import { some } from "@util/util.ts";

export const log2db = async (msg: string, logId?: string, ct?: TransFnType) => {
    const id = some(logId) ? logId : new Date().toISOString();
    const t = wrapOptT(ct);
    if (!isValidId(id!)) return err(t(`id.invalid`));
    await agent.setSingleRowData(T_TEST, id, { msg });
};
