import { err, ok, Result } from "neverthrow";
import { env_get } from "@define/env.ts";
await import("@define/env.ts");

const HCAPTCHA_SECRET = env_get("HCAPTCHA_SECRET");
const HCAPTCHA_VERIFY_URL = env_get("HCAPTCHA_VERIFY_URL");

export const verifyHCaptcha = async (token: string): Promise<Result<boolean, string>> => {
    if (!HCAPTCHA_SECRET || !HCAPTCHA_VERIFY_URL) {
        return err(`fatal: HCAPTCHA_SECRET and HCAPTCHA_VERIFY_URL must be provided!`);
    }
    try {
        const captchaVerifyRes = await fetch(HCAPTCHA_VERIFY_URL, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                secret: HCAPTCHA_SECRET,
                response: token,
            }),
        });
        const captchaVerifyData = await captchaVerifyRes.json();
        if ("success" in captchaVerifyData && typeof captchaVerifyData.success === "boolean") {
            return ok(captchaVerifyData.success as boolean);
        }
        return err(`fatal: HCaptcha verification returned result missing boolean 'success'`);
    } catch (e) {
        return err(`fatal: HCaptcha server error: ${e}`);
    }
};
