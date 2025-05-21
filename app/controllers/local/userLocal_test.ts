import { isEmail } from "@define/type.ts";
import { uc } from "@app/controllers/local/userLocal.ts";

Deno.test(async function UserCtrlList() {
    console.log(await uc.getUserList());
});

Deno.test(async function UserCtrlInfo() {
    const email = "user32@email.com";
    if (!isEmail(email)) {
        return;
    }
    console.log(await uc.getUserReg(email));
});
