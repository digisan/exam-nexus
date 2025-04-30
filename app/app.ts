import { OpenAPIHono } from "@hono/zod-openapi";
import { singleton } from "@util/util.ts"

export const app = new (singleton(OpenAPIHono))();

export const blacklistToken = new (singleton(Set))();
