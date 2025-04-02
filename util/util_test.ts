import { assertEquals } from "jsr:@std/assert"
import { getPublicIP, verifyHCaptcha, bools2idx } from "@util/util.ts"

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

Deno.test(function Bools2Idx() {
    const r = bools2idx(true, true, false)
    console.log(r, r.toString(2).padStart(4, "0"))
});