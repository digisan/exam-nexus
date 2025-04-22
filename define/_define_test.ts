import { type EmailKey, toEmailKey } from "@define/type.ts";
import { T_REGISTER } from "@define/system.ts";

const p = (u: EmailKey) => {
    console.log(u)
}

Deno.test(async function Test() {
    const s = "ccc@qq1.com";
    const email = await toEmailKey(s, T_REGISTER);
    if (!email) return;
    p(email);
});
