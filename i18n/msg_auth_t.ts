const keys = [
    "captcha.err",
    "captcha.fail",
    "register.err.fmt_json",
    "register.err._",
    "register.fail.invalid_id",
    "register.fail.invalid_email",
    "register.fail.weak_password",
    "register.fail.existing",
    "register.fail._",
    "register.ok.__",
    "register.ok._",
    "login.err.fmt_json",
    "login.err._",
    "login.fail.invalid_email",
    "login.fail.weak_password",
    "login.fail.not_existing",
    "login.fail.verification",
    "login.fail._",
    "login.ok.__",
    "login.ok._",
    "token.fail._"
] as const;

export type TranslationKey = typeof keys[number];

export type SafeT = (key: TranslationKey, params?: Record<string, unknown>) => string;

export const createSaferT = (f?: SafeT) => (args: TranslationKey) => (f ? f(args) : args);