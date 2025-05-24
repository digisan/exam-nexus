import { OpenAPIHono } from "@hono/zod-openapi";

export const app = new OpenAPIHono();

export const blacklistToken = new Set();
