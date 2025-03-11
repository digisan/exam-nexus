import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { sign } from "hono/jwt";

const app = new OpenAPIHono();

app.openapi(
  createRoute({
    method: "post",
    path: "/login",
    tags: ["Authenticate"],
    security: [], // without swagger UI jwt security
    responses: {
      200: {
        description: "Return TOKEN",
        content: {
          "application/json": {
            schema: z.object({
              message: z.string(),
              token: z.string(),
            }),
          },
        },
      },
    },
  }),
  async (c) => {
    const payload = {
      sub: "user123",
      role: "admin",
      exp: Math.floor(Date.now() / 1000) + 60 * 10, // Token expires in 10 minutes
    };
    const SignatureKey = "mySecretKey";
    const token = await sign(payload, SignatureKey);
    return c.json({ message: "token string", token: token });
  },
);

// app.post('/register', (ctx) => {
//     return ctx.json({ message: 'Register' });
// });

export default app;
