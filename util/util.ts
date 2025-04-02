import { ok, err, Result } from "neverthrow"
await import('@secret/const.ts')

const HCAPTCHA_SECRET = Deno.env.get("HCAPTCHA_SECRET");
const HCAPTCHA_VERIFY_URL = Deno.env.get("HCAPTCHA_VERIFY_URL");

export const isFatalErr = (r: Result<string, Error>) => r.isErr() && r.error.message.toLowerCase().includes('fatal');

export const createSafeI18nT = (f?: Function) => (args: any) => (f ? f(args) : args);

export const bools2idx = (...flags: boolean[]): number => {
    return flags.reduce((acc, flag, i) => acc | (+flag << (flags.length - 1 - i)), 0);
}

export const fileExists = async (path: string): Promise<boolean> => {
    try {
        await Deno.stat(path);
        return true;
    } catch (err) {
        if (err instanceof Deno.errors.NotFound) {
            return false;
        }
        throw err;
    }
}

export const getPublicIP = async () => {
    const response = await fetch("https://api.ipify.org");
    if (!response.ok) {
        console.log(`getPublicIP error! status: ${response.status}`);
        return ""
    }
    return await response.text();
}

export const verifyHCaptcha = async (token: string) => {

    if (!HCAPTCHA_SECRET || !HCAPTCHA_VERIFY_URL) {
        return err(`fatal: HCAPTCHA_SECRET and HCAPTCHA_VERIFY_URL must be provided!`)
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
        return ok(captchaVerifyData.success)
    } catch (e) {
        return err(`HCaptcha服务器错误: ${e}`)
    }
}
