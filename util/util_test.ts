import { assertEquals } from "jsr:@std/assert";
import { getPublicIP, verifyHCaptcha } from "@util/util.ts"

Deno.test(async function getPubIP() {
    const ip = await getPublicIP();
    console.log("Public IP:", ip);
    assertEquals(typeof ip, "string");
});

Deno.test(async function verifyCaptcha() {
    const result = await verifyHCaptcha("adsfwe");
    if (result.isOk()) {
        console.log("Result:", result.value);
    } else {
        console.error("Error:", result.error);
    }
});
