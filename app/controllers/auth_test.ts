import { isEmail, isAllowedPassword, toValidCredential } from "@define/type.ts";
import { auth } from "@app/controllers/auth.ts"

Deno.test(async function AuthCtrlReg() {
    const email = "123470@qq.com";
    if (!isEmail(email)) {
        console.debug(`'${email}' is NOT valid Email`)
        return
    }
    const password = "123abcDEF_";
    if (!isAllowedPassword(password)) {
        console.debug(`'${password}' is NOT valid Password`)
        return
    }
    const result = await auth.register({ email, password })
    console.log(result)
});

Deno.test(async function AuthCtrlLogin() {
    const r_cred = await toValidCredential({ email: "12347000@qq.com", password: "12345@ABCdef" })
    if (r_cred.isErr()) {
        console.log(r_cred.error)
        return
    }
    const result = await auth.login(r_cred.value)
    console.log(result)
});

Deno.test(function AuthCtrlLogout() {
    auth.logout("abc")
    auth.logout("def")
    auth.logout("def")
});