import { AuthController } from "@controllers/authController.ts";

Deno.test(async function AuthCtrlReg() {
    const ac = new AuthController();
    const result = await ac.register("user32@email.com", "pwd2")
    console.log(result)
});

Deno.test(async function AuthCtrlLogin() {
    const ac = new AuthController();
    const result = await ac.login("user32@email.com", "pwd2")
    console.log(result)
});

Deno.test(function AuthCtrlLogout() {
    const ac = new AuthController();
    ac.logout("abc")
    ac.logout("def")
    ac.logout("def")
});