import { isEmail } from "@define/type_b.ts";
import { UserController } from "./userLocal.ts";

Deno.test(async function UserCtrlList() {
    const userCtrl = new UserController()
    console.log(await userCtrl.getUserList())
});

Deno.test(async function UserCtrlInfo() {
    const userCtrl = new UserController()
    const email = 'user32@email.com'
    if (!isEmail(email)) {
        return
    }
    console.log(await userCtrl.getUserInfo(email))
});