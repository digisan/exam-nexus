import { isEmail } from "@define/type.ts";
import { uc } from "@app/controllers/local/userLocal.ts";

Deno.test("UserCtrlList", async () => {
    console.log(await uc.getUserList());
});

Deno.test("UserCtrlInfo", async () => {
    const email = "user32@email.com";
    if (!isEmail(email)) {
        return;
    }
    console.log(await uc.getUserReg(email));
});
