import { assertEquals } from "jsr:@std/assert";
import { AuthController } from "./authController.ts";

Deno.test(async function AuthCtrlReg() {
    const ac = new AuthController();
    const result = await ac.register("user43", "pwd2", "user31@email.com")
    console.log(result)
});

Deno.test(async function AuthCtrlLogin() {
    const ac = new AuthController();
    const result = await ac.login("user43", "pwd2")
    console.log(result)
});