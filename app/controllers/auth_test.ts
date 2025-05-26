import { isAllowedPassword, isEmail, toValidCredential } from "@define/type.ts";
import { auth } from "@app/controllers/auth.ts";

Deno.test("AuthCtrlReg", async () => {
    const email = "123470@qq.com";
    if (!isEmail(email)) {
        console.debug(`'${email}' is NOT valid Email`);
        return;
    }
    const password = "123abcDEF_";
    if (!isAllowedPassword(password)) {
        console.debug(`'${password}' is NOT valid Password`);
        return;
    }
    const result = await auth.register({ email, password });
    console.log(result);
});

Deno.test("AuthCtrlLogin", async () => {
    const r_cred = await toValidCredential({ email: "12347000@qq.com", password: "12345@ABCdef" });
    if (r_cred.isErr()) {
        console.log(r_cred.error);
        return;
    }
    const result = await auth.login(r_cred.value);
    console.log(result);
});

Deno.test("AuthCtrlLogout", () => {
    auth.logout("abc");
    auth.logout("def");
    auth.logout("def");
});
