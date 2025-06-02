import { toIdSKey } from "@define/id.ts";
import { uc } from "@app/controllers/users.ts";
import { printResult } from "@util/log.ts";
import { T } from "@define/system.ts";

Deno.test("UserCtrlList", async () => {
    const r = await uc.getUserList();
    printResult(r, true);
});

Deno.test("UserCtrlInfo", async () => {
    const id = "cdutwhu@yeah.net";
    const r_id = await toIdSKey(id, T.REGISTER);
    if (r_id.isErr()) {
        printResult(r_id, true);
        return;
    }
    const r = await uc.getUserReg(r_id.value);
    printResult(r, true);
});
