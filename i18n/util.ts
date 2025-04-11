import { Result } from "neverthrow"
import type { SafeT } from "@i18n/msg_auth_t.ts";

export const isFatalErr = (r: Result<any, string>) => r.isErr() && r.error.toLowerCase().includes('fatal');

export const isNotFatal = (r: Result<any, string>) => !isFatalErr(r);

export const createSaferT = (f?: SafeT) => (args: any) => (f ? f(args) : args);