import { getConnInfo } from "hono/deno";
import type { Context, Next } from "hono";
import { t429 } from "@app/routes/handler/resp.ts";

const mRateLimit = new Map();

export const rateControl = (limit = 5, duration = 2 * 1000, blockTime = 5 * 1000) => {
    return async (c: Context, next: Next) => {
        const info = getConnInfo(c);
        const ip = info.remote.address;
        const path = c.req.path;
        const key = `${ip}:${path}`;

        // console.log(key)

        const now = Date.now();
        let record = mRateLimit.get(key);

        if (!record) {
            record = { count: 0, startTime: now, blockedUntil: 0 };
            mRateLimit.set(key, record);
        }

        if (record.blockedUntil > now) {
            // record.blockedUntil = now + blockTime
            return t429(c, "access.wait_frequently");
        }

        // normal access
        if (now - record.startTime > duration) {
            record.count = 0;
            record.startTime = now;
        }

        record.count++;

        if (record.count > limit) {
            record.blockedUntil = now + blockTime;
            return t429(c, "access.block_frequently");
        }

        await next();
    };
};
