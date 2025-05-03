import { type EmailKey, type EmailKeyOnAll, toEmailKey, toEmailKeyOnAll } from "@define/type.ts";
import { T_REGISTER, T_TEST } from "@define/system.ts";

const p = (u: EmailKey<T_REGISTER>) => {
    console.log(u)
}

const pp = (u: EmailKey<'test'>) => {
    console.log(u)
}

const ppp = (u: EmailKeyOnAll<[T_REGISTER, T_TEST]>) => {
    console.log(u)
}

Deno.test(async function Test() {

    const s = "abcd@test.com";

    const r_ek1 = await toEmailKey(s, T_REGISTER)
    if (r_ek1.isErr()) return;
    const email1 = r_ek1.value;
    p(email1);

    const r_ek2 = await toEmailKey(s, T_TEST)
    if (r_ek2.isErr()) return;
    const email2 = r_ek2.value;
    pp(email2);

    const r_eka = await toEmailKeyOnAll(s, T_REGISTER, T_TEST)
    // const r_eka = await toEmailKeyOnAll(s, T_TEST, T_REGISTER) // 最好忽略顺序时候，也不报错
    if (r_eka.isErr()) return;
    const emailBoth = r_eka.value;
    ppp(emailBoth);
});
