import { app } from "@app/app.ts";

await import("@define/env.ts");
await import("@app/middleware/apply.ts");
await import("@app/routes/test.ts");
await import("@app/routes/home.ts"); // import 'routes' MUST AFTER middleware
await import("@app/routes/auth.ts");
await import("@app/routes/user.ts");
await import("@app/routes/config.ts");
await import("@app/routes/system.ts");
await import("@app/routes/exam.ts");
await import("@app/doc/openapi.ts"); // import 'doc' at the last

// 监听终止信号
const shutdown = async () => {
    console.log("Received shutdown signal. Shutting down...");
    setTimeout(() => {
        console.log("Server has been closed by exit()");
        Deno.exit();
    }, 5000);
    await server.shutdown();
    console.log("Server has been closed by shutdown()");
};

Deno.addSignalListener("SIGINT", shutdown);
Deno.addSignalListener("SIGBREAK", shutdown);
// Deno.addSignalListener("SIGTERM", shutdown); // only for linux

// **************************************************************** //

const port = 8001;
const server = Deno.serve({ port: port }, app.fetch);
