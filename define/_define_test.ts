import { toIdKey, toIdMultiKey, toIdObjKey } from "@define/id.ts";
import type { IdKey, IdMultiKey, IdObjKey } from "@define/id.ts";
import type { K_TID, K_UID, T_DEV_TEST, T_DEV_TEST_2K, T_REGISTER } from "@define/system.ts";
import { K, T } from "@define/system.ts";

const p = (u: IdKey<T_DEV_TEST>) => {
    console.log(u);
};

const pp = (u: IdObjKey<T_DEV_TEST_2K, [K_UID, K_TID]>) => {
    console.log(u);
};

const ppp = (u: IdMultiKey<[T_DEV_TEST, T_REGISTER]>) => {
    console.log(u);
};

Deno.test("Define Test", async () => {
    const s = "abcde";
    const r_k_test = await toIdKey(s, T.DEV_TEST);
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
    const r_k_test2k = await toIdObjKey(so, T.DEV_TEST_2K, [K.UID, K.TID]);
    if (r_k_test2k.isErr()) {
        console.debug(r_k_test2k.error);
        return;
    }
    pp(r_k_test2k.value);

    const sm = "cdutwhu@yeah.net";
    const r_k_reg_test = await toIdMultiKey(sm, [T.REGISTER, T.DEV_TEST]);
    // const r_eka = await toEmailKeyOnAll(s, undefined, T_DEV_TEST, T_REGISTER) // 最好忽略顺序时候，也不报错
    if (r_k_reg_test.isErr()) {
        console.debug(r_k_reg_test.error);
        return;
    }
    const emailBoth = r_k_reg_test.value;
    ppp(emailBoth);
});
