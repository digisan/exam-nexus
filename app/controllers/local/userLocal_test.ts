import { isValidId } from "@define/id.ts";
import { uc } from "@app/controllers/local/userLocal.ts";

Deno.test("UserCtrlList", async () => {
    console.log(await uc.getUserList("./data/users.json"));
});

Deno.test("UserCtrlInfo", async () => {
    const id = "user32@gmail.com";
    if (!isValidId(id)) {
        return;
    }
    console.log(await uc.getUserReg("./data/users.json", id));
});
