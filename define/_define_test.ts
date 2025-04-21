import { type EmailExist, toExistEmail } from "@define/type.ts";

const p = (u: EmailExist) => {
    console.log(u)
}

Deno.test(async function Test() {
    const s = "ccc@qq1.com";
    const existEmail = await toExistEmail(s);
    if (!existEmail) return;
    p(existEmail);
});
