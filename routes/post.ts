import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";

const app = new OpenAPIHono();

app.get("/", (ctx) => {
  return ctx.json({ message: "Post List" });
});

app.get("/:id", (ctx) => {
  const { id } = ctx.req.param();
  return ctx.json({ message: `Post details for ${id}` });
});

export default app;
