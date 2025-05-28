import { toIdMKey, toIdSKey, toIdSKeyObj } from "@define/id.ts";
import type { IdMKey, IdSKey, IdSKeyObj } from "@define/id.ts";
import type { K_TID, K_UID, T_DEV_TEST, T_DEV_TEST_2K, T_REGISTER } from "@define/system.ts";
import { K, T } from "@define/system.ts";

const p = (u: IdSKey<T_DEV_TEST>) => {
    console.log(u);
};

const pp = (u: IdSKeyObj<T_DEV_TEST_2K, [K_UID, K_TID]>) => {
    console.log(u);
};

const ppp = (u: IdMKey<[T_DEV_TEST, T_REGISTER]>) => {
    console.log(u);
};

Deno.test("Define Test", async () => {
    const s = "g18FT9";
    const r_k_test = await toIdSKey(s, T.DEV_TEST);
    if (r_k_test.isErr()) {
        console.debug(r_k_test.error);
        return;
    }
    p(r_k_test.value);

    const so = {
        uid: "0IRtZMC",
        tid: "AqJ66Teyr5W",
    };
    const r_k_test2k = await toIdSKeyObj(so, T.DEV_TEST_2K, [K.UID, K.TID]);
    if (r_k_test2k.isErr()) {
        console.debug(r_k_test2k.error);
        return;
    }
    pp(r_k_test2k.value);

    const sm = "cdutwhu@yeah.net";
    const r_k_reg_test = await toIdMKey(sm, [T.REGISTER, T.DEV_TEST]);
    // const r_eka = await toEmailKeyOnAll(s, undefined, T_DEV_TEST, T_REGISTER) // 最好忽略顺序时候，也不报错
    if (r_k_reg_test.isErr()) {
        console.debug(r_k_reg_test.error);
        return;
    }
    const emailBoth = r_k_reg_test.value;
    ppp(emailBoth);
});
