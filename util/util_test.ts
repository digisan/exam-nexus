import { assertEquals } from "jsr:@std/assert";
import { arraysDiff, arraysSame, hasCertainProperty, lastElem, len } from "@util/util.ts";
import { getPublicIP } from "@util/net.ts";
import { verifyHCaptcha } from "@util/captcha.ts";

Deno.test("getPubIP", async () => {
    const ip = await getPublicIP();
    console.log("Public IP:", ip);
    assertEquals(typeof ip, "string");
});

Deno.test("verifyHCaptcha", async () => {
    const result = await verifyHCaptcha("adsfwe");
    if (result.isOk()) {
        console.log("Result:", result.value);
    } else {
        console.error("Error:", result.error);
    }
});

Deno.test("len", () => {
    console.log(len(null));
    console.log(len(undefined));
    console.log(len([]));
    console.log(len([123]));
});

Deno.test("lastElem", () => {
    console.log(lastElem(null));
    console.log(lastElem(undefined));
    console.log(lastElem([]));
    console.log(lastElem([123]));
});

Deno.test("hasCertainProperty", () => {
    const o = {
        a: 123,
        b: "str",
        next: {
            c: true,
        },
    };
    console.log(hasCertainProperty(o, "a", "number"));
    console.log(hasCertainProperty(o, "next.c", "boolean"));
    console.log(hasCertainProperty(o, "next.d", "boolean"));
});

Deno.test("arraysDiff", () => {
    console.log(arraysDiff([1, 2, 3, 4], [3, 1, 5]));
    console.log(arraysSame([1, 2, 3, 4], [3, 1, 5, 2]));
});
