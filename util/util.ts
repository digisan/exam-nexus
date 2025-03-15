import { ok, err } from "neverthrow";

export const getPublicIP = async () => {
    const response = await fetch("https://api.ipify.org");
    if (!response.ok) {
        console.log(`getPublicIP error! status: ${response.status}`);
        return ""
    }
    return await response.text();
}

const HCAPTCHA_VERIFY_URL = "https://api.hcaptcha.com/siteverify"
const HCAPTCHA_SECRET = "ES_d9b1e2678035429d92d31e64f99227b6"; // hCaptcha 私钥

export const verifyHCaptcha = async (token: string) => {
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
        return ok(captchaVerifyData.success)
    } catch (error) {
        return err(`HCaptcha服务器错误: ${error}`)
    }
}
