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

    const email1 = await toEmailKey(s, T_REGISTER)
    if (!email1) return;
    p(email1);

    const email2 = await toEmailKey(s, T_TEST)
    if (!email2) return;
    pp(email2);

    const emailBoth = await toEmailKeyOnAll(s, T_REGISTER, T_TEST)
    // const emailBoth = await toEmailKeyOnAll(s, T_TEST, T_REGISTER) // 最好忽略顺序时候，也不报错
    if (!emailBoth) return;
    ppp(emailBoth);
});
