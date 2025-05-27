import { isAllowedPassword, isEmail, toValidCredential } from "@define/type.ts";
import { auth } from "@app/controllers/auth.ts";
import { sleep } from "@util/util.ts";

Deno.test("AuthCtrlReg", async () => {
    const email = "cdutwhu@yeah.net";
    if (!isEmail(email)) {
        console.debug(`'${email}' is NOT valid Email`);
        return;
    }
    const password = "pa55w0rd@EXAM";
    if (!isAllowedPassword(password)) {
        console.debug(`'${password}' is NOT valid Password`);
        return;
    }
    const result = await auth.register({ email, password });
    console.log(result);
});

Deno.test("AuthCtrlLogin", async () => {
    const r_cred = await toValidCredential({
        email: "cdutwhu@yeah.net",
        password: "pa55w0rd@EXAM"
    });
    if (r_cred.isErr()) {
        console.log(r_cred.error);
        return;
    }
    const result = await auth.login(r_cred.value);
    console.log(result);

    await sleep(4000)
});

Deno.test("AuthCtrlLogout", () => {
    auth.logout("abc");
    auth.logout("def");
    auth.logout("def");
    console.log(`logout`)
});
