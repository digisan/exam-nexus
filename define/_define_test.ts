import { type EmailKey, toEmailKey } from "@define/type.ts";

const p = (u: EmailKey<'register'>) => {
    console.log(u)
}

const pp = (u: EmailKey<'test'>) => {
    console.log(u)
}

const ppp = (u: EmailKey<'test'> & EmailKey<'register'>) => {
    console.log(u)
}

Deno.test(async function Test() {

    const s = "abcd";
    const email1 = await toEmailKey(s, 'register')
    if (!email1) return;
    p(email1);

    const email2 = await toEmailKey(s, 'test')
    if (!email2) return;
    pp(email2);

    const emailBoth = s as EmailKey<'register'> & EmailKey<'test'>;
    ppp(emailBoth);
});
