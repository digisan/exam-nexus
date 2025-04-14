import { ok, err, Result } from "neverthrow"
await import('@secret/const.ts')

const HCAPTCHA_SECRET = Deno.env.get("HCAPTCHA_SECRET");
const HCAPTCHA_VERIFY_URL = Deno.env.get("HCAPTCHA_VERIFY_URL");

export const len = <T>(arr: T[] | null | undefined): number => arr?.length ?? 0;

export const lastElem = <T>(arr: T[] | null | undefined): T | undefined => arr?.[arr.length - 1];

export const false2err = (b: boolean, errMsg: string = 'false as error'): Result<boolean, string> => !b ? err(errMsg) : ok(b);

export const true2err = (b: boolean, errMsg: string = 'true as error'): Result<boolean, string> => b ? err(errMsg) : ok(b);

export const isEmail = (s: string): boolean => {
    const reg = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return reg.test(s)
}

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

export const verifyHCaptcha = async (token: string): Promise<Result<boolean, string>> => {
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
        if ('success' in captchaVerifyData && typeof captchaVerifyData.success === 'boolean') {
            return ok(captchaVerifyData.success as boolean)
        }
        return err(`fatal: HCaptcha verification returned result missing boolean 'success'`)

    } catch (e) {
        return err(`fatal: HCaptcha server error: ${e}`)
    }
}
