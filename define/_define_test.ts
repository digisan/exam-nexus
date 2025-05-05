import { type EmailKey, type EmailKeyOnAll, toEmailKey, toEmailKeyOnAll } from "@define/type.ts";
import { T_REGISTER, T_TEST } from "@define/system.ts";

const p = (u: EmailKey<T_REGISTER>) => {
    console.log(u);
};

const pp = (u: EmailKey<"test">) => {
    console.log(u);
};

const ppp = (u: EmailKeyOnAll<[T_REGISTER, T_TEST]>) => {
    console.log(u);
};

Deno.test(async function Test() {
    const s = "abcd@test.com";

    const r_ek1 = await toEmailKey(s, T_REGISTER);
    if (r_ek1.isErr()) {
        console.debug(r_ek1.error);
        return;
    }
    p(r_ek1.value);

    const r_ek2 = await toEmailKey(s, T_TEST);
    if (r_ek2.isErr()) {
        console.debug(r_ek2.error);
        return;
    }
    pp(r_ek2.value);

    const r_eka = await toEmailKeyOnAll(s, undefined, T_REGISTER, T_TEST);
    // const r_eka = await toEmailKeyOnAll(s, undefined, T_TEST, T_REGISTER) // 最好忽略顺序时候，也不报错
    if (r_eka.isErr()) {
        console.debug(r_eka.error);
        return;
    }
    const emailBoth = r_eka.value;
    ppp(emailBoth);
});
