import { Result } from "neverthrow"

export const isFatalErr = (r: Result<string, string>) => r.isErr() && r.error.toLowerCase().includes('fatal');

export const createSafeI18nT = (f?: Function) => (args: any) => (f ? f(args) : args);