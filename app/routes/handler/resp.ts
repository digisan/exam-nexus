import type { Context } from "hono";
import type { TransKeyType } from "@i18n/lang_t.ts";
import { createStrictT } from "@i18n/lang_t.ts";
import { type ContentfulStatusCode } from "jsr:@hono/hono/utils/http-status";
import { singleton } from "@util/util.ts";

const stringifyValues = (input?: Record<string, unknown>): Record<string, string> | undefined => {
    if (!input) return undefined;
    return Object.fromEntries(
        Object.entries(input).map(([key, value]) => [key, JSON.stringify(value)]),
    );
};

const genFnText = (n: ContentfulStatusCode) => {
    return (c: Context, key: TransKeyType, params?: Record<string, unknown>) => {
        const t = createStrictT(c);
        return c.text(t(key, stringifyValues(params)), n);
    };
};

const genFnNull = (n: number = 204) => {
    return (p: null | [] | Record<string | number | symbol, never> | "" = null) => {
        return new (singleton(Response))(p, { status: n });
    };
};

export const t200 = genFnText(200);
export const t201 = genFnText(201);
export const n204 = genFnNull(204);
export const t400 = genFnText(400);
export const t401 = genFnText(401);
export const t402 = genFnText(402);
export const t403 = genFnText(403);
export const t404 = genFnText(404);
export const t429 = genFnText(429);
export const t500 = genFnText(500);
