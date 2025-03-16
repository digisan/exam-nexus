import { assertEquals } from "jsr:@std/assert";
import { UserController } from "./userController.ts";

Deno.test(async function UserCtrlList() {
    const userCtrl = new UserController()
    console.log(await userCtrl.getUserList())
});

Deno.test(async function UserCtrlInfo() {
    const userCtrl = new UserController()
    console.log(await userCtrl.getUserInfo('user4'))
});