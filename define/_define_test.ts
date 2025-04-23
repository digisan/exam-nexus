import { type EmailKey, toEmailKey } from "@define/type.ts";

const p = (u: EmailKey<'t_register'>) => {
    console.log(u)
}

const pp = (u: EmailKey<'t_test'>) => {
    console.log(u)
}

const ppp = (u: EmailKey<'t_test'> & EmailKey<'t_register'>) => {
    console.log(u)
}

Deno.test(async function Test() {

    const s = "abcd";
    const email1 = await toEmailKey(s, 't_register')
    if (!email1) return;
    p(email1);

    const email2 = await toEmailKey(s, 't_test')
    if (!email2) return;
    pp(email2);

    const emailBoth = s as EmailKey<'t_register'> & EmailKey<'t_test'>;
    ppp(emailBoth);
});
