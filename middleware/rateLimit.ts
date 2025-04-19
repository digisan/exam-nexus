import { getConnInfo } from 'hono/deno'
import { type Next } from "hono";

const rateLimitMap = new Map()

const rateLimitMiddleware = (limit = 5, duration = 2 * 1000, blockTime = 5 * 1000) => {
    return async (c: any, next: Next) => {

        const info = getConnInfo(c)
        const ip = info.remote.address

        const path = c.req.path
        const key = `${ip}:${path}`

        // console.log(key)

        const now = Date.now()
        let record = rateLimitMap.get(key)

        if (!record) {
            record = { count: 0, startTime: now, blockedUntil: 0 }
            rateLimitMap.set(key, record)
        }

        if (record.blockedUntil > now) {
            // record.blockedUntil = now + blockTime
            return c.text('Too Many Requests - Access Later', 429)
        }

        // normal access
        if (now - record.startTime > duration) {
            record.count = 0
            record.startTime = now
        }

        record.count++

        if (record.count > limit) {
            record.blockedUntil = now + blockTime
            return c.text('Too Many Requests - Temporarily Blocked', 429)
        }

        await next()
    }
}

export { rateLimitMiddleware }
