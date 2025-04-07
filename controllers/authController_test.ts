import { AuthController } from "@controllers/authController.ts";

Deno.test(async function AuthCtrlReg() {
    const ac = new AuthController();
    const result = await ac.register({ email: "1234578@qq.com", password: "1234567" })
    console.log(result)
});

Deno.test(async function AuthCtrlLogin() {
    const ac = new AuthController();
    const result = await ac.login({ email: "12347@qq.com", password: "1234567" })
    console.log(result)
});

Deno.test(function AuthCtrlLogout() {
    const ac = new AuthController();
    ac.logout("abc")
    ac.logout("def")
    ac.logout("def")
});