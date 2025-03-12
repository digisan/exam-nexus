import { assertEquals } from "jsr:@std/assert";
import { getPublicIP } from "./util.ts"

Deno.test(async function getPubIP() {
    const ip = await getPublicIP();
    console.log("Public IP:", ip);
    assertEquals(typeof ip, "string");
});