import { AuthController } from "./auth.ts";
import { isEmail, isAllowedPassword } from "@define/type.ts";

Deno.test(async function AuthCtrlReg() {
    const ac = new AuthController();
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
    const result = await ac.register({ email, password })
    console.log(result)
});

Deno.test(async function AuthCtrlLogin() {
    const ac = new AuthController();
    const email = "12347000@qq.com";
    if (!isEmail(email)) {
        return
    }
    const password = "12345";
    if (!isAllowedPassword(password)) {
        return
    }
    const result = await ac.login({ email, password })
    console.log(result)
});

Deno.test(function AuthCtrlLogout() {
    const ac = new AuthController();
    ac.logout("abc")
    ac.logout("def")
    ac.logout("def")
});