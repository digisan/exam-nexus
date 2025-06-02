import { Result } from "neverthrow";
import { isValidId } from "@define/id.ts";
import { dbAgent as agent } from "@db/dbService.ts";
import { T } from "@define/system.ts";
import { Err } from "@i18n/lang_t.ts";
import { some } from "@util/util.ts";

export const log2db = async (msg: string, logId?: string) => {
    const id = some(logId) ? logId : new Date().toISOString();
    if (!isValidId(id!)) return Err(`id.invalid`);
    await agent.SetSingleRowData(T.DEV_TEST, id, { msg });
};

export const printResult = (r: Result<unknown, string>, abort: boolean = false, extra_err_msg: string = "") => {
    let extra = false;
    if (some(extra_err_msg)) {
        extra_err_msg = `(${extra_err_msg})`;
        extra = true;
    }
    if (r.isOk() && `${r.value}`.startsWith(`⚠️`)) { // refer to some supabase functions return
        console.debug(`${r.value}`);
        if (extra) console.debug(extra_err_msg);
        if (abort) throw Error(`${r.value}\n${extra_err_msg}`);
    } else {
        const msg = r.isOk() ? `✔️ ${JSON.stringify(r.value, null, 4)}` : `❌ ${r.error}`;
        console.debug(msg);
        if (r.isErr() && extra) console.debug(extra_err_msg);
        if (abort && r.isErr()) throw Error(`${msg}\n${extra_err_msg}`);
    }
};
