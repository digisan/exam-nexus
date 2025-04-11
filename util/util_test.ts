import { assertEquals } from "jsr:@std/assert"
import { getPublicIP, verifyHCaptcha, bools2idx, len, lastElem } from "@util/util.ts"

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

Deno.test(function GetArrayLength() {
    console.log(len(null))
    console.log(len(undefined))
    console.log(len([]))
    console.log(len([123]))
});

Deno.test(function GetLastElement() {
    console.log(lastElem(null))
    console.log(lastElem(undefined))
    console.log(lastElem([]))
    console.log(lastElem([123]))
});