import { type EmailKey, toEmailKey } from "@define/type.ts";
import { T_REGISTER, T_TEST } from "@define/system.ts";

const p = (u: EmailKey<T_REGISTER>) => {
    console.log(u)
}

const pp = (u: EmailKey<'test'>) => {
    console.log(u)
}

const ppp = (u: EmailKey<T_TEST> & EmailKey<T_REGISTER> & EmailKey<'test'>) => {
    console.log(u)
}

const pppp = (u: EmailKey<'test' & 'register' & 'test1'>) => { // test1 应该提示错误！！！
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

    // const emailBoth = s // as EmailKey<T_REGISTER> & EmailKey<T_TEST>;
    // ppp(emailBoth);
    // pppp(emailBoth);

    // const emailBoth1 = s as EmailKey<T_REGISTER & T_TEST>;
    // pppp(emailBoth1);
});
