import { toIdKey, toIdMultiKey, toIdObjKey } from "@define/id.ts";
import type { IdKey, IdMultiKey, IdObjKey } from "@define/id.ts";
import type { K_TID, K_UID, T_REGISTER, T_TEST, T_TEST_2K } from "@define/system.ts";
import { K, T } from "@define/system.ts";

const p = (u: IdKey<T_TEST>) => {
    console.log(u);
};

const pp = (u: IdObjKey<T_TEST_2K, [K_UID, K_TID]>) => {
    console.log(u);
};

const ppp = (u: IdMultiKey<[T_TEST, T_REGISTER]>) => {
    console.log(u);
};

Deno.test(async function Test() {
    const s = "abcde";
    const r_k_test = await toIdKey(s, T.TEST);
    if (r_k_test.isErr()) {
        console.debug(r_k_test.error);
        return;
    }
    p(r_k_test.value);

    const so = {
        id1: "1234",
        id2: "abcde",
        // id3: "test"
    };
    const r_k_test2k = await toIdObjKey(so, T.TEST_2K, [K.UID, K.TID]);
    if (r_k_test2k.isErr()) {
        console.debug(r_k_test2k.error);
        return;
    }
    pp(r_k_test2k.value);

    const sm = "cdutwhu@yeah.net";
    const r_k_reg_test = await toIdMultiKey(sm, [T.REGISTER, T.TEST]);
    // const r_eka = await toEmailKeyOnAll(s, undefined, T_TEST, T_REGISTER) // 最好忽略顺序时候，也不报错
    if (r_k_reg_test.isErr()) {
        console.debug(r_k_reg_test.error);
        return;
    }
    const emailBoth = r_k_reg_test.value;
    ppp(emailBoth);
});
