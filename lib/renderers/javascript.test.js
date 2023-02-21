import test from "ava";

var javascript = require("./javascript");

test("script execution", t => {
    t.plan(1);

    const message = { test: "foo" };
    const template = {
        language: "js",
        script: 'module.exports = message.test + "bar";'
    };

    return javascript.callback(message, template).then(res => {
        t.deepEqual(res, {
            rendered: "foobar",
            customFields: {},
            console: ""
        });
    });
});

test("unsported language rejected", async t => {
    t.plan(1);

    const message = { test: "foo" };
    const template = {
        language: "lua",
        script: "1 + 1;"
    };

    await t.throwsAsync(() => javascript.callback(message, template));
});

test("discard transmission", t => {
    t.plan(1);

    const message = { test: "foo" };
    const template = {
        language: "js",
        script: "DiscardTransmission();"
    };

    return javascript.callback(message, template).catch(err => {
        t.true(err.discard);
    });
});

test("save custom message", t => {
    t.plan(1);

    const message = { test: "foo" };
    const template = {
        language: "js",
        script: ' setMessageCustomFieldA("message a"); setMessageCustomFieldB("message b"); setTransmissionCustomFieldA("transmission a"); setTransmissionCustomFieldB("transmission b"); module.exports = message.test + "bar";'
    };

    return javascript.callback(message, template).then(res => {
        t.deepEqual(res, {
            rendered: "foobar",
            customFields: {
                messageFieldA: "message a",
                messageFieldB: "message b",
                transmissionFieldA: "transmission a",
                transmissionFieldA: "transmission b",
            },
            console: ""
        });
    });
});

test("exception format", t => {
    t.plan(1);

    const message = { test: "foo" };
    const template = {
        language: "js",
        script: "const a = 1\nb.test += 1;"
    };

    return javascript.callback(message, template).catch(err => {
        t.regex(err.message, /ReferenceError: b is not defined\n\s*at <isolated-vm>:2:1/);
    });
});

test("console log works", t => {
    t.plan(1);

    const message = { test: "foo" };
    const template = {
        language: "js",
        script: "console.log('Test!');"
    };

    return javascript
        .callback(message, template)
        .then(({ rendered, console }) => {
            t.is(console, "Test!\n");
        });
});

test("layers work", t => {
    t.plan(1);

    const message = { test: "foo" };
    const template = {
        layers: [1],
        language: "js",
        script:
            "const test = require('my-test-module'); console.log(test.test());"
    };
    const layers = [
        {
            id: 1,
            reference: "my-test-module",
            script: "module.exports.test = () => 'Hello, world!';"
        }
    ];

    return javascript
        .callback(message, template, layers)
        .then(({ rendered, console }) => {
            t.is(console, "Hello, world!\n");
        });
});

test("layer with error doesn't work", t => {
    t.plan(1);

    const message = { test: "foo" };
    const template = {
        layers: [1],
        language: "js",
        script:
            "const test = require('my-test-module'); console.log(test.test());"
    };
    const layers = [
        {
            id: 1,
            reference: "my-test-module",
            script: "bar = 1;"
        }
    ];

    return javascript
        .callback(message, template, layers)
        .then(() => {
            t.fail("Test should have caused an error.");
        })
        .catch(() => {
            t.pass();
        });
});
