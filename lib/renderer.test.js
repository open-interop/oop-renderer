import test from "ava";

import render from "./renderer";

test("mustache renders", async t => {
    const message = { value: "foobar" };
    const template = "{{{value}}}";

    const res = await render(message, template);

    t.is(res, "foobar");
});

test("mustache renders without escaping", async t => {
    const message = { value: "<>&\"'" };
    const template = "{{{value}}}";

    const res = await render(message, template);

    t.is(res, "<>&\"'");
});

test("mustache renders with escaping", async t => {
    const message = { value: "<>&\"'" };
    const template = "{{value}}";

    const res = await render(message, template);

    t.is(res, "&lt;&gt;&amp;&quot;&#39;");
});

test("mustache renders advanced", async t => {
    const message = { value: "foobar" };
    const template = { body: { language: "mustache", script: "{{{value}}}" } };

    const res = await render(message, template);

    t.is(res.body, "foobar");
});

test("advanced renders", async t => {
    const message = { value: 3 };
    const template = {
        language: "js",
        script: "module.exports = message.value + 3;"
    };

    const res = await render(message, template);

    t.is(res, "6");
});

test("mixed renders", async t => {
    const message = { value: "bar" };

    const template = {
        foo: "{{{value}}}",
        bar: {
            language: "js",
            script: "module.exports = message.value + 'baz';"
        },
        baz: ["val1", "{{{value}}}"]
    };

    const res = await render(message, template);

    t.deepEqual(res, { foo: "bar", bar: "barbaz", baz: ["val1", "bar"] });
});

test("can render concurrently", async t => {
    const message = { value: 42 };
    const template = {
        language: "js",
        script: `
            var fib = n => n == 1 || n == 2 ? 1 : fib(n - 1) + fib(n - 2);
            module.exports = fib(message.value);
        `
    };

    const promises = [];

    for (let i = 0; i < 5; ++i) {
        promises.push(render(message, template));
    }

    const res = await Promise.all(promises);

    t.deepEqual(res, new Array(5).fill("267914296"));
});
