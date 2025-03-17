import { UserController } from "@controllers/userController.ts";

Deno.test(async function UserCtrlList() {
    const userCtrl = new UserController()
    console.log(await userCtrl.getUserList())
});

Deno.test(async function UserCtrlInfo() {
    const userCtrl = new UserController()
    console.log(await userCtrl.getUserInfo('user4'))
});