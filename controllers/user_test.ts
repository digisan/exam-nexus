import { Email } from "@util/util.ts";
import { UserController } from "./user.ts";

Deno.test(async function UserCtrlList() {
    const userCtrl = new UserController()
    console.log(await userCtrl.getUserList())
});

Deno.test(async function UserCtrlInfo() {
    const userCtrl = new UserController()
    console.log(await userCtrl.getUserInfo('user32@email.com' as Email))
});