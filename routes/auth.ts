import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";

const app = new OpenAPIHono();

app.post('/login', (ctx) => {
    return ctx.json({ message: 'Login' });
});

app.post('/register', (ctx) => {
    return ctx.json({ message: 'Register' });
});

export default app;
