import { err, Result } from "neverthrow";
import { isValidId } from "@define/id.ts";
import { dbAgent as agent } from "@db/dbService.ts";
import { T } from "@define/system.ts";
import { type TransFnType, wrapOptT } from "@i18n/lang_t.ts";
import { some } from "@util/util.ts";

export const log2db = async (msg: string, logId?: string, ct?: TransFnType) => {
    const id = some(logId) ? logId : new Date().toISOString();
    const t = wrapOptT(ct);
    if (!isValidId(id!)) return err(t(`id.invalid`));
    await agent.SetSingleRowData(T.TEST, id, { msg });
};

export const printResult = (r: Result<unknown, string>, abort: boolean = false) => {
    if (r.isOk() && `${r.value}`.startsWith(`⚠️`)) { // refer to supabase some functions return
        console.debug(`${r.value}`);
        if (abort) throw Error(`${r.value}`);
    } else {
        const msg = r.isOk() ? `✔️ ${JSON.stringify(r.value, null, 4)}` : `❌ ${r.error}`;
        console.debug(msg);
        if (abort && r.isErr()) throw Error(msg);
    }
};
